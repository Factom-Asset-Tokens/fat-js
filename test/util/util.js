const assert = require('chai').assert;
describe('Utils', function () {
    const util = require('../../util');

    it('Calculate Chain IDs', function () {
        assert(util.getTransactionChainId('mytoken').toString('hex') === 'efeb6db82bf222a87c1fc756e09197ed6ac7672641761a019c26530967f27744', 'Incorrectly calculated known transaction chain ID for mytoken');
        assert(util.getTransactionChainExtId('mytoken').toString('hex') === '6d79746f6b656e3a7472616e73616374696f6e73', 'Incorrectly calculated known transaction chain ExtID for mytoken');

        assert(util.getIssuanceChainId('mytoken').toString('hex') === '965e285857be0176da28e56da4861550e2801ebd389209f319f43a0853000e00', 'Incorrectly calculated known issuance chain ID for mytoken');
        assert(util.getIssuanceChainExtId('mytoken').toString('hex') === '6d79746f6b656e', 'Incorrectly calculated known issuance chain ExtID for mytoken');
    });

    it('Get Token Type', async function () {
        this.timeout(60000);
        let type = await util.getTokenType('mytoken', {
            factomd: {
                host: '0.testnet.factom.dbgrow.com',
                port: 8088
            }
        });
        assert(type === 'FAT-0', 'Token Type was incorrect. Expecting FAT-0 for token mytoken');

        type = await util.getTokenType('greple', {
            factomd: {
                host: '0.testnet.factom.dbgrow.com',
                port: 8088
            }
        });
        assert(type === 'FAT-1', 'Token Type was incorrect. Expecting FAT-1 for token greple');
    });
});