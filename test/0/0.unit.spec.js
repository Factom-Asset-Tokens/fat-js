const assert = require('chai').assert;

const fctAddrUtils = require('factom/src/addresses');

const ES = 'Es3k4L7La1g7CY5zVLer21H3JFkXgCBCBx8eSM2q9hLbevbuoL6a'; //EC1tE4afVGPrBUStDhZPx1aHf4yHqsJuaDpM7WDbXCcYxruUxj2D

//Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ', 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');

const testTokenID = 'mytoken';
const testIssuerRootChainId = '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762';

describe('Unit Spec', function () {

    let TransactionBuilder = require('../../0/Transaction').TransactionBuilder;

    describe('Transaction Builder', function () {

        it('Transaction Spec', function () {
            let tx = new TransactionBuilder(testTokenID, testIssuerRootChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
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

            //txId
            assert(tx.getTxId() === undefined, "Generated transaction should not have a txId");

            //timestamp
            assert(tx.getTimestamp() === undefined, "Timestamp was included in built transaction (should only have timestamp after entry to Factom)");

            //salt (autofill): note a salt is not mandatory as per FAT-0. It is optional but strongly recommended
            assert(tx.getSalt() !== undefined, "salt was not included automatically in built transaction");
            assert(typeof tx.getSalt() === 'string', "salt included was not a string");
            assert(tx.getSalt().length === 64, "salt included was not 64 bytes in length (" + tx.getSalt().length + ")");

            //content
            assert(typeof tx.getContent() === 'string', "tx content was not as string");

            //to tx object & validate object fields
            assert(typeof  tx.toObject() === 'object', "tx object was not an object");

            //check coinbase
            assert(tx.isCoinbase() === false, "generated tx should not be a coinbase transaction");

            //extIds
            assert(Array.isArray(tx.getExtIds()), "tx ExtIds were not an array");
            assert(tx.getExtIds() % 2 === 0, "tx ExtIds were not even (odd = coinbase tx)");

            //check validity
            assert(tx.isValid(), "Transaction generated was invalid");
        });

        it('All Transaction Builder Inputs', function () {
            let tx = new TransactionBuilder(testTokenID, testIssuerRootChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 75)
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
                .coinbaseInput(75)
                .setIssuerSK1("sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
                .build();

            assert(Object.keys(tx.inputs).length === 2, "Inputs length was different than expected");
            assert(Object.keys(tx.outputs).length === 1, "Outputs length was different than expected");
            assert(tx.isCoinbase() === true, "Failed to detect a coinbase transaction")
        });

        it('Transaction Builder Coinbase Transaction', function () {


        });
    });

    describe('Issuance Builder', function () {

        let IssuanceBuilder = require('../../0/Issuance').IssuanceBuilder;

        it('Issuance Spec', function () {

            let tx = new TransactionBuilder(testTokenID, testIssuerRootChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
                .build();

            let issuance = new IssuanceBuilder("mytoken", "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
                .name('Test Token')
                .symbol('TTK')
                .supply(1000000)
                .salt('09c7c39bc38a86c')
                .coinbase(tx)
                .build();

            assert(issuance.getIssuerIdentityRootChainId() === '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762', "Unexpected root chain ID");
            assert(issuance.getType() === 'FAT-0', "Unexpected token type");
            assert(issuance.getName() === 'Test Token', "Unexpected token Name");
            assert(issuance.getSymbol() === 'TTK', "Unexpected token Symbol");
            assert(issuance.getSupply() === 1000000, "Unexpected issuance token supply");
            assert(issuance.getSalt() === '09c7c39bc38a86c', "Unexpected issuance Salt");
            assert(typeof issuance.toObject() === 'object', "unexpected type for issuance object");

            //Initial issuance specific
            assert(issuance.getTokenId() === 'mytoken', "Unexpected Token ID");
            assert(issuance.getExtIds().length === 1, "Unexpected ExtIds Length");

            //check issuance validity

        });
    });

    describe('RPC Builder', function () {

        let RPCBuilder = require('../../cli/CLI').CLIBuilder;

        it('Constructor', function () {
            new RPCBuilder();
        });

        it('Basic RPC Spec', function () {
            let RPC = new RPCBuilder()
                .host('fatnode.mysite.com')
                .port(1234)
                .auth('my-user', 'my-pass')
                .build();

            //token RPC
            assert(RPC['getTokenRPC'] !== undefined, "Token RPC Method was not defined");
            assert(typeof RPC['getTokenRPC'] === 'function', "Token RPC Method was not a function");

        });

        it('Basic Token RPC Spec', function () {
            let TokenRPC = new RPCBuilder().build().getTokenRPC('b54c4310530dc4dd361101644fa55cb10aec561e7874a7b786ea3b66f2c6fdfb');
            assert(TokenRPC['getBalance'] !== undefined, "getBalance method was not defined");
            assert(typeof TokenRPC['getBalance'] === 'function', "getBalance method was not a function");


        });

    })

});