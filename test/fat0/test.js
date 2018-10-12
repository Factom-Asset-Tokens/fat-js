const crypto = require('crypto');
const assert = require('chai').assert;

const fctAddressUtils = require('../../deps/factomjs-master/src/addresses');
const fctAddrUtils = require('factom/src/addresses');
const fctIdentityUtils = require('factom-identity-lib/src/crypto');

const ES = 'Es3k4L7La1g7CY5zVLer21H3JFkXgCBCBx8eSM2q9hLbevbuoL6a';

const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');

//get a random FCT address. probability of this being used is miniscule
let pk = ec.keyFromSecret(require('crypto').randomBytes(256));
const emptyAddress = fctAddressUtils.keyToPublicFctAddress(pk.getPublic()).toString('hex');

let TransactionBuilder = require('../../0/Transaction').TransactionBuilder;
let Transaction = require('../../0/Transaction').Transaction;

//Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ', 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
describe('FATIP-0', function () {

    describe('Transaction Builder', function () {

        it('Constructor', function () {
            let tx = new TransactionBuilder();
        });

        it('Basic Transaction Spec', function () {
            let tx = new TransactionBuilder()
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
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

            //millTimeStamp
            assert(tx.getMilliTimestamp() !== undefined, "Timestamp was not included automatically in built transaction");
            assert(!isNaN(tx.getMilliTimestamp()), "Timestamp included was not a number");
            assert(tx.getMilliTimestamp() < new Date().getTime(), "Timestamp autofilled was after present");

            //salt: note a salt is not mandatory as per FAT-0. It is optional but strongly recommended
            assert(tx.getSalt() !== undefined, "salt was not included automatically in built transaction");
            assert(typeof tx.getSalt() === 'string', "salt included was not a string");
            assert(tx.getSalt().length === 64, "salt included was not 64 bytes in length (" + tx.getSalt().length + ")");

            //extIds

            //content

        });

        it('All Transaction Builder Inputs', function () {
            let tx = new TransactionBuilder()
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 75)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 75)
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
                .milliTimestamp(1234)
                .salt("abc")
                .build();

            assert(tx.inputs.length === 2, "Inputs length was different than expected");
            assert(tx.outputs.length === 1, "Outputs length was different than expected");
            assert(tx.getMilliTimestamp() === 1234, "milliTimestamp was different than expected");
            assert(tx.getSalt() === "abc", "salt was different than expected");

            // console.log(JSON.stringify(tx, undefined, 2))
        });

        it('Transaction Builder Coinbase Transaction', function () {

        });
    });

    describe('Issuance Builder', function () {

        it('Constructor', function () {

        });
    })

});

function getTestTransaction() {
    const tx = require('./data/tx');
    return Object.assign({}, tx);
}