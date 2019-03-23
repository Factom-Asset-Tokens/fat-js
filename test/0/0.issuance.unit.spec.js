const constant = require('../../constant');
const assert = require('chai').assert;
const Entry = require('factom/src/entry').Entry;
const Chain = require('factom/src/chain').Chain;

describe('Issuance Unit', function () {

    it('Builder', function () {
        let IssuanceBuilder = require('../../0/Issuance').IssuanceBuilder;
        let issuance = new IssuanceBuilder("mytoken", "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
            .symbol('TTK')
            .supply(1000000)
            .build();

        assert.strictEqual(issuance.getIssuerIdentityRootChainId(), '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762');
        assert.strictEqual(issuance.getType(), constant.FAT0);
        assert.strictEqual(issuance.getSymbol(), 'TTK');
        assert.strictEqual(issuance.getSupply(), 1000000);

        //Initial issuance specific
        assert.strictEqual(issuance.getTokenId(), 'mytoken');
        assert.isDefined(issuance.getTokenChainId());

        assert.instanceOf(issuance.getEntry(), Entry);
        assert.instanceOf(issuance.getChain(), Chain);
    });

});