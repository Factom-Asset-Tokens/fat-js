const constant = require('../constant');
const nacl = require('tweetnacl/nacl-fast').sign;
const {Entry} = require('factom');
const fctAddressUtil = require('factom/src/addresses');
const fctUtil = require('factom/src/util');
const fctIdentityUtil = require('factom-identity-lib/src/validation');
const fctIdentityCrypto = require('factom-identity-lib/src/crypto');

class TransactionBuilder {
    constructor(tokenChainId) {
        if (!tokenChainId || tokenChainId.length !== 64) throw new Error('Token chain ID must be a valid Factom chain ID');
        this._tokenChainId = tokenChainId;

        this._keys = [];
        this._inputs = {};
        this._outputs = {};
    }

    input(fs, amount) {
        //if this is setup as coinbase, prevent additional inputs
        if (Object.keys(this._inputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) throw new Error('Cannot add an additional input to a coinbase transaction');

        if (!fctAddressUtil.isValidPrivateAddress(fs)) throw new Error("Input address must be a valid private Factoid address");

        if (!Number.isSafeInteger(amount)) throw new Error('Amount must be a safe integer (less than 2^53 - 1)');
        if (isNaN(amount) || !Number.isInteger(amount) || amount < 1) throw new Error("Input amount must be a positive nonzero integer");

        this._keys.push(nacl.keyPair.fromSeed(fctAddressUtil.addressToKey(fs)));
        this._inputs[fctAddressUtil.getPublicAddress(fs)] = amount;
        return this;
    }

    coinbaseInput(amount) {
        if (this._inputs.length > 0) throw new Error('Coinbase transactions may only have a single input');
        this.input(constant.COINBASE_ADDRESS_PRIVATE, amount);
        return this;
    }

    output(fa, amount) {
        if (!fctAddressUtil.isValidPublicFctAddress(fa)) throw new Error("Output address must be a valid public Factoid address");
        if (!Number.isSafeInteger(amount)) throw new Error('Amount must be a safe integer (less than 2^53 - 1)');
        if (isNaN(amount) || !Number.isInteger(amount) || amount < 1) throw new Error("Output amount must be a positive nonzero integer");

        this._outputs[fa] = amount;
        return this;
    }

    burnOutput(amount) {
        if (Object.keys(this._outputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) throw new Error('Cannot add a duplicate burn output to a burn transaction');
        this.output(constant.COINBASE_ADDRESS_PUBLIC, amount);
        return this;
    }

    setIssuerSK1(sk1) {
        if (!fctIdentityUtil.isValidSk1(sk1)) throw new Error("You must include a valid SK1 Key to sign a coinbase transaction");
        this._sk1 = sk1;
        return this;
    }

    metadata(metadata) {
        try {
            JSON.stringify(metadata)
        } catch (e) {
            throw new Error("Transaction metadata bust be a valid JSON object or primitive");
        }
        this._metadata = metadata;
        return this;
    }

    build() {
        if (Object.keys(this._inputs).length === 0 || Object.keys(this._outputs).length === 0) throw new Error("Must have at least one input and one output");

        const inputSum = Object.values(this._inputs).reduce((amount, sum) => amount + sum, 0);
        const outputSum = Object.values(this._outputs).reduce((amount, sum) => amount + sum, 0);
        if (inputSum !== outputSum) throw new Error("Input and output amount sums must match (" + inputSum + " != " + outputSum + ")");

        if (Object.keys(this._inputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) {
            if (!this._sk1) throw new Error('You must include a valid issuer sk1 key to perform a coinbase transaction')
        }

        return new Transaction(this);
    }
}

class Transaction {
    constructor(builder) {
        if (builder instanceof TransactionBuilder) {
            this._inputs = builder._inputs;
            this._outputs = builder._outputs;
            this._metadata = builder._metadata;

            this._content = JSON.stringify({inputs: this._inputs, outputs: this._outputs, metadata: this._metadata}); //snapshot the tx object

            const unixSeconds = Math.round(new Date().getTime() / 1000);
            this._timestamp = unixSeconds;

            this._extIds = [unixSeconds.toString()];

            this._tokenChainId = builder._tokenChainId;

            //handle coinbase tx
            if (Object.keys(this._inputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) {

                if (!builder._sk1) throw new Error("You must include a valid SK1 Key to sign a coinbase transaction");

                const index = Buffer.from('0');
                const timestamp = Buffer.from(unixSeconds.toString());
                const chainId = Buffer.from(builder._tokenChainId, 'hex');
                const content = Buffer.from(this._content);

                const key = nacl.keyPair.fromSeed(fctIdentityCrypto.extractSecretFromIdentityKey(builder._sk1));

                this._rcds = [Buffer.concat([constant.RCD_TYPE_1, Buffer.from(key.publicKey)])];

                this._signatures = [nacl.detached(fctUtil.sha512(Buffer.concat([index, timestamp, chainId, content])), key.secretKey)];

                this._extIds.push(this._rcds[0]);
                this._extIds.push(this._signatures[0]);

            } else { //otherwise normal transaction
                this._rcds = builder._keys.map(key => Buffer.concat([constant.RCD_TYPE_1, Buffer.from(key.publicKey)]));
                let sigIndexCounter = 0;
                this._signatures = builder._keys.map(key => {

                    const index = Buffer.from(sigIndexCounter.toString());
                    const timestamp = Buffer.from(unixSeconds.toString());
                    const chainId = Buffer.from(builder._tokenChainId, 'hex');
                    const content = Buffer.from(this._content);

                    sigIndexCounter++;
                    return nacl.detached(fctUtil.sha512(Buffer.concat([index, timestamp, chainId, content])), key.secretKey);
                });
                for (let i = 0; i < this._rcds.length; i++) {
                    this._extIds.push(this._rcds[i]);
                    this._extIds.push(this._signatures[i]);
                }
            }
        } else { //from object
            if (!builder.data.inputs) throw new Error("Valid FAT-0 transactions must include inputs");
            this._inputs = builder.data.inputs;

            if (!builder.data.outputs) throw new Error("Valid FAT-0 transactions must include outputs");
            this._outputs = builder.data.outputs;

            this._metadata = builder.data.metadata;

            this._entryhash = builder.entryhash;
            this._timestamp = builder.timestamp;
        }

        Object.freeze(this);
    }

    getInputs() {
        return this._inputs;
    }

    getOutputs() {
        return this._outputs;
    }

    getMetadata() {
        return this._metadata;
    }

    isCoinbase() {
        return Object.keys(this._inputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC) !== undefined;
    }

    getEntry() {
        if (!this._tokenChainId) throw new Error('Can only get a valid Factom entry for a transaction built using TransactionBuilder');

        return Entry.builder()
            .chainId(this._tokenChainId)
            .extIds(this._extIds, 'utf8')
            .content(this._content, 'utf8')
            .build();
    }

    getTokenChainId() {
        return this._tokenChainId;
    }

    getEntryhash() {
        return this._entryhash;
    }

    getTimestamp() {
        return this._timestamp;
    }
}

module.exports = {
    Transaction,
    TransactionBuilder
};