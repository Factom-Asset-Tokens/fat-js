const constant = require('../../constant');
const assert = require('chai').assert;
const Entry = require('factom/src/entry').Entry;
const Chain = require('factom/src/chain').Chain;

describe('Issuance Unit', function () {

    it('Builder', function () {
        let IssuanceBuilder = require('../../0/IssuanceBuilder');
        let issuance = new IssuanceBuilder("mytoken", "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
            .symbol('TTK')
            .supply(1000000)
            .metadata({'abc': 123})
            .build();

        assert.strictEqual(issuance.getIssuerChainId(), '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762');
        assert.strictEqual(issuance.getType(), constant.FAT0);
        assert.strictEqual(issuance.getSymbol(), 'TTK');
        assert.isTrue(issuance.getSupply().isEqualTo(1000000));
        assert.strictEqual(JSON.stringify(issuance.getMetadata()), JSON.stringify({'abc': 123}));

        //Initial issuance specific
        assert.strictEqual(issuance.getTokenId(), 'mytoken');
        assert.isDefined(issuance.getChainId());

        assert.instanceOf(issuance.getEntry(), Entry);
        assert.instanceOf(issuance.getChain(), Chain);
    });
});