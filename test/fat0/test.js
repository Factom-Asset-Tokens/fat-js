const crypto = require('crypto');
const assert = require('chai').assert;

const fctAddressUtils = require('../../deps/factomjs-master/src/addresses');
const fctIdentityUtils = require('factom-identity-lib/src/crypto');

const {FAT0} = require('../../fat0/FAT0');

const ES = 'Es3k4L7La1g7CY5zVLer21H3JFkXgCBCBx8eSM2q9hLbevbuoL6a';

const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');

//get a random FCT address. probability of this being used is miniscule
let pk = ec.keyFromSecret(require('crypto').randomBytes(256));
const emptyAddress = fctAddressUtils.keyToPublicFctAddress(pk.getPublic()).toString('hex');

describe('FAT-0 Tests', async function () {

    let testToken = await new FAT0('AQQW', {
        factomd: {
            host: '0.testnet.factom.dbgrow.com',
            port: 8088
        }
    });

    describe('Transaction Validation', function () {

        it('Validate a known valid transaction', function () {
            const tx = require('./data/tx');
            assert(testToken.validateTransaction(tx), 'Failed to validate known transaction');
        });

        it('Detect manipulated transactions', async function () {
            //manipulate each of the fields of the tx to simulate tampering

            //manipulate input/output addresses
            let tx = getTestTransaction();
            tx.input.address = 'FA3syRxpYEvFFvoN4ZfNRJVQdumLpTK4CMmMUFmKGeqyTNgsg4uH';
            assert(!testToken.validateTransaction(tx), 'Failed to catch tx input address manipulation');

            tx = getTestTransaction();
            tx.output.address = 'FA3syRxpYEvFFvoN4ZfNRJVQdumLpTK4CMmMUFmKGeqyTNgsg4uH';
            assert(!testToken.validateTransaction(tx), 'Failed to catch tx output address manipulation');

            //manipulate amounts
            tx = getTestTransaction();
            tx.input.amount = 1000;
            assert(!testToken.validateTransaction(tx), 'Failed to catch tx input amount manipulation');

            tx = getTestTransaction();
            tx.output.amount = 1000;
            assert(!testToken.validateTransaction(tx), 'Failed to catch tx output amount manipulation');

            /*!//manipulate RCD Hash
            tx = getTestTransaction();
            tx.input.rcdHash = 'A' + tx.input.rcdHash.slice(1);
            assert(!myToken.validateTransaction(tx), 'Failed to catch tx input rcdhash manipulation');*/

            //manipulate RCD
            tx = getTestTransaction();
            tx.rcd = 'A' + tx.rcd.slice(1);
            assert(!testToken.validateTransaction(tx), 'Failed to catch tx rcd manipulation');

            //manipulate marshalled binsig
            tx = getTestTransaction();
            tx.marshalBinarySig = 'A' + tx.marshalBinarySig.slice(1);
            assert(!testToken.validateTransaction(tx), 'Failed to catch tx marshalled binary signature manipulation');

            //manipulate signature
            tx = getTestTransaction();
            tx.signature = 'A' + tx.signature.slice(1);
            assert(!testToken.validateTransaction(tx), 'Failed to catch tx signature manipulation');

            //coinbase TX validation
            //manipulate salt

            tx = getTestTransaction();
            tx.idNonce = 'A' + tx.idNonce.slice(1);
            assert(!testToken.validateTransaction(tx), 'Failed to catch tx idNonce manipulation');

            tx = getTestTransaction();
            tx.idSignature = 'A' + tx.idSignature.slice(1);
            assert(!testToken.validateTransaction(tx), 'Failed to catch tx idSignature manipulation');
        });
    });

    describe('API Read Methods', function () {

        it('Get Issuance Entry', function () {
            //a known valid transaction in this tx chain
            let issuance = testToken.getIssuance();

            assert(issuance !== undefined, 'Issuance entry was not returned');
            assert(issuance.timestamp, 'Timestamp of issuance was not included');
            assert(typeof issuance.timestamp === 'number', 'Timestamp of issuance was not a number')

            assert(issuance.entryHash, 'Entry Hash of transaction was not included');
            assert(typeof issuance.entryHash === 'string', 'Entry Hash of transaction was not a string')
        });

        it('Get Transactions', function () {
            this.timeout(60000);
            const transactions =
                testToken.getTransactions();

            //transactions & validation
            assert(transactions, 'txs and balances did not include transactions)');
            assert(Array.isArray(transactions), 'txs and balances was not an object (' + typeof txsAndBalances + ')');
            assert(transactions.length > 0, 'transaction validation failed. Zero transactions were found (impossible)');
            assert(transactions.every(function (tx) {
                return testToken.validateTransaction(tx)
            }), 'Library returns invalid transactions from API call');
        });

        it('Get Transaction', function () {
            this.timeout(60000);
            let tx = testToken.getTransaction('e1a71b335c3be54659f84e0d36c6c53d0a7e06a960f1cf5fef3af7faac413f2f');

            assert(tx !== undefined, 'Failed to return a known transaction');
            assert(tx.entryHash, 'Entry Hash was not included with the transaction');
            assert(typeof tx.entryHash === 'string', 'Entry Hash of transaction was not a string');
            // assert(tx.timestamp !== undefined, 'Timestamp was not included with the transaction');
            // assert(typeof tx.timestamp === 'number', 'Timestamp of transaction was not a number');
            assert(testToken.validateTransaction(tx), 'Failed to validate known transaction');
        });

        it('Get Balances', function () {
            const balances =
                testToken.getBalances();

            //balances & validation
            assert(balances, 'txs and balances did not include balances)');
            assert(typeof balances === 'object', 'balances was not an object (' + typeof txsAndBalances + ')');
            assert(Object.keys(balances).length > 0, 'balances were invalidly parsed, no balances were found for this token(impossible)');
            assert(Object.values(balances).every(function (balance) {
                return !isNaN(balance)
            }), 'balance values must all be of type number');

            //check balance of a known address
            assert(balances['FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM'] > 0, 'Balance at known address should be greater than 0')
        });

        it('Get Balance Of Address', function () {
            //balance of known non-empty address
            let balance = testToken.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
            assert(balance !== undefined, 'Balance was not included');
            assert(typeof balance === 'number', 'Balance was not a number');
            assert(balance > 0, 'Balance of known address should be greater than 0');

            //balance of an empty address
            balance = testToken.getBalance(emptyAddress);
            assert(typeof balance === 'number', 'Empty Balance was not a number');
            assert(balance === 0, 'Balance of known empty address should be 0');
        });

        it('Get Transaction History Of Address', function () {
            this.timeout(60000);

            let transactions = testToken.getTransactionsOfAddress('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');

            assert(Array.isArray(transactions), 'Transaction history was not an array');
            assert(transactions.length > 0, 'Transaction history was not valid, no transactions returned');
            assert(transactions.every(function (tx) {
                return testToken.validateTransaction(tx)
            }), 'Library returns invalid transactions from API call');
        });

        it('Get Stats', function () {
            let stats = testToken.getStats();

            assert(stats.supply, 'Token supply was not included in stats');
            assert(!isNaN(stats.supply), 'Supply must be a number');

            assert(stats.circulatingSupply, 'Circulating supply was not included in stats');
            assert(!isNaN(stats.circulatingSupply), 'Circulating supply must be a number')

            assert(stats.issuanceTimestamp, 'Issuance Timestamp was not included in stats');
            assert(!isNaN(stats.issuanceTimestamp), 'Issuance Timestamp must be a number')
        });

    });

    describe('API Write Methods', function () {

        it('Send A Transaction', async function () {
            this.timeout(60000); //long running op, waits for Factom Commit/ACK

            //send a tx of 100 MYT from FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM to itself
            let transaction = await testToken.sendTransaction('Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ', 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM', 100, ES);
            assert(transaction !== undefined, 'Failed to return a transaction');
            assert(testToken.validateTransaction(transaction), 'Sent transaction was invalid!');
            console.log('Sent transaction ' + transaction.entryHash);
        });

        it('Issue A Token', async function () {
            this.timeout(60000);

            //get a random  token id
            let tokenId = '';
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            for (let i = 0; i < 4; i++) tokenId += possible.charAt(Math.floor(Math.random() * possible.length));

            let issuance = new FAT0.IssuanceBuilder(tokenId)
                .setSymbol(tokenId)
                .setName('Test FAT0 ' + tokenId)
                .setSupply(1000)
                .setIssuerIdentity('888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced')
                .setSK1('sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu')
                .setCoinbaseTransaction('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM', 100);

            console.log('Issuing FAT0: ' + tokenId);

            let issuanceEntryAndCoinbaseTx = await FAT0.issue(issuance, ES,{
                factomd: {
                    host: '0.testnet.factom.dbgrow.com',
                    port: 8088
                }
            });

            assert(issuanceEntryAndCoinbaseTx, 'Issuance Entry and Coinbase Tx Entry were not returned');

            assert(issuanceEntryAndCoinbaseTx.issuanceEntry, 'Issuance Entry were not returned with issuance');
            assert(issuanceEntryAndCoinbaseTx.issuanceEntry.entryHash, 'Issuance Entry did not include Entry Hash');

            assert(issuanceEntryAndCoinbaseTx.coinbaseTx, 'Coinbase Tx Entry were not returned with issuance');
            assert(issuanceEntryAndCoinbaseTx.issuanceEntry.entryHash, 'Coinbase Tx Entry did not include Entry Hash');
        });
    });

    /* describe('API Event Listeners', function () {
         it('Detect & Validate A Pending Transaction', function (done) {
             this.timeout(60000);

             //send a tx of 100 MYT from FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM to itself
             testToken.sendTransaction('Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ', 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM', 100, ES).then(function (transaction) {
                 assert(testToken.validateTransaction(transaction), 'Failed to validate sent transaction');
                 let donecalled = false;
                 testToken.on('transactions', function (transactions) {
                     if (donecalled) return; //in case of additional calls. This callback gets called with each new set of pending transactions detected (we have no control over this if other people are submitting entries too!)
                     assert(transactions, 'Pending Transactions were not returned');
                     assert(Array.isArray(transactions), 'Pending transactions were not an array');
                     assert(transactions.every(function (transaction) {
                         return testToken.validateTransaction(transaction)
                     }), 'Pending transactions were cryptographically invalid (should all be valid)');

                     done();
                     donecalled = true;
                 });
             }).catch(function (err) {
                 throw err;
             });
         });
     });*/

    describe('Cleanup', function () {
        it('Close the cache', function () {
            testToken.close();
        });
    });

});

function getTestTransaction() {
    const tx = require('./data/tx');
    return Object.assign({}, tx);
}