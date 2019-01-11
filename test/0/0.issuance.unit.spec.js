const assert = require('chai').assert;
const Entry = require('factom/src/entry').Entry;
const Chain = require('factom/src/chain').Chain;


const testTokenChainId = '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762';

describe('Issuance Unit', function () {

    it('Builder', function () {
        let IssuanceBuilder = require('../../0/Issuance').IssuanceBuilder;
        let issuance = new IssuanceBuilder("mytoken", "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
            .name('Test Token')
            .symbol('TTK')
            .supply(1000000)
            .build();

        assert(issuance.getIssuerIdentityRootChainId() === '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762', "Unexpected root chain ID");
        assert(issuance.getType() === 'FAT-0', "Unexpected token type");
        assert(issuance.getName() === 'Test Token', "Unexpected token Name");
        assert(issuance.getSymbol() === 'TTK', "Unexpected token Symbol");
        assert(issuance.getSupply() === 1000000, "Unexpected issuance token supply");

        //Initial issuance specific
        assert(issuance.getTokenId() === 'mytoken', "Unexpected Token ID");
        assert(issuance.getTokenChainId() !== undefined, "Token chain ID was not defined")

        assert(issuance.getEntry() instanceof Entry, "getEntry() did not return a valid factomjs entry");
        assert(issuance.getChain() instanceof Chain, "getChain() did not return a valid factomjs chain");

    });

});