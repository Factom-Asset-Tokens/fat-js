const crypto = require('crypto');
const nacl = require('tweetnacl/nacl-fast').sign;
const fctAddressUtil = require('factom/src/addresses');
const fctUtil = require('factom/src/util');
const fctIdentityUtil = require('factom-identity-lib/src/validation');
const fctIdentityCrypto = require('factom-identity-lib/src/crypto');
const util = require('../util');

const RCD_TYPE_1 = Buffer.from('01', 'hex');
const COINBASE_ADDRESS_PUBLIC = 'FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC';
const COINBASE_ADDRESS_PRIVATE = 'Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj';

class TransactionBuilder {
    constructor(builder) {
        if (builder instanceof TransactionBuilder) {
            this._keys = builder._keys;
            this._inputs = builder._inputs;
            this._outputs = builder._outputs;
            this._blockheight = builder._blockheight;
            this._salt = builder._salt;
        } else {
            this._keys = [];
            this._inputs = [];
            this._outputs = [];
        }
    }

    input(fs, amount) {
        if (!fctAddressUtil.isValidPrivateAddress(fs)) throw new Error("Input address must be a valid private Factoid address");
        if (isNaN(amount) || !Number.isInteger(amount) || amount < 1) throw new Error("Input amount must be a positive nonzero integer");

        this._keys.push(nacl.keyPair.fromSeed(fctAddressUtil.addressToKey(fs)));
        this._inputs.push({address: fctAddressUtil.getPublicAddress(fs), amount: amount});
        return this;
    }

    coinbaseInput(amount) {
        this.input(COINBASE_ADDRESS_PRIVATE, amount);
        return this;
    }

    output(fa, amount) {
        if (!fctAddressUtil.isValidFctPublicAddress(fa)) throw new Error("Input address must be a valid public Factoid address");
        if (isNaN(amount) || !Number.isInteger(amount) || amount < 1) throw new Error("Input amount must be a positive nonzero integer");

        this._outputs.push({address: fa, amount: amount});
        return this;
    }

    setIssuerInformation(rootChainId, tokenId, sk1) {
        if (!fctIdentityUtil.isValidIdentityChainId(rootChainId)) throw new Error("You must include a valid Root Chain ID to create a coinbase transaction");
        if (!fctIdentityUtil.isValidSk1(sk1)) throw new Error("You must include a valid SK1 Key to sign a coinbase transaction");
        this._rootChainId = rootChainId;
        this._sk1 = sk1;
        this._tokenId = tokenId;
        return this;
    }
    
    blockheight(blockheight) {
        if (isNaN(blockheight) || !Number.isInteger(blockheight)) throw new Error("Blockheight must be a positive nonzero integer");
        this._blockheight = blockheight;
        return this;
    }

    salt(salt) {
        if (!typeof salt === 'string' || !salt instanceof String) throw new Error("Salt must be a string");
        this._salt = salt;
        return this;
    }

    build() {
        if (!Number.isInteger(this._blockheight) || this._blockheight < 0) throw new Error("Blockheight is required, and must be an unsigned integer");

        if (this._inputs.length === 0 || this._outputs.length === 0) throw new Error("Must have at least one input and one output");

        const inputSum = this._inputs.reduce((input, sum) => input.amount + sum, 0);
        const outputSum = this._outputs.reduce((output, sum) => output.amount + sum, 0);

        if (inputSum !== outputSum) throw new Error("Input and output amount sums must match (" + inputSum + " != " + outputSum + ")");
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
            this.blockheight = builder._blockheight;
            this.salt = builder._salt || crypto.randomBytes(32).toString('hex');

            this.content = JSON.stringify(this);

            this.extIds = [];

            if (builder._keys.length > 0) {
                this.rcds = builder._keys.map(key => Buffer.concat([RCD_TYPE_1, Buffer.from(key.publicKey)]));
                this.signatures = builder._keys.map(key => Buffer.from(nacl.detached(Buffer.from(this.content), key.secretKey)));
                for (let i = 0; i < rcds.length; i++) {
                    this.extIds.push(rcds[i]);
                    this.extIds.push(signatures[i]);
                }
            }

            //handle coinbase tx
            if (this.inputs.find(input => input.address === COINBASE_ADDRESS_PUBLIC)) {
                if (!builder._sk1) throw new Error("You must include a valid SK1 Key to sign a coinbase transaction");
                this.extIds.push(fctIdentityCrypto.sign(builder._sk1, util.getTransactionChainId(builder._tokenId, builder._rootChainId) + this.content));
            }

            validateRcds(this.inputs, this.rcds);
            validateSignatures(Buffer.from(this.content), this.rcds, this.signatures);
        } else if (typeof builder === 'object') {
            this.txId = builder.txId;
            this.inputs = builder.inputs;
            this.outputs = builder.outputs;
            this.blockheight = builder.blockheight;
            this.timestamp = builder.timestamp;
            this.salt = builder.salt;
            this.extIds = builder.extIds;

            let extIdsCopy = Array.from(this.extIds);

            //if there's a coinbase sig on the end, pop it off (FATIP-101)
            if (extIdsCopy.length % 2 !== 0) extIdsCopy.pop();

            while (extIdsCopy.length > 0) {
                this.rcds.push(extIdsCopy[0]);
                extIdsCopy.pop();
                this.signatures.push(extIdsCopy[0]);
                extIdsCopy.pop();
            }

            this.content = JSON.stringify({
                inputs: this.inputs,
                outputs: this.outputs,
                milliTimestamp: this.timestamp,
                salt: this.salt
            });
        }

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

    getBlockheight() {
        return this.blockheight;
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
        return this.inputs.find(input => input.address === COINBASE_ADDRESS_PUBLIC) !== undefined;
    }

    isValid() {
        try {
            validateRcds(this.inputs, this.rcds);
            validateSignatures(Buffer.from(this.content), this.rcds, this.signatures);
            return true;
        } catch (e) {
            return false;
        }
    }

    toObject() {
        return JSON.parse(this.content);
    }
}

function validateRcds(inputs, rcds) {
    if (rcds.length !== inputs.length) {
        throw new Error(`The number of RCDs (${rcds.length}) does not equal the number of inputs (${inputs.length}).`);
    }
    for (let i = 0; i < rcds.length; ++i) {
        validateRcdHash(inputs[i], rcds[i]);
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