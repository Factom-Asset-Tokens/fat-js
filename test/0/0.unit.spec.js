const assert = require('chai').assert;

const fctAddrUtils = require('factom/src/addresses');

const ES = 'Es3k4L7La1g7CY5zVLer21H3JFkXgCBCBx8eSM2q9hLbevbuoL6a';

//Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ', 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
describe('Unit Spec', function () {

    let TransactionBuilder = require('../../0/Transaction').TransactionBuilder;

    describe('Transaction Builder', function () {


        it('Transaction Spec', function () {
            let tx = new TransactionBuilder()
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
                .blockheight(159888)
                .build();

            //inputs
            assert(tx.getInputs() !== undefined, "tx did not include inputs");
            assert(Array.isArray(tx.getInputs()), "tx inputs were not an array");
            assert(tx.getInputs().length === 1, "tx inputs length was not expected");
            assert(tx.getInputs().every(input => fctAddrUtils.isValidFctPublicAddress(input.address)), "Not every FCT Address in inputs was a valid public Factoid address");
            assert(tx.getInputs().every(input => !isNaN(input.amount) && Number.isInteger(input.amount) && input.amount > 0), "Not every amount in inputs was a valid positive nonzero integer");

            //outputs
            assert(tx.getOutputs() !== undefined, "tx did not include inputs");
            assert(Array.isArray(tx.getOutputs()), "tx inputs were not an array");
            assert(tx.getOutputs().length === 1, "tx inputs length was not expected");
            assert(tx.getOutputs().every(output => fctAddrUtils.isValidFctPublicAddress(output.address)), "Not every FCT Address in outputs was a valid public Factoid address");
            assert(tx.getOutputs().every(output => !isNaN(output.amount) && Number.isInteger(output.amount) && output.amount > 0), "Not every amount in outputs was a valid positive nonzero integer");

            //txId
            assert(tx.getTxId() === undefined, "Generated transaction should not have a txId");

            //timestamp
            assert(tx.getTimestamp() === undefined, "Timestamp was included in built transaction (should only have timestamp after entry to Factom)");

            //blockheight
            assert(tx.getBlockheight() === 159888, "Generated transaction had unexpected blockheight");

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

            //build tx from other builder
            tx = new TransactionBuilder(new TransactionBuilder(tx)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150))
                .blockheight(159888)
                .build();

            assert(tx.isValid(), "tx builder constructed from other builder generated invalid TX");
        });

        it('All Transaction Builder Inputs', function () {
            let tx = new TransactionBuilder()
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 75)
                .coinbaseInput(75)
                .blockheight(159888)
                .setIssuerInformation('888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762', "mytoken", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
                .salt("abc")
                .build();

            assert(tx.inputs.length === 2, "Inputs length was different than expected");
            assert(tx.outputs.length === 1, "Outputs length was different than expected");
            assert(tx.getBlockheight() === 159888, "blockheight was different than expected");
            assert(tx.getSalt() === "abc", "salt was different than expected");
            assert(tx.isCoinbase() === true, "Failed to detect a coinbase transaction")
        });

        it('Transaction Builder Coinbase Transaction', function () {


        });
    });

    describe('Issuance Builder', function () {

        let IssuanceBuilder = require('../../0/Issuance').IssuanceBuilder;
        
        it('Issuance Spec', function () {

            let tx = new TransactionBuilder()
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
                .blockheight(159888)
                .build();

            let issuance = new IssuanceBuilder("888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "mytoken", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
                .name('Test Token')
                .symbol('TTK')
                .supply(1000000)
                .salt('09c7c39bc38a86c')
                .coinbase(tx)
                .build();


            assert(issuance.getRootChainId() === '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762', "Unexpected root chain ID");
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

        let RPCBuilder = require('../../rpc/RPC').RPCBuilder;

        it('Constructor', function () {
            new RPCBuilder();
        });

        it('Basic RPC Spec', function () {
            let RPC = new RPCBuilder()
                .host('fatnode.mysite.com')
                .port(1234)
                .version('v0')
                .auth('my-user', 'my-pass')
                .build();

            //token RPC
            assert(RPC['getTokenRPC'] !== undefined, "Token RPC Method was not defined");
            assert(typeof RPC['getTokenRPC'] === 'function', "Token RPC Method was not a function");

        });

        it('Basic Token RPC Spec', function () {
            let TokenRPC = new RPCBuilder().build().getTokenRPC('mytoken', "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762");
            assert(TokenRPC['getBalance'] !== undefined, "getBalance method was not defined");
            assert(typeof TokenRPC['getBalance'] === 'function', "getBalance method was not a function");


        });

    })

});