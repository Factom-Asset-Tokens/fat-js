const util = require('../util');
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

    input(fs, ids) {

        //if this is setup as coinbase, prevent additional inputs
        if (Object.keys(this._inputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) throw new Error('Cannot add an additional input to a coinbase transaction');

        if (!fctAddressUtil.isValidPrivateAddress(fs)) throw new Error("Input address must be a valid private Factoid address");
        if (!util.validateNFIds(ids)) throw new Error("Invalid ID range: " + JSON.stringify(ids));

        this._keys.push(nacl.keyPair.fromSeed(fctAddressUtil.addressToKey(fs)));
        this._inputs[fctAddressUtil.getPublicAddress(fs)] = ids;
        return this;
    }

    coinbaseInput(ids) {
        if (this._inputs.length > 0) throw new Error('Coinbase transactions may only have a single input');

        this.input(constant.COINBASE_ADDRESS_PRIVATE, ids);
        return this;
    }

    output(fa, ids) {
        if (!fctAddressUtil.isValidPublicFctAddress(fa)) throw new Error("Output address must be a valid public Factoid address");
        if (!util.validateNFIds(ids)) throw new Error("Invalid ID range: " + JSON.stringify(ids));

        // if (!Array.isArray(ids)) this._outputs[fa] = [ids];
        else this._outputs[fa] = ids;
        return this;
    }

    burnOutput(ids) {
        if (Object.keys(this._outputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) throw new Error('Cannot add a duplicate burn output to a burn transaction');
        this.output(constant.COINBASE_ADDRESS_PUBLIC, ids);
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

    tokenMetadata(tokenMetadata) {

        if (!Array.isArray(tokenMetadata)) throw new Error('Token metadata must be an array');
        if (!tokenMetadata.every(meta => typeof meta === 'object' && Object.keys(meta).length === 2 && meta.ids !== undefined && meta.metadata !== undefined)) throw new Error('Every metadata range representation must have only keys ids(Array) and metadata(JSON stringifiable value)');

        const allIds = tokenMetadata.reduce((all, rangeMeta) => {
            return all.concat(rangeMeta.ids);
        }, []);

        if (!util.validateNFIds(allIds)) throw new Error('Invalid token metadata, must not contain any duplicates or overlapping ranges');

        this._tokenMetadata = tokenMetadata;
        return this;
    }

    build() {
        if (Object.keys(this._inputs).length === 0 || Object.keys(this._outputs).length === 0) throw new Error("Must have at least one input and one output");

        if (Object.keys(this._inputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) {
            if (!this._sk1) throw new Error('You must include a valid issuer sk1 key to perform a coinbase transaction')
        }

        //evaluate the token ids in inputs/outputs. Should be the same set
        let allInputIds = [];
        Object.values(this._inputs).forEach(ids => allInputIds = allInputIds.concat(util.expandNFIds(ids)));
        allInputIds.sort();

        let allOutputIds = [];
        Object.values(this._outputs).forEach(ids => allOutputIds = allOutputIds.concat(util.expandNFIds(ids)));
        allOutputIds.sort();

        if (JSON.stringify(allInputIds) !== JSON.stringify(allOutputIds)) throw new Error('Input and output token IDS do not match');

        //restrict tokenmetadata to coinbase transactions
        if (this._tokenMetadata !== undefined && !Object.keys(this._inputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) throw new Error('You may only specify tokenmetadata for coinbase transactions');

        return new Transaction(this);
    }
}

class Transaction {
    constructor(builder) {
        if (builder instanceof TransactionBuilder) {
            this._inputs = builder._inputs;
            this._outputs = builder._outputs;
            this._metadata = builder._metadata;
            this._tokenMetadata = builder._tokenMetadata;

            this._content = JSON.stringify({
                inputs: this._inputs,
                outputs: this._outputs,
                metadata: this._metadata,
                tokenmetadata: this._tokenMetadata
            }); //snapshot the tx object

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
            if (!builder.data.inputs) throw new Error("Valid FAT-1 transactions must include inputs");
            this._inputs = builder.data.inputs;

            if (!builder.data.outputs) throw new Error("Valid FAT-1 transactions must include outputs");
            this._outputs = builder.data.outputs;

            this._metadata = builder.data.metadata;

            this._entryhash = builder.entryhash;
            this._timestamp = builder.timestamp;        }

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

    getTokenMetadata() {
        return this._tokenMetadata;
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