const nacl = require('tweetnacl/nacl-fast').sign;
const {Entry, Chain} = require('factom');
const util = require('../util');
const fctCryptoValidation = require('factom-identity-lib/src/validation');
const fctIdentityCrypto = require('factom-identity-lib/src/crypto');
const fctIdentityUtil = require('factom-identity-lib/src/validation');
const fctUtil = require('factom/src/util');

const RCD_TYPE_1 = Buffer.from('01', 'hex');


class IssuanceBuilder {

    constructor(tokenId, rootChainId, sk1) {
        if (!fctIdentityUtil.isValidIdentityChainId(rootChainId)) throw new Error("You must include a valid issuer identity Root Chain Id to issue a FAT token");
        this._rootChainId = rootChainId;

        if (tokenId === undefined || typeof tokenId !== 'string') throw new Error('Token is a required string');
        this._tokenId = tokenId;

        if (!fctCryptoValidation.isValidSk1(sk1)) throw new Error("Supplied key is not a valid sk1 private key");
        this._sk1 = sk1;

        this._type = 'FAT-1'
    }

    name(name) {
        if (!name) throw new Error("Token name must be defined");
        this._name = name;
        return this;
    }

    symbol(symbol) {
        if (!symbol) throw new Error("Token symbol must be defined");
        if (!new RegExp('[A-Z ]+').test(symbol)) throw new Error("Token symbol must only contain capital letters A-Z");
        if (symbol.length == 0 || symbol.length > 4) throw new Error("Token symbol must be 1 - 4 characters");
        this._symbol = symbol;
        return this;
    }

    supply(supply) {
        if (isNaN(supply)) throw new Error("Supply must be a number");
        if (supply < -1) throw new Error("Supply must be >= -1 (infinite)");
        this._supply = supply;
        return this;
    }

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
            this._name = builder._name;
            this._symbol = builder._symbol;
            this._supply = builder._supply;

            this._content = JSON.stringify(this);

            this._tokenId = builder._tokenId;
            this._rootChainId = builder._rootChainId;

            //handle issuance signing
            this._tokenChainId = util.getTokenChainId(builder._tokenId, builder._rootChainId);

            const index = Buffer.from('0');
            const timestamp = Buffer.from(Math.round(new Date().getTime() / 1000).toString());
            const chainId = Buffer.from(this._tokenChainId, 'hex');
            const content = Buffer.from(this._content);

            const key = nacl.keyPair.fromSeed(fctIdentityCrypto.extractSecretFromIdentityKey(builder._sk1));

            const rcd = [Buffer.concat([RCD_TYPE_1, Buffer.from(key.publicKey)])];

            const signature = [nacl.detached(fctUtil.sha512(Buffer.concat([index, timestamp, chainId, content])), key.secretKey)];


            this._extIds = [timestamp, rcd, signature];

        } else if (typeof builder === 'object') {
            this._type = builder.issuance.type;
            this._name = builder.issuance.name;
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

    getName() {
        return this._name;
    }

    getSymbol() {
        return this._symbol;
    }

    getSupply() {
        return this._supply;
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