const assert = require('chai').assert;

const TransactionBuilder = require('../../0/Transaction').TransactionBuilder;
const Transaction = require('../../0/Transaction').Transaction;

const Issuance = require('../../0/Issuance').Issuance;

describe('FAT-0 CLI Integration', function () {

    const CLIBuilder = require('../../cli/CLI').CLIBuilder;

    const cli = new CLIBuilder()
        .host('localhost')
        .port(8078)
        .build();

    describe('Untyped Token CLI Methods', function () {
        const tokenCLI = cli.getTokenCLI('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');

        assert(tokenCLI.getTokenChainId() === '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec', 'Unexpected token chain ID in CLI: ' + tokenCLI.getTokenChainId());

        it('get-issuance', async function () {
            const issuance = await tokenCLI.getIssuance();
            assert(issuance !== undefined, 'Issuance was not returned');
            assert(typeof issuance === 'object', 'Issuance was not an object');
            console.log(JSON.stringify(issuance, undefined, 2));
        });

        it('get-transaction', async function () {
            const transaction = await tokenCLI.getTransaction('3f21c0b24a66ad5f95116c3ad5703d66c336831dac6451b4a41d126becd9b174');
            assert(transaction !== undefined, 'Transaction was not returned');
            assert(typeof transaction === 'object', 'Transaction was not an object');
            console.log(JSON.stringify(transaction, undefined, 2));
        });

        it('get-transactions', async function () {
            const transactions = await tokenCLI.getTransactions();
            assert(transactions !== undefined, 'Transactions were not returned');
            assert(Array.isArray(transactions), 'Transactions was not an array');
            console.log(JSON.stringify(transactions, undefined, 2));
        });

        it('get-balance', async function () {
            const balance = await tokenCLI.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
            assert(balance !== undefined, 'Balance was not returned');
            assert(Number.isInteger(balance), 'Balance was not an number');
            assert(balance > 0, 'Balance was 0 (expected > 0)');
            console.log(balance)
        });

        it('get-stats', async function () {
            const stats = await tokenCLI.getStats();
            assert(stats !== undefined, 'Stats were not returned');
            assert(typeof stats === 'object', 'Stats was not an object');
            console.log(JSON.stringify(stats, undefined, 2));
        });

        it('send-transaction', async function () {
            const tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 1)
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", 1)
                .build();

            const result = await tokenCLI.sendTransaction(tx);
            console.log(JSON.stringify(result, undefined, 2));
        });

        it('send-transaction(coinbase)', async function () {
            let tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
                .coinbaseInput(10)
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
                .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
                .build();

            // console.log(JSON.stringify(tx.getExtIds(), undefined, 2));

            const result = await tokenCLI.sendTransaction(tx);
            console.log(JSON.stringify(result, undefined, 2));
        });
    });

    describe('Typed Token CLI Methods', function () {
        const typedTokenCLI = cli.getTypedTokenCLI('FAT-0', '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');

        it('get-issuance', async function () {
            const issuance = await typedTokenCLI.getIssuance();
            assert(issuance !== undefined, 'Issuance was not returned');
            assert(issuance instanceof Issuance, 'Issuance returned was not properly typed')
        });

        it('get-transaction', async function () {
            const transaction = await typedTokenCLI.getTransaction('3f21c0b24a66ad5f95116c3ad5703d66c336831dac6451b4a41d126becd9b174');
            assert(transaction !== undefined, 'Transaction was not returned');
            assert(transaction instanceof Transaction, 'Transaction returned was not properly typed')
        });

        it('get-transactions', async function () {
            const transactions = await typedTokenCLI.getTransactions();
            assert(transactions !== undefined, 'Transactions were not returned');
            assert(Array.isArray(transactions), 'Transactions was not an array');
            assert(transactions.every(tx => tx instanceof Transaction), 'Transactions returned were not properly typed')

        });
    });
});
