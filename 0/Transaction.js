const crypto = require('crypto');
const nacl = require('tweetnacl/nacl-fast').sign;
const {Entry} = require('factom');
const fctAddressUtil = require('factom/src/addresses');
const fctUtil = require('factom/src/util');
const fctIdentityUtil = require('factom-identity-lib/src/validation');
const fctIdentityCrypto = require('factom-identity-lib/src/crypto');
const util = require('../util');

const RCD_TYPE_1 = Buffer.from('01', 'hex');
const COINBASE_ADDRESS_PUBLIC = 'FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC';
const COINBASE_ADDRESS_PRIVATE = 'Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj';

class TransactionBuilder {
    constructor(tokenChainId) {

        // if (!fctIdentityUtil.isValidIdentityChainId(tokenChainId)) throw new Error("You must include a valid Root Chain ID to create a coinbase transaction");
        this._tokenChainId = tokenChainId;

        this._keys = [];
        this._inputs = {};
        this._outputs = {};
    }

    input(fs, amount) {
        if (!fctAddressUtil.isValidPrivateAddress(fs)) throw new Error("Input address must be a valid private Factoid address");
        if (isNaN(amount) || !Number.isInteger(amount) || amount < 1) throw new Error("Input amount must be a positive nonzero integer");

        this._keys.push(nacl.keyPair.fromSeed(fctAddressUtil.addressToKey(fs)));
        this._inputs[fctAddressUtil.getPublicAddress(fs)] = amount;
        return this;
    }

    coinbaseInput(amount) {
        this.input(COINBASE_ADDRESS_PRIVATE, amount);
        return this;
    }

    output(fa, amount) {
        if (!fctAddressUtil.isValidFctPublicAddress(fa)) throw new Error("Input address must be a valid public Factoid address");
        if (isNaN(amount) || !Number.isInteger(amount) || amount < 1) throw new Error("Input amount must be a positive nonzero integer");

        this._outputs[fa] = amount;
        return this;
    }

    setIssuerSK1(sk1) {
        if (!fctIdentityUtil.isValidSk1(sk1)) throw new Error("You must include a valid SK1 Key to sign a coinbase transaction");
        this._sk1 = sk1;
        return this;
    }

    build() {
        if (Object.keys(this._inputs).length === 0 || Object.keys(this._outputs).length === 0) throw new Error("Must have at least one input and one output");

        const inputSum = Object.values(this._inputs).reduce((amount, sum) => amount + sum, 0);
        const outputSum = Object.values(this._outputs).reduce((amount, sum) => amount + sum, 0);
        if (inputSum !== outputSum) throw new Error("Input and output amount sums must match (" + inputSum + " != " + outputSum + ")");

        // this._salt = crypto.randomBytes(32).toString('hex');

        return new Transaction(this);
    }
}

class Transaction {
    constructor(builder) {
        let rcds = [];
        let signatures = [];

        if (builder instanceof TransactionBuilder) {
            this.inputs = builder._inputs;
            this.outputs = builder._outputs;
            this.salt = builder._salt;

            this.content = JSON.stringify(this); //snapshot the tx object

            const unixSeconds = Math.round(new Date().getTime() / 1000);

            this.extIds = [unixSeconds.toString()];

            this.tokenChainId = builder._tokenChainId;

            if (builder._keys.length > 0) {
                this.rcds = builder._keys.map(key => Buffer.concat([RCD_TYPE_1, Buffer.from(key.publicKey)]));
                let sigIndexCounter = 0;
                this.signatures = builder._keys.map(key => {

                    const index = Buffer.from(sigIndexCounter.toString());
                    const timestamp = Buffer.from(unixSeconds.toString());
                    const chainId = Buffer.from(builder._tokenChainId);
                    const content = Buffer.from(this.content);

                    const data = Buffer.concat([index, timestamp, chainId, content]);
                    const dataHash = fctUtil.sha256(data);
                    
                    sigIndexCounter++;
                    return nacl.detached(dataHash, key.secretKey);
                });
                for (let i = 0; i < this.rcds.length; i++) {
                    this.extIds.push(this.rcds[i]);
                    this.extIds.push(this.signatures[i]);
                }
            }

            //handle coinbase tx
            if (Object.keys(this.inputs).find(address => address === COINBASE_ADDRESS_PUBLIC)) {
                if (!builder._sk1) throw new Error("You must include a valid SK1 Key to sign a coinbase transaction");
                this.extIds.push(fctIdentityCrypto.sign(builder._sk1, builder._tokenChainId + this.content));
            }

            validateRcds(this.inputs, this.rcds);
            // validateSignatures(Buffer.from(this.content), this.rcds, this.signatures);
        } else throw new Error('Transaction may only be instantiated by TransactionBuilder');

        Object.freeze(this);
    }

    getInputs() {
        return this.inputs;
    }

    getOutputs() {
        return this.outputs;
    }

    getTimestamp() {
        return this.timestamp;
    }

    getSalt() {
        return this.salt;
    }

    getTxId() {
        return this.txId;
    }

    getExtIds() {
        return this.extIds;
    }

    getContent() {
        return this.content;
    }

    isCoinbase() {
        return Object.keys(this.inputs).find(address => address === COINBASE_ADDRESS_PUBLIC) !== undefined;
    }

    isValid() {
        try {
            validateRcds(this.inputs, this.rcds);
            // validateSignatures(Buffer.from(this.content), this.rcds, this.signatures);
            return true;
        } catch (e) {
            return false;
        }
    }

    getEntry() {
        return Entry.builder()
            .chainId(Buffer.from(this.tokenChainId))
            .extIds(this.getExtIds(), 'utf8')
            .content(Buffer.from(this.getContent()), 'utf8')
            .build();
    }

    toObject() {
        return JSON.parse(this.content);
    }
}

function validateRcds(inputs, rcds) {
    if (rcds.length !== Object.keys(inputs).length) {
        throw new Error(`The number of RCDs (${rcds.length}) does not equal the number of inputs (${inputs.length}).`);
    }
    for (let i = 0; i < rcds.length; ++i) {
        const input = {address: Object.keys(inputs)[i], amount: Object.values(inputs)[i]};

        validateRcdHash(input, rcds[i]);
    }
}

function validateRcdHash(input, rcd) {
    if (!fctUtil.sha256d(rcd).equals(fctAddressUtil.addressToRcdHash(input.address))) {
        throw new Error(`RCD does not match the RCD hash from input address ${input.address}.`);
    }
}

function validateSignatures(data, rcds, signatures) {
    if (rcds.length !== signatures.length) {
        throw new Error(`The number of RCDs (${rcds.length}) does not equal the number of signatures (${signatures.length})`);
    }
    for (let i = 0; i < signatures.length; ++i) {
        validateSignature(data, rcds[i], signatures[i]);
    }
}

function validateSignature(data, rcd, signature) {
    if (rcd[0] !== 1) {
        throw new Error(`Only RCD type 1 is currently supported. Invalid RCD: ${rcd}.`);
    }

    const publicKey = Buffer.from(rcd, 1).slice(1);

    if (!nacl.detached.verify(data, signature, publicKey)) {
        throw new Error('Signature of Transaction is invalid.');
    }
}

module.exports = {
    Transaction,
    TransactionBuilder
};