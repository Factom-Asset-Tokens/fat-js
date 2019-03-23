const util = require('../../util');
const assert = require('chai').assert;

const fctAddrUtils = require('factom/src/addresses');
const Entry = require('factom/src/entry').Entry;

const testTokenChainId = '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762';

describe('Transaction Unit', function () {

    let TransactionBuilder = require('../../1/Transaction').TransactionBuilder;

    it('Builder', function () {
        let tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [{min: 0, max: 3}, 150])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [{min: 0, max: 3}, 150])
            .build();

        //inputs
        assert.isDefined(tx.getInputs());
        assert.isObject(tx.getInputs());
        assert.lengthOf(Object.keys(tx.getInputs()), 1);
        assert.isTrue(Object.keys(tx.getInputs()).every(address => fctAddrUtils.isValidPublicFctAddress(address)), "Not every FCT Address in inputs was a valid public Factoid address");
        assert.isTrue(Object.values(tx.getInputs()).every(ids => util.validateNFIds(ids)), "Not every token ID element in inputs was a valid token ID or token ID range");

        //outputs
        assert.isDefined(tx.getOutputs());
        assert.isObject(tx.getOutputs());
        assert.lengthOf(Object.keys(tx.getOutputs()), 1);
        assert.isTrue(Object.keys(tx.getOutputs()).every(address => fctAddrUtils.isValidPublicFctAddress(address)), "Not every FCT Address in outputs was a valid public Factoid address");
        assert.isTrue(Object.values(tx.getOutputs()).every(ids => util.validateNFIds(ids)), "Not every token ID element in outputs was a valid token ID or token ID range");

        //check coinbase
        assert.isFalse(tx.isCoinbase());

        //check factomjs entry
        assert.instanceOf(tx.getEntry(), Entry);

        //ensure entry has proper fields populated (extids, content)

        //test coinbase transaction
        tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput([10])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
            .build();

        assert.isTrue(tx.isCoinbase());

        //test burn transaction
        tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [{min: 0, max: 3}, 150])
            .burnOutput([{min: 0, max: 3}, 150])
            .build();

        //test metadata
        const meta = {type: 'fat-js test run', timestamp: new Date().getTime()};

        tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [10])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
            .metadata(meta)
            .build();

        assert.isObject(tx.getMetadata());
        assert.strictEqual(JSON.stringify(tx.getMetadata()), JSON.stringify(meta));

        const tokenMeta = [
            {
                ids: [10],
                metadata: meta,
            }
        ];

        //token metadata
        tx = new TransactionBuilder(testTokenChainId)
            .coinbaseInput([10])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
            .tokenMetadata(tokenMeta)
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
            .build();

        assert.isArray(tx.getTokenMetadata());
        assert.strictEqual(JSON.stringify(tx.getTokenMetadata()), JSON.stringify(tokenMeta));

        //TX ERRORS:

        //test unstrictEqual inputs & outputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [10, {min: 30, max: 99}])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [11])
            .build());

        //test invalid input address
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkM", [150])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [150])
            .build());

        //test invalid output address
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [150])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBA", [150])
            .build());

        //test invalid issuer sk1
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput(10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAub")
            .build());

        //test no inputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAub")
            .build());

        //test no outputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [150])
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAub")
            .build());

        //test coinbase transaction, no sk1 set
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput(10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
            .build());

        //test add coinbase input to tx with > 0 inputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [10])
            .coinbaseInput([11])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10, 11])
            .build());

        //test add coinbase input twice
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput([10])
            .coinbaseInput([11])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10, 11])
            .build());

        //test invalid FAT-1 ID range (negative ID)
        assert.throws(() => new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [{min: 0, max: -3}, 150])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [{min: 0, max: -3}, 150])
            .build());

        //test invalid FAT-1 ID range (overlapping range)
        assert.throws(() => new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [{min: 0, max: 3}, {min: 2, max: 4}])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [{min: 0, max: 3}, {min: 2, max: 4}])
            .build());

        //test invalid FAT-1 ID range (no ids)
        assert.throws(() => new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [])
            .build());

        //specify invalid tx metadata

        assert.throws(() => new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [10])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
            .metadata(new HTMLDataElement())
            .build());

        //specify token metadata without the tx being coinbase
        assert.throws(() => new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [10])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
            .tokenMetadata(tokenMeta)
            .build())
    });


});