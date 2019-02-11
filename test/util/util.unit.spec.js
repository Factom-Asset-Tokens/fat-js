const assert = require('chai').assert;
const util = require('../../util');

describe('FATIP-100', function () {
    it('Calculate Chain IDs', function () {
        assert(util.getTokenChainId('mytoken', '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584').toString('hex') === '0dce2c10a51a7df92e2e9e4f848da054509ff9761311bd58ebcc55df656fb409', 'Incorrectly calculated known issuance chain ID for mytoken');
    });
});

describe('FAT-1', function () {
    it('Reduce an array of integers to {min:max}/integer slices', function () {
        assert(JSON.stringify(util.reduceNFIds([0, 1, 2, 5, 99, 100, 101, 102])) === JSON.stringify([{
            min: 0,
            max: 2
        }, 5, {
            min: 99,
            max: 102
        }]), 'Incorrectly reduced array of tokenIds');
    });

    it('Expand an array of form {min:max} slices or integers to integers', function () {
        assert(JSON.stringify(util.expandNFIds([{ min: 0, max: 3 }, 5, 9])) === JSON.stringify([0, 1, 2, 3, 5, 9]))
    });

    it('Count the balance of an array of ID ranges of {min:max}/integer slices', function () {
        assert(util.countNFIds([{ min: 0, max: 3 }, 5, 9]) === 6)
    });

    it('Validate an array of ID ranges', function () {
        assert(util.validateNFIds([0, 1, 2, { min: 3, max: 3 }, {
            min: 4,
            max: 100
        }]) === true, 'Failed to detect valid range');

        assert(!util.validateNFIds([0, 1, 2, { min: -3, max: 3 }, {
            min: 4,
            max: 100
        }]), 'Failed to detect invalid range with negative number');

        assert(!util.validateNFIds([0, 1, 2, { min: 3, max: 2 }, {
            min: 4,
            max: 100
        }]), 'Failed to detect invalid range with max < min');

        assert(!util.validateNFIds([0, 1, 2, 2]), 'Failed to detect invalid range with overlapping ranges with (int:int');

        assert(!util.validateNFIds([0, 1, 2, { min: 2, max: 3 }, {
            min: 4,
            max: 100
        }]), 'Failed to detect invalid range with overlapping ranges with (int:range');

        assert(!util.validateNFIds([0, 1, 2, { min: 3, max: 3 }, {
            min: 3,
            max: 4
        }]), 'Failed to detect invalid range with overlapping ranges(range:range)');
    });
});