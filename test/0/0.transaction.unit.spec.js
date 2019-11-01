const util = require('../../util');
const assert = require('chai').assert;
const fctAddrUtils = require('factom/src/addresses');
const fctUtil = require('factom/src/util');
const Entry = require('factom/src/entry').Entry;
const BigNumber = require('bignumber.js');
const fctIdentityCrypto = require('factom-identity-lib/src/crypto');
const nacl = require('tweetnacl/nacl-fast').sign;
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

        //check pending
        assert.isFalse(tx.getPending());

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

        //test zero input/output
        tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 0)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 0)
            .build();

        //test same address in input and output
        tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
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

        //External signatures

        //test signing with private key externally, this will simulate an external signature such as from the Ledger
        let sk = fctAddrUtils.addressToKey("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm");
        let key = nacl.keyPair.fromSeed(sk);

        let sk2 = fctAddrUtils.addressToKey("Fs2nnTh6MvL3NNRN9NtkLhN5tyb9mpEnqYKjhwrtHtgZ9Ramio61");
        let key2 = nacl.keyPair.fromSeed(sk2);

        let pubaddr = fctAddrUtils.keyToPublicFctAddress(key.publicKey);

        tx = new TransactionBuilder(testTokenChainId)
            .input(pubaddr, 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
            .build();

        //gives error for bad input address, in this case providing a key instead of address
        assert.throws(() =>  new TransactionBuilder(testTokenChainId)
            .input(key.publicKey, 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
            .build());

        //this should throw error for adding input to transaction error, when expecting signatures only
        assert.throws(() => new TransactionBuilder(tx)
            .input(pubaddr, 150)
            .pkSignature(key.publicKey, "abcdef0123456789")
            .build());

        //this should throw error for having a publicKey that doesn't match input
        assert.throws(() => new TransactionBuilder(tx)
            .pkSignature(key2.publicKey, "abcdef0123456789")
            .build());

        //this should throw a bad signature size
        let txbadsig = new TransactionBuilder(tx)
            .pkSignature(key.publicKey, "abcdef0123456789")
            .build();
        assert.throws(() => txbadsig.validateSignatures());

        let extsig = nacl.detached(fctUtil.sha512(tx.getMarshalDataSig(0)), key.secretKey);

        //this is a good transaction
        let txgood = new TransactionBuilder(tx)
            .pkSignature(key.publicKey, extsig)
            .build();

        //should have good signature
        assert.isTrue(txgood.validateSignatures());

        //test 1 unsigned input and 1 signed intput
        tx = new TransactionBuilder(testTokenChainId)
            .input(pubaddr, 150)
            .input("Fs2nnTh6MvL3NNRN9NtkLhN5tyb9mpEnqYKjhwrtHtgZ9Ramio61", 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 300)
            .build();

        //should throw for not enough external signatures provided
        assert.throws(() => new TransactionBuilder(tx)
            .build());

        //now provide a signature    
        extsig = nacl.detached(fctUtil.sha512(tx.getMarshalDataSig(0)), key.secretKey);
        txgood = new TransactionBuilder(tx)
            .pkSignature(key.publicKey, extsig)
            .build();

        assert.isTrue(txgood.validateSignatures());


        const idkey = nacl.keyPair.fromSeed(fctIdentityCrypto.extractSecretFromIdentityKey("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu"));
        const idaddr = util.createPublicIdentityAddr('id1', idkey.publicKey);

        //test coinbase transaction with external signature
        tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput(10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
            .id1(idaddr)
            .build();

        //should throw with attempt to pass a signature for a regular transaction
        assert.throws(() => new TransactionBuilder(tx)
            .pkSignature(key.publicKey, extsig)
            .build());

        //should throw with attempt to set the identity address on a assembled transaction
        assert.throws(() => new TransactionBuilder(tx)
            .id1(idaddr)
            .build());

        //make a signature and sign the data
        extsig = nacl.detached(fctUtil.sha512(tx.getMarshalDataSig(0)), idkey.secretKey);

        txgood = new TransactionBuilder(tx)
            .id1Signature(idkey.publicKey, extsig)
            .build();
        assert.isTrue(txgood.validateSignatures());

        //** End Test External Signing

        //** 
        //TX ERRORS:

        //test equal inputs & outputs
        assert.throws(() => new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 151)
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
    });
});
