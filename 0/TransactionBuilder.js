const constant = require('../constant');
const nacl = require('tweetnacl/nacl-fast').sign;
const fctAddressUtil = require('factom/src/addresses');
const fctIdentityUtil = require('factom-identity-lib/src/validation');
const BigNumber = require('bignumber.js');

/**
 * Build & Model A FAT-0 Transaction
 * @alias TransactionBuilder0
 * @public
 * @class
 *
 * @example
 * const TransactionBuilder = require('fat-js').FAT0.TransactionBuilder
 *
 * const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';
 *
 * let tx = new TransactionBuilder(tokenChainId)
 * .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
 * .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
 * .build();
 *
 * //coinbase transaction
 * tx = new TransactionBuilder(tokenChainId)
 * .coinbaseInput(10)
 * .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
 * .sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
 * .build();
 *
 * //burn transaction
 * tx = new TransactionBuilder(tokenChainId)
 * .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
 * .burnOutput(150)
 * .build();
 *
 * //transaction metadata
 * tx = new TransactionBuilder(tokenChainId)
 * .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
 * .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
 * .metadata({type: 'fat-js test run', timestamp: new Date().getTime()})
 * .build();
 */
class TransactionBuilder {

    /**
     * @constructor
     * @param {Transaction|string} Transaction or tokenChainId - Unsigned transaction or 64 character Factom Chain ID of the token to build the transaction for
     */
    constructor(t) {
        if ( t instanceof (require('./Transaction')) ) {
            //support for external signatures
            this._signatures = t._signatures;
            this._keys = t._rcds.map(rcd => { return {'publicKey':Buffer.from(rcd, 1).slice(1)} } );
            this._tokenChainId = t._tokenChainId;
            this._inputs = t._inputs;
            this._outputs = t._outputs;
            this._timestamp = t._timestamp;
            if ( t._metadata !== undefined ) {
                this._metadata = t._metadata;
            }
        } else {
            let tokenChainId = t;
            if (!tokenChainId || tokenChainId.length !== 64) throw new Error('Token chain ID must be a valid Factom chain ID');
            this._tokenChainId = tokenChainId;

            this._keys = [];
            this._inputs = {};
            this._outputs = {};
        } 
    }

