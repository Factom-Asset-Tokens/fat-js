const nacl = require('tweetnacl/nacl-fast').sign;
const {Entry, Chain} = require('factom');
const util = require('../util');
const constant = require('../constant');
const fctIdentityCrypto = require('factom-identity-lib/src/crypto');
const fctUtil = require('factom/src/util');
const BigNumber = require('bignumber.js');
const JSONBig = require('json-bigint')({strict: true});

const IssuanceBuilder = require('./IssuanceBuilder');

/**
 * Build & Model A FAT-0 Issuance
 * @alias Issuance0
 * @public
 * @class
 */
class Issuance {

    /**
     * @constructor
     * @param {(IssuanceBuilder | Object)} builder - The IssuanceBuilder or object to construct the issuance from
     */
    constructor(builder) {

        if (builder instanceof IssuanceBuilder) {
            this._type = builder._type;
            this._symbol = builder._symbol;
            this._supply = builder._supply;
            this._precision = builder._precision;
            this._metadata = builder._metadata;

            this._content = JSONBig.stringify({
                type: this._type,
                symbol: this._symbol,
                supply: this._supply,
                precision: this._precision,
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

            const rcd = Buffer.concat([constant.RCD_TYPE_1, Buffer.from(key.publicKey)]);

            const signature = nacl.detached(fctUtil.sha512(Buffer.concat([index, timestamp, chainId, content])), key.secretKey);

            this._extIds = [timestamp, rcd, signature];

        } else if (typeof builder === 'object') {
            this._type = builder.issuance.type;
            this._symbol = builder.issuance.symbol;
            this._supply = new BigNumber(builder.issuance.supply);
            this._precision = builder.issuance.precision;
            this._metadata = builder.issuance.metadata;

            this._tokenId = builder.tokenid;
            this._rootChainId = builder.issuerid;
            this._tokenChainId = util.getTokenChainId(this._tokenId, this._rootChainId);
            this._entryhash = builder.entryhash;
            this._timestamp = builder.timestamp;
        }

        Object.freeze(this);
    }

    /**
     * Get the Factom Chain ID for this token issuance
     * @method
     * @returns {string} - The Factom Chain ID calculated from rootChainID and tokenId
     */
    getChainId() {
        return this._tokenChainId;
    }

    /**
     * Get the token ID string for this token issuance
     * @method
     * @returns {string} - The token ID string chosen by the issuer
     */
    getTokenId() {
        return this._tokenId;
    }

    /**
     * Get identity's Factom Chain ID string for this token
     * @method
     * @returns {string} - The token ID string chosen by the issuer
     */
    getIssuerChainId() {
        return this._rootChainId;
    }

    /**
     * Get the entryhash of this issuance object. Only populated for entries parsed from fatd
     * @method
     * @returns {string} - The Factom Entryhash
     */
    getEntryhash() {
        return this._entryhash;
    }

    /**
     * Get the timestamp in unix seconds of when this issuance object was signed
     * @method
     * @returns {number} - The signing timestamp
     */
    getTimestamp() {
        return this._timestamp;
    }

    /**
     * Get the type string constant of which type of FAT token this issuance represent
     * @method
     * @returns {string} - Returns "FAT-0"
     */
    getType() {
        return this._type;
    }

    /**
     * Get the symbol string of this FAT token represent. E.x. MYT
     * @method
     * @returns {string} - The symbol string chosen by the issuer
     */
    getSymbol() {
        return this._symbol;
    }

    /**
     * Get the maximum circulating supply for this FAT token issuance
     * @method
     * @returns {BigNumber} [supply=-1] - The maximum number of circulating tokens allowed
     */
    getSupply() {
        return this._supply;
    }

    /**
     * Get the decimal precision for this FAT token issuance
     * @method
     * @returns {BigNumber} [precision=undefined] - The decimal precision of the tokens base units in relation to display units
     */
    getPrecision() {
        return this._precision;
    }

    /**
     * Get the metadata included with the FAT token issuance, if present
     * @method
     * @returns {*} - The issuances's metadata (if present, undefined if not)
     */
    getMetadata() {
        return this._metadata;
    }

    /**
     * Get the Chain object representing the the token chain, including the first entry (chain establishment entry)
     * Can be submitted directly to Factom using factom-js. After the chain is established the signed issuance entry
     * may be placed on the new chain to issue the token (via getEntry())
     * @method
     * @see https://github.com/PaulBernier/factomjs/blob/master/src/chain.js
     * @returns {Chain} - The Chain object for the issuance
     */
    getChain() {
        return new Chain(Entry.builder()
            .extId(Buffer.from("token"))
            .extId(Buffer.from(this._tokenId))
            .extId(Buffer.from("issuer"))
            .extId(Buffer.from(this._rootChainId, 'hex'))
            .build())
    }

    /**
     * Get the Entry object representing the initialization entry (token establishment entry)
     * Can be submitted directly to Factom
     * @method
     * @see https://github.com/PaulBernier/factomjs/blob/master/src/entry.js
     * @returns {Entry} - The complete entry establishing the token's issuance
     * @example
     * const {FactomCli, Entry, Chain} = require('factom');

     const cli = new FactomCli(); // Default factomd connection to localhost:8088 and walletd connection to localhost:8089

     const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

     const issuance = new IssuanceBuilder("mytoken", "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
     .symbol('TTK')
     .supply(1000000)
     .metadata({'abc': 123})
     .build();

     //"cast" the chain and entry objects to prevent compatibility issues
     const chain = new Chain(Entry.builder(issuance.getChain().firstEntry).build());
     const entry = Entry.builder(issuance.getEntry()).build();

     await cli.add(chain, "Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym"); //create the token chain on Factom
     await cli.add(entry, "Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym"); //commit the signed issuance entry to the token chain
     */
    getEntry() {
        return Entry.builder()
            .chainId(this._tokenChainId)
            .extIds(this._extIds, 'utf8')
            .content(this._content, 'utf8')
            .build();
    }
}

module.exports = Issuance;