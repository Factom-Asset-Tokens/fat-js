const constant = require('../../constant');
const assert = require('chai').assert;
const Entry = require('factom/src/entry').Entry;
const Chain = require('factom/src/chain').Chain;

describe('Issuance Unit', function () {

    let IssuanceBuilder = require('../../1/IssuanceBuilder');
    let Issuance = require('../../1/Issuance');

    it('Builder', function () {
        let issuance = new IssuanceBuilder("mytoken", "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
            .symbol('TNFT')
            .supply(1000000)
            .build();

        assert.strictEqual(issuance.getIssuerIdentityRootChainId(), '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762');
        assert.strictEqual(issuance.getType(), constant.FAT1);
        assert.strictEqual(issuance.getSymbol(), 'TNFT');
        assert.isTrue(issuance.getSupply().isEqualTo(1000000));

        //Initial issuance specific
        assert.strictEqual(issuance.getTokenId(), 'mytoken');
        assert.isDefined(issuance.getTokenChainId());

        assert.instanceOf(issuance.getEntry(), Entry);
        assert(issuance.getChain(), Chain);
    });

    it('Issuance From Object', function () {

        const data = {
            "chainid": "eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8",
            "tokenid": "testfat1-0",
            "issuerid": "888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced",
            "entryhash": "d58588edb831afba683c69eb72bb8c825b198ae2ec02206d54926880727d91b1",
            "timestamp": 1548276060,
            "issuance": {
                "type": "FAT-1",
                "supply": 99999999,
                "symbol": "TNF1"
            }
        };

        const issuance = new Issuance(data);

        assert.strictEqual(issuance.getIssuerIdentityRootChainId(), '888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced');
        assert.strictEqual(issuance.getType(), constant.FAT1);
        assert.strictEqual(issuance.getSymbol(), 'TNF1');
        assert.strictEqual(issuance.getSupply(), 99999999);

        assert.strictEqual(issuance.getTokenId(), 'testfat1-0');
        assert.strictEqual(issuance.getTokenChainId(), 'eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8');
        assert.strictEqual(issuance.getEntryhash(), 'd58588edb831afba683c69eb72bb8c825b198ae2ec02206d54926880727d91b1');
        assert.strictEqual(issuance.getTimestamp(), 1548276060);

        assert.instanceOf(issuance.getEntry(), Entry);
        assert.instanceOf(issuance.getChain(), Chain);
    });

});