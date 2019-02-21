const assert = require('chai').assert;

const fctAddrUtils = require('factom/src/addresses');
const Entry = require('factom/src/entry').Entry;

const testTokenChainId = '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762';

describe('Transaction Unit', function () {

    let TransactionBuilder = require('../../0/Transaction').TransactionBuilder;

    it('Builder', function () {
        let tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
            .build();

        //inputs
        assert(tx.getInputs() !== undefined, "tx did not include inputs");
        assert(typeof tx.getInputs() === 'object', "tx inputs were not an object");
        assert(Object.keys(tx.getInputs()).length === 1, "tx inputs length was not expected");
        assert(Object.keys(tx.getInputs()).every(address => fctAddrUtils.isValidPublicFctAddress(address)), "Not every FCT Address in inputs was a valid public Factoid address");
        assert(Object.values(tx.getInputs()).every(amount => !isNaN(amount) && Number.isInteger(amount) && amount > 0), "Not every amount in inputs was a valid positive nonzero integer");

        //outputs
        assert(tx.getOutputs() !== undefined, "tx did not include inputs");
        assert(typeof tx.getOutputs() === 'object', "tx inputs were not an object");
        assert(Object.keys(tx.getOutputs()).length === 1, "tx inputs length was not expected");
        assert(Object.keys(tx.getOutputs()).every(address => fctAddrUtils.isValidPublicFctAddress(address)), "Not every FCT Address in outputs was a valid public Factoid address");
        assert(Object.values(tx.getOutputs()).every(amount => !isNaN(amount) && Number.isInteger(amount) && amount > 0), "Not every amount in outputs was a valid positive nonzero integer");

        //check coinbase
        assert(tx.isCoinbase() === false, "generated tx should not be a coinbase transaction");

        //check factomjs entry
        assert(tx.getEntry() instanceof Entry, "getEntry did not return a valid factomjs entry");

        //test coinbase transaction
        tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput(10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
            .build();

        assert(tx.isCoinbase() === true, "generated tx should be a coinbase transaction");

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

        assert(typeof tx.getMetadata() === 'object', 'Metadata was not an object');
        assert(JSON.stringify(tx.getMetadata()) === JSON.stringify(meta), 'Metadata was not equal to expected');

        //TX ERRORS:

        //test unequal inputs & outputs
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
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAub")
            .build());

        //test no inputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAub")
            .build());

        //test no outputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAub")
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