const assert = require('chai').assert;

let TransactionBuilder = require('../../1/Transaction').TransactionBuilder;
let Transaction = require('../../1/Transaction').Transaction;
let Issuance = require('../../1/Issuance').Issuance;

const tokenChainId = '962a18328c83f370113ff212bae21aaf34e5252bc33d59c9db3df2a6bfda966f';

describe('FAT-1 CLI Integration', function () {

    const CLIBuilder = require('../../cli/CLI').CLIBuilder;

    const cli = new CLIBuilder()
        .host(process.env.fatd)
        .port(8078)
        .build();

    describe('Token CLI Methods', function () {

        it('get-issuance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            assert(tokenCLI.getTokenChainId() === tokenChainId, 'Unexpected token chain ID');
            assert(tokenCLI.getType() === 'FAT-1', 'Unexpected FAT type, expected FAT-1');

            const issuance = await tokenCLI.getIssuance();
            assert(issuance !== undefined, 'Issuance was not returned');
            assert(issuance instanceof Issuance, "Issuance was not properly typed")
        });

        it('get-transaction', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const transaction = await tokenCLI.getTransaction('abba93b0acfaacffa081c25467ec9e18f0314f77787cbba58ed97491e59db07c');
            assert(transaction !== undefined, 'Transaction was not returned');
            assert(transaction instanceof Transaction, 'Transaction was not properly typed');
        });

        it('get-transactions', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const transactions = await tokenCLI.getTransactions();
            assert(transactions !== undefined, 'Transactions were not returned');
            assert(Array.isArray(transactions), 'Transactions was not an array');
            assert(transactions.every(tx => tx instanceof Transaction))
        });

        it('get-balance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const balance = await tokenCLI.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
            assert(balance !== undefined, 'Balance was not returned');
            assert(Number.isInteger(balance), 'Balance was not an number');
            assert(balance > 0, 'Balance was 0 (expected > 0)');
        });

        it('get-nf-balance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const balance = await tokenCLI.getNFBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM', undefined, undefined, 'desc');
            assert(balance !== undefined, 'Balance was not returned');
            assert(Array.isArray(balance), 'Balance was not an array');
            assert(balance.length > 0, 'Balance was 0 tokens in length (expected > 0)');
        });

        it('get-nf-token', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const token = await tokenCLI.getNFToken(12);
            assert(token !== undefined, 'Token was not returned');
            assert(typeof token === 'object', 'Token returned was not an object');
        });

        it('get-nf-tokens', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const tokens = await tokenCLI.getNFTokens(undefined, undefined, 'desc');
            assert(tokens !== undefined, 'Tokens were not returned');
            assert(Array.isArray(tokens), 'Tokens returned were not an array');
            assert(tokens.every(token => typeof token === 'object'), 'Tokens returned were not an array of object');
        });

        it('get-stats', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const stats = await tokenCLI.getStats();
            assert(stats !== undefined, 'Stats were not returned');
            assert(typeof stats === 'object', 'Stats was not an object');
        });

        it('send-transaction', async function () {
            this.timeout(60000);

            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const randomId = getRandomInteger(12, 100000);

            const tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", [randomId])
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", [randomId])
                .build();

            const result = await tokenCLI.sendTransaction(tx);
        });

        it('send-transaction(With metadata)', async function () {
            this.timeout(60000);

            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const randomId = getRandomInteger(12, 100000);

            const tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", [randomId])
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", [randomId])
                .metadata({type: 'fat-js test run', timestamp: new Date().getTime()})
                .build();

            const result = await tokenCLI.sendTransaction(tx);
        });

        it('send-transaction (with NF token metadata)', async function () {
            this.timeout(60000);

            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const randomId = getRandomInteger(100001, 99999999);

            const tx = new TransactionBuilder(tokenChainId)
                .coinbaseInput([randomId])
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", [randomId])
                .tokenMetadata([
                    {
                        ids: [randomId],
                        metadata: {type: 'fat-js test run', timestamp: new Date().getTime()},
                    }
                ])
                .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
                .build();

            const result = await tokenCLI.sendTransaction(tx);
        });

        it('send-transaction(coinbase)', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            this.timeout(60000);

            const randomId = getRandomInteger(100001, 99999999);

            const tx = new TransactionBuilder(tokenChainId)
                .coinbaseInput([randomId])
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [randomId])
                .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
                .build();


            const result = await tokenCLI.sendTransaction(tx);
        });
    });
});

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}