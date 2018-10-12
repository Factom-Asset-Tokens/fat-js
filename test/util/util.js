const assert = require('chai').assert;
describe('Utils', function () {
    const util = require('../../util');

    it('Calculate Chain IDs', function () {
        assert(util.getIssuanceChainId('mytoken', '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584').toString('hex') === '93c97af2126abe024ef75d2e4afafcd3aed64bc9fe369c0f6e7f3e0213f3d585', 'Incorrectly calculated known issuance chain ID for mytoken');
        assert(util.getTransactionChainId('mytoken', '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584').toString('hex') === 'f48da20db2bb16eed6bf6c66faa6a9e3def7de38ce8e402c7579243071598908', 'Incorrectly calculated known transaction chain ExtID for mytoken');
    });
});