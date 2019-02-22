const assert = require('chai').assert;
const Entry = require('factom/src/entry').Entry;
const Chain = require('factom/src/chain').Chain;

describe('Issuance Unit', function () {


    let IssuanceBuilder = require('../../1/Issuance').IssuanceBuilder;
    let Issuance = require('../../1/Issuance').Issuance;

    it('Builder', function () {
        let issuance = new IssuanceBuilder("mytoken", "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
            .symbol('TNFT')
            .supply(1000000)
            .build();

        assert(issuance.getIssuerIdentityRootChainId() === '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762', "Unexpected root chain ID");
        assert(issuance.getType() === 'FAT-1', "Unexpected token type");
        assert(issuance.getSymbol() === 'TNFT', "Unexpected token Symbol");
        assert(issuance.getSupply() === 1000000, "Unexpected issuance token supply");

        //Initial issuance specific
        assert(issuance.getTokenId() === 'mytoken', "Unexpected Token ID");
        assert(issuance.getTokenChainId() !== undefined, "Token chain ID was not defined");

        assert(issuance.getEntry() instanceof Entry, "getEntry() did not return a valid factomjs entry");
        assert(issuance.getChain() instanceof Chain, "getChain() did not return a valid factomjs chain");

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

        assert(issuance.getIssuerIdentityRootChainId() === '888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced', "Unexpected root chain ID");
        assert(issuance.getType() === 'FAT-1', "Unexpected token type");
        assert(issuance.getSymbol() === 'TNF1', "Unexpected token Symbol");
        assert(issuance.getSupply() === 99999999, "Unexpected issuance token supply");

        assert(issuance.getTokenId() === 'testfat1-0', "Unexpected Token ID");
        assert(issuance.getTokenChainId() === 'eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8', "Token chain ID was not defined");
        assert(issuance.getEntryhash() === 'd58588edb831afba683c69eb72bb8c825b198ae2ec02206d54926880727d91b1');
        assert(issuance.getTimestamp() === 1548276060);

        assert(issuance.getEntry() instanceof Entry, "getEntry() did not return a valid factomjs entry");
        assert(issuance.getChain() instanceof Chain, "getChain() did not return a valid factomjs chain");
    });

});