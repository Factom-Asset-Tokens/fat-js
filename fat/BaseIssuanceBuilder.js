const factomCryptoValidation = require('factom-identity-lib/src/validation');
const factomAddressValidation = require('factom/src/addresses');

class BaseIssuanceBuilder {

    constructor(tokenId) {
        if (new.target === BaseIssuanceBuilder) throw new TypeError("Cannot instantiate BaseIssuanceBuilder directly. Please subclass");

        if (!tokenId || typeof  tokenId !== 'string') throw new Error('Token is a required string');
        this.issuance = {tokenId: tokenId};
    }

    setName(name) {
        if (!name) throw new Error("Token name must be defined");
        this.issuance.name = name;
        return this;
    };


    setSymbol(symbol) {
        if (!symbol) throw new Error("Token symbol must be defined");
        if (!new RegExp('[A-Z ]+').test(symbol)) throw new Error("Token symbol must only contain capital letters A-Z");
        if (symbol.length == 0 || symbol.length > 4) throw new Error("Token symbol must be 1 - 4 characters");
        this.issuance.symbol = symbol;
        return this;
    };

    setIssuerIdentity(rootChainId) {
        if (!factomCryptoValidation.isValidIdentityChainId(rootChainId)) throw new Error("Issuer root chain ID was not valid");
        this.issuance.rootChainId = rootChainId;
        return this;
    };

    setSK1(sk1) {
        if (!factomCryptoValidation.isValidSk1(sk1)) throw new Error("Supplied key is not a valid sk1 private key");
        this.issuance.sk1 = sk1;
        return this;
    };

    setCoinbaseTransaction(address, value) {
        if (!factomAddressValidation.isValidFctPublicAddress(address)) throw new Error("Supplied genesisAddress is not a valid public Factoid genesisAddress");

        if (isNaN(value)) throw new Error("Coinbase tx value must be a number");
        if (value <= 0) throw new Error("Coinbase tx value must be > 0");

        this.issuance.coinbaseTransactionValue = value;
        this.issuance.coinbaseTransactionAddress = address;

        return this;
    };

    setSupply(supply) {
        if (isNaN(supply)) throw new Error("Supply must be a number");
        if (supply <= 0) throw new Error("Supply must be > 0");
        this.issuance.supply = supply;
        return this;
    };

    setMetadata(metadata) {
        try {
            JSON.stringify(metadata);
        } catch (e) {
            throw new Error("Metadata must be JSON parsable");
        }

        this.issuance.metadata = metadata;
        return this;
    };

    build() {
        //validate required fields
        if (!this.issuance.tokenId) throw new Error("Token ID is required for issuance");
        if (!this.issuance.rootChainId) throw new Error("Root Chain ID is required for issuance");
        if (!this.issuance.sk1) throw new Error("Valid SK1 Identity Key is required for issuance");
        if (isNaN(this.issuance.supply)) throw new Error("Supply is required for issuance");

        return this.issuance;
    }
}

module.exports.BaseIssuanceBuilder = BaseIssuanceBuilder;