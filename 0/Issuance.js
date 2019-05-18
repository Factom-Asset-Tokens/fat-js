const nacl = require('tweetnacl/nacl-fast').sign;
const {Entry, Chain} = require('factom');
const util = require('../util');
const constant = require('../constant');
const fctCryptoValidation = require('factom-identity-lib/src/validation');
const fctIdentityCrypto = require('factom-identity-lib/src/crypto');
const fctIdentityUtil = require('factom-identity-lib/src/validation');
const fctUtil = require('factom/src/util');

/**
 * Build & Model A FAT-0 Issuance
 * @alias Issuance0
 * @public
 * @class
 */
class IssuanceBuilder {

    /**
     * @constructor
     * @param {string} tokenId - arbitrary string to use as a token identifier
     * @param {string} rootChainId - 64 character Factom Chain ID of the identity to issue the token under
     * @param {string} sk1 - SK1 Private key belonging to the identity at rootChainId
     */
    constructor(tokenId, rootChainId, sk1) {
        if (!fctIdentityUtil.isValidIdentityChainId(rootChainId)) throw new Error("You must include a valid issuer identity Root Chain Id to issue a FAT token");
        this._rootChainId = rootChainId;

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
        if (isNaN(supply)) throw new Error("Supply must be a number");
        if (supply === 0 || supply < -1) throw new Error("Supply must be equal to -1(infinite) or greater than 0");
        this._supply = supply;
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
            JSON.stringify(metadata)
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

        if (this._supply === undefined) this._supply = -1; //unlimited supply by default

        return new Issuance(this);
    }
}

class Issuance {
    constructor(builder) {

        if (builder instanceof IssuanceBuilder) {
            this._type = builder._type;
            this._symbol = builder._symbol;
            this._supply = builder._supply;
            this._metadata = builder._metadata;

            this._content = JSON.stringify({
                type: this._type,
                symbol: this._symbol,
                supply: this._supply,
                metadata: this._metadata
            });

            this._tokenId = builder._tokenId;
            this._rootChainId = builder._rootChainId;

            //handle issuance signing
            this._tokenChainId = util.getTokenChainId(builder._tokenId, builder._rootChainId);

            const index = Buffer.from('0');

            const unixSeconds = Math.round(new Date().getTime() / 1000).toString();
            this._timestamp = unixSeconds;

            const timestamp = Buffer.from(unixSeconds);
            const chainId = Buffer.from(this._tokenChainId, 'hex');
            const content = Buffer.from(this._content);

            const key = nacl.keyPair.fromSeed(fctIdentityCrypto.extractSecretFromIdentityKey(builder._sk1));

            const rcd = [Buffer.concat([constant.RCD_TYPE_1, Buffer.from(key.publicKey)])];

            const signature = [nacl.detached(fctUtil.sha512(Buffer.concat([index, timestamp, chainId, content])), key.secretKey)];

            this._extIds = [timestamp, rcd, signature];

        } else if (typeof builder === 'object') {
            this._type = builder.issuance.type;
            this._symbol = builder.issuance.symbol;
            this._supply = builder.issuance.supply;
            this._content = JSON.stringify(this);

            this._tokenId = builder.tokenid;
            this._rootChainId = builder.issuerid;
            this._tokenChainId = util.getTokenChainId(this._tokenId, this._rootChainId);
            this._entryhash = builder.entryhash;
            this._timestamp = builder.timestamp;
        }

        Object.freeze(this);
    }

    getTokenChainId() {
        return this._tokenChainId;
    }

    getTokenId() {
        return this._tokenId;
    }

    getIssuerIdentityRootChainId() {
        return this._rootChainId;
    }

    getEntryhash() {
        return this._entryhash;
    }

    getTimestamp() {
        return this._timestamp;
    }

    getType() {
        return this._type;
    }

    getSymbol() {
        return this._symbol;
    }

    getSupply() {
        return this._supply;
    }

    getMetadata() {
        return this._metadata;
    }

    getChain() {
        return new Chain(Entry.builder()
            .extId(Buffer.from("token"))
            .extId(Buffer.from(this._tokenId))
            .extId(Buffer.from("issuer"))
            .extId(Buffer.from(this._rootChainId, 'hex'))
            .build())
    }

    getEntry() {
        return Entry.builder()
            .chainId(this._tokenChainId)
            .extIds(this._extIds, 'utf8')
            .content(this._content, 'utf8')
            .build();
    }
}

module.exports = {
    IssuanceBuilder,
    Issuance
};