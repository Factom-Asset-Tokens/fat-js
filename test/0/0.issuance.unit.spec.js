const BigNumber = require('bignumber.js');

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

        assert.instanceOf(issuance.getSupply(), BigNumber);
        assert.isTrue(issuance.getSupply().isEqualTo(1000000));
        assert.strictEqual(JSON.stringify(issuance.getMetadata()), JSON.stringify({'abc': 123}));

        //Initial issuance specific
        assert.strictEqual(issuance.getTokenId(), 'mytoken');
        assert.isDefined(issuance.getChainId());

        assert.instanceOf(issuance.getEntry(), Entry);
        assert.instanceOf(issuance.getChain(), Chain);
    });

    it('Issuance From Object', function () {
        let Issuance = require('../../0/Issuance');
        const data = {
            "chainid": "0cccd100a1801c0cf4aa2104b15dec94fe6f45d0f3347b016ed20d81059494df",
            "tokenid": "test",
            "issuerid": "888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced",
            "entryhash": "fc0f57ea3a4dc5b8ffc1a9c051f4b6ae0cd7137f9110b98e3c3eb08f132a5e18",
            "timestamp": 1550612940,
            "issuance": {
                "type": "FAT-0",
                "supply": -1,
                "symbol": "T0"
            }
        };

        const issuance = new Issuance(data);

        assert.strictEqual(issuance.getIssuerChainId(), '888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced');
        assert.strictEqual(issuance.getType(), constant.FAT0);
        assert.strictEqual(issuance.getSymbol(), 'T0');

        assert.instanceOf(issuance.getSupply(), BigNumber);
        assert.isTrue(issuance.getSupply().isEqualTo(-1));

        assert.strictEqual(issuance.getTokenId(), 'test');
        assert.strictEqual(issuance.getChainId(), '0cccd100a1801c0cf4aa2104b15dec94fe6f45d0f3347b016ed20d81059494df');
        assert.strictEqual(issuance.getEntryhash(), 'fc0f57ea3a4dc5b8ffc1a9c051f4b6ae0cd7137f9110b98e3c3eb08f132a5e18');
        assert.strictEqual(issuance.getTimestamp(), 1550612940);

        assert.instanceOf(issuance.getEntry(), Entry);
        assert.instanceOf(issuance.getChain(), Chain);
    });
});