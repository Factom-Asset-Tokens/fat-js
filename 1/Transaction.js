const constant = require('../constant');
const nacl = require('tweetnacl/nacl-fast').sign;
const {Entry} = require('factom');
const fctUtil = require('factom/src/util');
const fctIdentityCrypto = require('factom-identity-lib/src/crypto');
const TransactionBuilder = require('./TransactionBuilder');

/**
 * Model A signed or unsigned FAT-1 Transaction
 * @alias Transaction1
 * @protected
 * @class
 */
class Transaction {

    /**
     * @constructor
     * @param {(TransactionBuilder|object)} builder - Either a TransactionBuilder object or a FAT-0 transaction object content
     */
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

            } if ( builder._signatures !== undefined ) {
                this._rcds = builder._keys.map(key => Buffer.concat([constant.RCD_TYPE_1, Buffer.from(key.publicKey)]));
                this._timestamp = builder._timestamp;
                this._signatures = builder._signatures;
                this._extIds = [this._timestamp.toString()];
                for (let i = 0; i < this._rcds.length; i++) {
                    this._extIds.push(this._rcds[i]);
                    this._extIds.push(this._signatures[i]);
                }
            } else { //otherwise normal transaction
                this._rcds = builder._keys.map(key => Buffer.concat([constant.RCD_TYPE_1, Buffer.from(key.publicKey)]));
                let sigIndexCounter = 0;
                let valid = true;
                this._signatures = builder._keys.map(key => {

                    const index = Buffer.from(sigIndexCounter.toString());
                    const timestamp = Buffer.from(unixSeconds.toString());
                    const chainId = Buffer.from(builder._tokenChainId, 'hex');
                    const content = Buffer.from(this._content);

                    sigIndexCounter++;
                    if ( key.secretKey !== undefined ) {
                        return nacl.detached(fctUtil.sha512(Buffer.concat([index, timestamp, chainId, content])), key.secretKey);
                    }
                    valid = false;
                    return undefined
                });
                for (let i = 0; valid && i < this._rcds.length; i++) {
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
            this._timestamp = builder.timestamp;
        }

        Object.freeze(this);
    }

    /**
     * @method
     * @returns {object} - The transaction's inputs
     */
    getInputs() {
        return this._inputs;
    }

    /**
     * @method
     * @returns {object} - The transaction's outputs
     */
    getOutputs() {
        return this._outputs;
    }

    /**
     * @method
     * @returns {*} - The transaction's metadata (if present, undefined if not)
     */
    getMetadata() {
        return this._metadata;
    }

    /**
     * @method
     * @returns {object[]} - The token metadata (if present, undefined if not)
     */
    getTokenMetadata() {
        return this._tokenMetadata;
    }

    /**
     * @method
     * @returns {boolean} - Whether the transaction is a coinbase transaction or not
     */
    isCoinbase() {
        return Object.keys(this._inputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC) !== undefined;
    }

    /**
     * Get the factom-js Entry object representing the signed FAT transaction. Can be submitted directly to Factom
     * @method
     * @see https://github.com/PaulBernier/factomjs/blob/master/src/entry.js
     * @returns {Entry} - Get the Factom-JS Factom entry representation of the transaction, including extids & other signatures
     * @example
     * const {FactomCli, Entry, Chain} = require('factom');
     const cli = new FactomCli(); // Default factomd connection to localhost:8088 and walletd connection to localhost:8089

     const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

     const tx = new TransactionBuilder(tokenChainId)
     .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", [150])
     .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [150])
     .build();

     //"cast" the entry object to prevent compatibility issues
     const entry = Entry.builder(tx.getEntry()).build();

     await cli.add(entry, "Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym"); //commit the transaction entry to the token chain
     */
    getEntry() {
        if (!this._tokenChainId) throw new Error('Can only get a valid Factom entry for a transaction built using TransactionBuilder');

        return Entry.builder()
            .chainId(this._tokenChainId)
            .extIds(this._extIds, 'utf8')
            .content(this._content, 'utf8')
            .build();
    }

    /**
     * @method
     * @returns {string} - Get the Factom chain ID of the transaction's token. Returns undefined if the Transaction was constructed from an object
     */
    getChainId() {
        return this._tokenChainId;
    }

    /**
     * @method
     * @returns {string} - Get the Factom entryhash of the transaction. Only defined if the Transaction was constructed from an object
     */
    getEntryhash() {
        return this._entryhash;
    }

    /**
     * @method
     * @returns {number} - Get the unix timestamp of when the Transaction was signed (locally built transactions) or committed to Factom (from RPC response JSON)
     */
    getTimestamp() {
        return this._timestamp;
    }

    /**
     * @method
     * @param keyindex {number} - The input index to marshal to prep for hashing then signing
     * @returns {Buffer} - Get the marshalled data that needs to be hashed then signed
     */
    getMarshalDataSig(keyindex) {
        return getMarshalDataSig(this, keyindex);
    }
    
    /**
     * @method - validate all the signatures agasint the inputs. useful for external signing.
     */  
    validateSignatures() {
        if ( this._signatures.length !== this._rcds.length ) {
            throw new Error("Invalid number of signatures to inputs")
        }
        for( let i = 0; i < this._rcds.length; ++i ) {
            if( !nacl.detached.verify(fctUtil.sha512(this.getMarshalDataSig(i)), this._signatures[i], Buffer.from(this._rcds[i], 1).slice(1)) ) {
                throw new Error("Invalid Transaction Signature for input " + i.toString())
            }
        }
        return true;
    }
}

/**
 * @method
 * @param keyindex {number} - The input index to marshal to prep for hashing then signing
 * @returns {Buffer} - Get the marshalled data that needs to be hashed then signed
 */
function getMarshalDataSig(tx,keyindex) {
    const index = Buffer.from(keyindex.toString());
    const timestamp = Buffer.from(tx._timestamp.toString());
    const chainId = Buffer.from(tx._tokenChainId, 'hex');
    const content = Buffer.from(tx._content);
    return Buffer.concat([index,timestamp,chainId,content]);
}

module.exports = Transaction;
