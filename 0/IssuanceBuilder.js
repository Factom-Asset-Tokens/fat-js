const fctCryptoValidation = require('factom-identity-lib/src/validation');
const fctIdentityUtil = require('factom-identity-lib/src/validation');
const BigNumber = require('bignumber.js');
const JSONBig = require('json-bigint')({strict: true});

/**
 * Build & Model A FAT-0 Issuance
 * @alias IssuanceBuilder0
 * @public
 * @class
 */
class IssuanceBuilder {

    /**
     * @constructor
     * @param {string} tokenId - arbitrary string to use as a token identifier
     * @param {string} identityChainId - 64 character Factom Chain ID of the identity to issue the token under
     * @param {string} sk1 - SK1 Private key belonging to the identity at identityChainId
     */
    constructor(tokenId, identityChainId, sk1) {
        if (!fctIdentityUtil.isValidIdentityChainId(identityChainId)) throw new Error("You must include a valid issuer identity Root Chain Id to issue a FAT token");
        this._rootChainId = identityChainId;

        if (tokenId === undefined || typeof tokenId !== 'string') throw new Error('Token is a required string');
        this._tokenId = tokenId;

        if (!fctCryptoValidation.isValidSk1(sk1)) throw new Error("Supplied key is not a valid sk1 private key");
        this._sk1 = sk1;

        this._type = 'FAT-0'
    }

    /**
     * Set a symbol for the token
     * @method
     * @param {string} symbol - arbitrary string to use as a token symbol identifier. e.x. MYT
     * @returns {IssuanceBuilder}
     */
    symbol(symbol) {
        if (!symbol) throw new Error("Token symbol must be defined");
        if (!new RegExp('[A-Z ]+').test(symbol)) throw new Error("Token symbol must only contain capital letters A-Z");
        if (symbol.length == 0 || symbol.length > 4) throw new Error("Token symbol must be 1 - 4 characters");
        this._symbol = symbol;
        return this;
    }

    /**
     * Set a maximum circulating supply for the token
     * @method
     * @param {number} supply - An integer maximum circulating supply to allow for the token. May be -1 for infinite, otherwise must be greater than 0
     * @returns {IssuanceBuilder}
     */
    supply(supply) {
        supply = new BigNumber(supply);
        if (supply.isEqualTo(0) || supply.isLessThan(-1)) throw new Error("Supply must be equal to -1(infinite) or greater than 0");
        this._supply = supply;
        return this;
    }

    /**
     * Set a decimal precision for the token.
     * @method
     * @param {number} precision - Must be an integer between 0 and 18 inclusive
     * @returns {IssuanceBuilder}
     */
    precision(precision) {
        if (isNaN(precision) || !Number.isInteger(precision) || precision < 0 || precision > 18) throw new Error("Precision must be an integer between 0 and 18");
        this._precision = precision;
        return this;
    }

    /**
     * Set arbitrary metadata for the token issuance
     * @method
     * @param {*} metadata - The metadata. Must be JSON stringifyable
     * @returns {IssuanceBuilder}
     */
    metadata(metadata) {
        try {
            JSONBig.stringify(metadata)
        } catch (e) {
            throw new Error("Transaction metadata bust be a valid JSON object or primitive");
        }
        this._metadata = metadata;
        return this;
    }

    /**
     * Build the issuance
     * @method
     * @returns {Issuance}
     */
    build() {
        //validate required fields

        if (this._supply === undefined) this._supply = new BigNumber(-1); //unlimited supply by default

        return new (require('./Issuance'))(this);
    }
}

module.exports = IssuanceBuilder;