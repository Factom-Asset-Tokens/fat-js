const util = require('../../util');
const constant = require('../../constant');
const assert = require('chai').assert;

let TransactionBuilder = require('../../1/Transaction').TransactionBuilder;
let Transaction = require('../../1/Transaction').Transaction;
let Issuance = require('../../1/Issuance').Issuance;

const tokenChainId = '962a18328c83f370113ff212bae21aaf34e5252bc33d59c9db3df2a6bfda966f';

describe('FAT-1 CLI Integration', function () {

    this.timeout(10000);

    const CLIBuilder = require('../../cli/CLI').CLIBuilder;

    const cli = new CLIBuilder()
        .host(process.env.fatd)
        .port(8078)
        .build();

    describe('Token CLI Methods', function () {

        it('get-issuance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            assert.strictEqual(tokenCLI.getTokenChainId(), tokenChainId);
            assert.strictEqual(tokenCLI.getType(), constant.FAT1);

            const issuance = await tokenCLI.getIssuance();
            assert.isDefined(issuance);
            assert.instanceOf(issuance, Issuance)
        });

        it('get-transaction', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const transaction = await tokenCLI.getTransaction('abba93b0acfaacffa081c25467ec9e18f0314f77787cbba58ed97491e59db07c');
            assert.isDefined(transaction);
            assert.instanceOf(transaction, Transaction);
            assert.strictEqual(transaction.getEntryhash(), 'abba93b0acfaacffa081c25467ec9e18f0314f77787cbba58ed97491e59db07c');
            assert.isNumber(transaction.getTimestamp());
        });

        it('get-transactions', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const transactions = await tokenCLI.getTransactions();
            assert.isDefined(transactions, 'Transactions were not returned');
            assert.isArray(transactions);
            assert.isTrue(transactions.every(tx => tx instanceof Transaction))
        });

        it('get-balance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const balance = await tokenCLI.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
            assert.isDefined(balance);
            assert.isNumber(balance);
            assert.isAbove(balance, 0);
        });

        it('get-nf-balance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const balance = await tokenCLI.getNFBalance({address: 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM'});
            assert.isDefined(balance);
            assert.isArray(balance);
            assert.isAbove(balance.length, 0);
            assert.isTrue(util.validateNFIds(balance));
        });

        it('get-nf-token', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const token = await tokenCLI.getNFToken(12);
            assert.isDefined(token);
            assert.isObject(token);
        });

        it('get-nf-tokens', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const tokens = await tokenCLI.getNFTokens();
            assert.isDefined(tokens);
            assert.isArray(tokens);
            assert.isTrue(tokens.every(token => typeof token === 'object'));
        });

        it('get-stats', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const stats = await tokenCLI.getStats();
            assert.isDefined(stats);
            assert.isObject(stats);
        });

        it('send-transaction', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const randomId = getRandomInteger(12, 100000);

            const tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", [randomId])
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", [randomId])
                .build();

            const result = await tokenCLI.sendTransaction(tx);
            assert.isObject(result);
        });

        it('send-transaction(With metadata)', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const randomId = getRandomInteger(12, 100000);

            const tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", [randomId])
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", [randomId])
                .metadata({type: 'fat-js test run', timestamp: new Date().getTime()})
                .build();

            const result = await tokenCLI.sendTransaction(tx);
            assert.isObject(result);
        });

        it('send-transaction (with NF token metadata)', async function () {
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
            assert.isObject(result);
        });

        it('send-transaction(coinbase)', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const randomId = getRandomInteger(100001, 99999999);

            const tx = new TransactionBuilder(tokenChainId)
                .coinbaseInput([randomId])
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [randomId])
                .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
                .build();

            const result = await tokenCLI.sendTransaction(tx);
            assert.isObject(result);
        });
    });
});

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}