const assert = require('chai').assert;
const fctAddrUtils = require('factom/src/addresses');
const Entry = require('factom/src/entry').Entry;
const BigNumber = require('bignumber.js');

const TransactionBuilder = require('../../0/TransactionBuilder');
const testTokenChainId = '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762';

describe('Transaction Unit', function () {


    it('Builder', function () {
        let tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
            .build();

        //inputs
        assert.isDefined(tx.getInputs());
        assert.isObject(tx.getInputs());
        assert.lengthOf(Object.keys(tx.getInputs()), 1);
        assert.isTrue(Object.keys(tx.getInputs()).every(address => fctAddrUtils.isValidPublicFctAddress(address)), "Not every FCT Address in inputs was a valid public Factoid address");
        assert.isTrue(Object.values(tx.getInputs()).every(amount => !isNaN(amount) && Number.isInteger(amount.toNumber()) && amount > 0), "Not every amount in inputs was a valid positive nonzero integer");

        //outputs
        assert.isDefined(tx.getOutputs());
        assert.isObject(tx.getOutputs());
        assert.lengthOf(Object.keys(tx.getOutputs()), 1);
        assert.isTrue(Object.keys(tx.getOutputs()).every(address => fctAddrUtils.isValidPublicFctAddress(address)), "Not every FCT Address in outputs was a valid public Factoid address");
        assert.isTrue(Object.values(tx.getOutputs()).every(amount => !isNaN(amount) && Number.isInteger(amount.toNumber()) && amount > 0), "Not every amount in outputs was a valid positive nonzero integer");

        //check coinbase
        assert.isFalse(tx.isCoinbase());

        //check factomjs entry
        assert.instanceOf(tx.getEntry(), Entry);

        //check string values are supported as amounts
        tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", '1234')
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", '1234')
            .build();
        assert.strictEqual(tx.getInputs()['FA2Qwmzp4xeXR4jWYrQnbPSXi5wLdVHy8p3ksAVSvyjLEX7jE3pN'].toString(), new BigNumber('1234').toString());

        //check values over max native JS integer accuracy are supported, not rounded off
        tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", new BigNumber('19007199254740991'))
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", new BigNumber('19007199254740991'))
            .build();

        assert.strictEqual(tx.getInputs()['FA2Qwmzp4xeXR4jWYrQnbPSXi5wLdVHy8p3ksAVSvyjLEX7jE3pN'].toString(), new BigNumber('19007199254740991').toString());

        //test coinbase transaction
        tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput(10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
            .sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
            .build();

        assert.isTrue(tx.isCoinbase());

        //test burn transaction
        tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .burnOutput(150)
            .build();

        //test metadata
        const meta = {type: 'fat-js test run', timestamp: new Date().getTime()};

        tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
            .metadata(meta)
            .build();

        assert.isObject(tx.getMetadata());
        assert.strictEqual(JSON.stringify(tx.getMetadata()), JSON.stringify(meta));

        //TX ERRORS:

        //test equal inputs & outputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 151)
            .build());

        //test zero input
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 0)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 151)
            .build());

        //test zero output
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 151)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 0)
            .build());

        //test decimal amount
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 1.1)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 1.1)
            .build());

        //test invalid input address
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkM", 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
            .build());

        //test invalid output address
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBA", 150)
            .build());

        //test invalid issuer sk1
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput(10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
            .sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAub")
            .build());

        //test no inputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
            .sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAub")
            .build());

        //test no outputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAub")
            .build());

        //test coinbase transaction, no sk1 set
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput(10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
            .build());

        //test add coinbase input to tx with > 0 inputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 140)
            .coinbaseInput(10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
            .build());

        //test add coinbase input twice
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput(10)
            .coinbaseInput(10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 20)
            .build());
    });
});