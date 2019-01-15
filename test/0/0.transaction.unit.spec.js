const assert = require('chai').assert;

const fctAddrUtils = require('factom/src/addresses');
const Entry = require('factom/src/entry').Entry;

const ES = 'Es3k4L7La1g7CY5zVLer21H3JFkXgCBCBx8eSM2q9hLbevbuoL6a'; //EC1tE4afVGPrBUStDhZPx1aHf4yHqsJuaDpM7WDbXCcYxruUxj2D

//Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ', 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');

const testTokenID = 'mytoken';
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
        assert(Object.keys(tx.getInputs()).every(address => fctAddrUtils.isValidFctPublicAddress(address)), "Not every FCT Address in inputs was a valid public Factoid address");
        assert(Object.values(tx.getInputs()).every(amount => !isNaN(amount) && Number.isInteger(amount) && amount > 0), "Not every amount in inputs was a valid positive nonzero integer");

        //outputs
        assert(tx.getOutputs() !== undefined, "tx did not include inputs");
        assert(typeof tx.getOutputs() === 'object', "tx inputs were not an object");
        assert(Object.keys(tx.getOutputs()).length === 1, "tx inputs length was not expected");
        assert(Object.keys(tx.getOutputs()).every(address => fctAddrUtils.isValidFctPublicAddress(address)), "Not every FCT Address in outputs was a valid public Factoid address");
        assert(Object.values(tx.getOutputs()).every(amount => !isNaN(amount) && Number.isInteger(amount) && amount > 0), "Not every amount in outputs was a valid positive nonzero integer");

        //check coinbase
        assert(tx.isCoinbase() === false, "generated tx should not be a coinbase transaction");

        //check factomjs entry
        assert(tx.getEntry() instanceof Entry, "getEntry did not return a valid factomjs entry")

        //test coinbase transaction
        tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput(10)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
            .build();

        //check coinbase
        assert(tx.isCoinbase() === true, "generated tx should be a coinbase transaction");


    });
});