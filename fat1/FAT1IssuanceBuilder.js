const {BaseIssuanceBuilder} = require('../fat/BaseIssuanceBuilder');
const factomAddressValidation = require('factom/src/addresses');

class FAT1IssuanceBuilder extends BaseIssuanceBuilder {
    setCoinbaseTransaction(address, tokenIds) {
        if (!factomAddressValidation.isValidFctPublicAddress(address)) throw new Error("Supplied genesisAddress is not a valid public Factoid genesisAddress");

        if (!Array.isArray(tokenIds)) throw new Error("Coinbase tx value must be an array of token IDS");

        this.issuance.coinbaseTransactionValue = tokenIds;
        this.issuance.coinbaseTransactionAddress = address;

        return this;
    };

    setTokens(tokens) {
        //validate tokens. All that is required is a unique ID
        let tokenIds = new Set();
        tokens.forEach(function (token) {
            if (tokenIds.has(token.id)) throw new Error("Duplicate token ID " + token.id);
            tokenIds.add(token.id);
        });

        this.issuance.tokens = tokens;
        return this;
    };
}

module.exports.FAT1IssuanceBuilder = FAT1IssuanceBuilder;