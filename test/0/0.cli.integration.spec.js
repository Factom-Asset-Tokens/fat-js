const assert = require('chai').assert;

const TransactionBuilder = require('../../0/Transaction').TransactionBuilder;

const Transaction = require('../../0/Transaction').Transaction;
const Issuance = require('../../0/Issuance').Issuance;

const tokenChainId = '0cccd100a1801c0cf4aa2104b15dec94fe6f45d0f3347b016ed20d81059494df';

describe('FAT-0 CLI Integration', function () {

    const CLIBuilder = require('../../cli/CLI').CLIBuilder;

    const cli = new CLIBuilder()
        .host(process.env.fatd)
        .port(8078)
        .build();

    describe('CLI Methods', function () {

        it('get-issuance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            assert(tokenCLI.getTokenChainId() === tokenChainId, 'Unexpected token chain ID');
            assert(tokenCLI.getType() === 'FAT-0', 'Unexpected FAT type, expected FAT-0');

            const issuance = await tokenCLI.getIssuance();
            assert(issuance !== undefined, 'Issuance was not returned');
            assert(issuance instanceof Issuance, 'Issuance was not typed properly');
        });

        it('get-transaction', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const transaction = await tokenCLI.getTransaction('68f3ca3a8c9f7a0cb32dc9717347cb179b63096e051a60ce8be9c292d29795af');
            assert(transaction !== undefined, 'Transaction was not returned');
            assert(transaction instanceof Transaction, 'Issuance was not typed properly');
        });

        it('get-transactions', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const transactions = await tokenCLI.getTransactions();
            assert(transactions !== undefined, 'Transactions were not returned');
            assert(Array.isArray(transactions), 'Transactions was not an array');
            assert(transactions.every(tx => tx instanceof Transaction));
        });

        it('get-balance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const balance = await tokenCLI.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
            assert(balance !== undefined, 'Balance was not returned');
            assert(Number.isInteger(balance), 'Balance was not an number');
            assert(balance > 0, 'Balance was 0 (expected > 0)');
        });

        it('get-stats', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const stats = await tokenCLI.getStats();
            assert(stats !== undefined, 'Stats were not returned');
            assert(typeof stats === 'object', 'Stats was not an object');
        });

        it('send-transaction', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 1)
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", 1)
                .build();

            const result = await tokenCLI.sendTransaction(tx);
        });

        it('send-transaction(With metadata)', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 1)
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", 1)
                .metadata({type: 'fat-js test run'})
                .build();

            const result = await tokenCLI.sendTransaction(tx);
        });

        it('send-transaction(coinbase)', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            let tx = new TransactionBuilder(tokenChainId)
                .coinbaseInput(10)
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
                .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
                .build();

            const result = await tokenCLI.sendTransaction(tx);
        });
    });

});