    /**
     * Set up a Factoid address input for the transaction
     * @method
     * @param {string} fs - The private Factoid address to use as the input of the transaction or raw public key if signing externally
     * @param {(number|string|BigNumber)} amount - The integer amount of token units to send. Native JS Numbers (e.x. 123), strings (e.x. "123"), and BigNumbers(e.x. new BigNumber("9999999999999999") are allowed as long as they represent integers
     * @returns {TransactionBuilder}
     */
    input(fs, amount) {

        if ( this._signatures !== undefined ) {
            throw new Error("Attempting to add new input, expecting signatures only")
        }
        //if this is setup as coinbase, prevent additional inputs
        if (Object.keys(this._inputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) throw new Error('Cannot add an additional input to a coinbase transaction');

        //if it isn't a private address and instead a public address then, the fs should be a public key      
        if (fctAddressUtil.isValidPrivateAddress(fs)) { //first check to see if valid private address

            amount = new BigNumber(amount);
            if (!amount.isInteger() || amount.isLessThan(1)) throw new Error("Input amount must be a positive nonzero integer");

            //check that outputs does not contain this address
            if (this._outputs[fctAddressUtil.getPublicAddress(fs)]) throw new Error("Input address already occurs in outputs");

            this._keys.push(nacl.keyPair.fromSeed(fctAddressUtil.addressToKey(fs)));
            this._inputs[fctAddressUtil.getPublicAddress(fs)] = amount;

        } else {

            if ( fctAddressUtil.isValidPublicFctAddress(fs) ) { //check to see if user passed in a public fct address
              throw new Error("Input address must be either a valid private Factoid address or a Factoid public key");
            }

            amount = new BigNumber(amount);
            if (!amount.isInteger() || amount.isLessThan(1)) throw new Error("Input amount must be a positive nonzero integer");

            // we'll have to assume that the fs is really the publicKey if we get this far, ultimately the tx will fail if not
            let pubkey = fs;

            //this will throw exception if not right length
            let pubaddr = fctAddressUtil.keyToPublicFctAddress(pubkey);

            //check that outputs does not contain this address
            if (this._outputs[pubaddr]) throw new Error("Input address already occurs in outputs");

            this._keys.push({publicKey: pubkey});
            this._inputs[pubaddr] = amount;
        }
        return this;
    }

    /**
     * Set up a coinbase input for the transaction, which mints tokens
     * @method
     * @param {(number|string|BigNumber)} amount - The integer amount of token units to send. Native JS Numbers (e.x. 123), strings (e.x. '123'), and BigNumbers(e.x. new BigNumber("9999999999999999") are allowed as long as they represent integers
     * @returns {TransactionBuilder}
     */
    coinbaseInput(amount) {
        if (this._inputs.length > 0) throw new Error('Coinbase transactions may only have a single input');
        this.input(constant.COINBASE_ADDRESS_PRIVATE, amount);
        return this;
    }

    /**
     * Set up a Factoid address output for the transaction
     * @method
     * @param {string} fa - The public Factoid address destination of the output
     * @param {(number|string|BigNumber)} amount - The integer amount of token units to receive at the destination address. Native JS Numbers (e.x. 123), strings (e.x. "123"), and BigNumbers(e.x. new BigNumber("9999999999999999") are allowed as long as they represent integers
     * @returns {TransactionBuilder}
     */
    output(fa, amount) {

        if ( this._signatures !== undefined ) {
            throw new Error("Attempting to add new output, expecting signatures only")
        }

        if (!fctAddressUtil.isValidPublicFctAddress(fa)) throw new Error("Output address must be a valid public Factoid address");

        amount = new BigNumber(amount);
        if (!amount.isInteger() || amount.isLessThan(1)) throw new Error("Input amount must be a positive nonzero integer");

        //check that inputs does not contain this address
        if (this._inputs[fa]) throw new Error("Output address already occurs in inputs");

        this._outputs[fa] = amount;
        return this;
    }

    /**
     * Set up a burn output for the transaction, which will destroy tokens
     * @method
     * @param {(number|string|BigNumber)} amount - The integer amount of token units to receive at the destination address. Native JS Numbers (e.x. 123), strings (e.x. "123"), and BigNumbers(e.x. new BigNumber("9999999999999999") are allowed as long as they represent integers
     * @returns {TransactionBuilder}
     */
    burnOutput(amount) {
        if (Object.keys(this._outputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) throw new Error('Cannot add a duplicate burn output to a burn transaction');
        this.output(constant.COINBASE_ADDRESS_PUBLIC, amount);
        return this;
    }

    /**
     * @method
     * @param {string} sk1 - The SK1 private key string of the issuing identity
     * @returns {TransactionBuilder}
     */
    sk1(sk1) {
        if (!fctIdentityUtil.isValidSk1(sk1)) throw new Error("You must include a valid SK1 Key to sign a coinbase transaction");
        this._sk1 = sk1;
        return this;
    }

    /**
     * Set arbitrary metadata for the transaction
     * @method
     * @param {*} metadata - The metadata. Must be JSON stringifyable
     * @returns {TransactionBuilder}
     */
    metadata(metadata) {
        if ( this._signatures !== undefined ) {
            throw new Error("Attempting to add new metadata, expecting signatures only")
        }
        try {
            JSON.stringify(metadata)
        } catch (e) {
            throw new Error("Transaction metadata bust be a valid JSON object or primitive");
        }
        this._metadata = metadata;
        return this;
    }

    /**
     * Add a public key and signature to the transaction. This is used only in the case of unsigned transactions (usefull for hardware wallets).
     * Public Key's /signatures need to be added in the same order as their corresponding inputs.
     * @param {string|Array|Buffer} publicKey - FCT public key as hex string, uint8array, or buffer
     * @param {Buffer} signature - Signature 
     * @returns {TransactionBuilder} - TransactionBuilder instance.
     */
    pkSignature(publicKey, signature) {

        let pk = Buffer.from(publicKey,'hex')

        let index = Object.values(this._keys).findIndex( v => { return v.publicKey.equals(pk) } );

        if ( index !== undefined ) {
            this._signatures[index] = signature
        } else {
            throw new Error("Public Key (" + pk.toString('hex') + ") for provided signature not found in input list." )
        }
        return this;
    }

    /**
     * Build the transaction
     * @method
     * @returns {Transaction}
     */
    build() {
        if (Object.keys(this._inputs).length === 0 || Object.keys(this._outputs).length === 0) throw new Error("Must have at least one input and one output");

        const inputSum = Object.values(this._inputs).reduce((amount, sum) => amount.plus(sum), new BigNumber(0));
        const outputSum = Object.values(this._outputs).reduce((amount, sum) => amount.plus(sum), new BigNumber(0));
        if (!inputSum.isEqualTo(outputSum)) throw new Error("Input and output amount sums must match (" + inputSum + " != " + outputSum + ")");

        if (Object.keys(this._inputs).find(address => address === constant.COINBASE_ADDRESS_PUBLIC)) {
            if (!this._sk1) throw new Error('You must include a valid issuer sk1 key to perform a coinbase transaction')
        }

        if ( this._signatures !== undefined ) {
            for (let i = 0; i < this._signatures.length; ++i) {
                if ( this._signatures[i] === undefined ) {
                    throw new Error('Missing signatures: All inputs must have an associated signature')
                }
            }
        }

        return new (require('./Transaction'))(this);
    }
}

module.exports = TransactionBuilder;
