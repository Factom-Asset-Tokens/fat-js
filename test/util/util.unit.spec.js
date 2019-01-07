const assert = require('chai').assert;
describe('Utils', function () {
    const util = require('../../util');

    describe('FATIP-100', function () {
        it('Calculate Chain IDs', function () {
            assert(util.getIssuanceChainId('mytoken', '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584').toString('hex') === '0dce2c10a51a7df92e2e9e4f848da054509ff9761311bd58ebcc55df656fb409', 'Incorrectly calculated known issuance chain ID for mytoken');
        });
    });
});