const assert = require('chai').assert;
const constant = require('../../constant');

describe('FAT Constants', function () {
    it('Test Constants', function () {
        assert.strictEqual(constant.FAT0, 'FAT-0');
        assert.strictEqual(constant.FAT1, 'FAT-1');
        assert.isTrue(constant.RCD_TYPE_1.equals(Buffer.from('01', 'hex')));
        assert.strictEqual(constant.COINBASE_ADDRESS_PUBLIC, 'FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC');
        assert.strictEqual(constant.COINBASE_ADDRESS_PRIVATE, 'Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj');
    });
});