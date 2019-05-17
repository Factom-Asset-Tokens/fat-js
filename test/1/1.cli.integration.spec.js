const util = require('../../util');
const constant = require('../../constant');
const assert = require('chai').assert;

let TransactionBuilder = require('../../1/TransactionBuilder');
let Transaction = require('../../1/Transaction');
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
            assert.instanceOf(issuance, Issuance);

            //regression testing
            assert.strictEqual(issuance.getType(), 'FAT-1');
            assert.strictEqual(issuance.getTokenId(), 'testnf');
            assert.strictEqual(issuance.getSymbol(), 'T1');
            assert.strictEqual(issuance.getSupply(), -1);
            assert.strictEqual(issuance.getIssuerIdentityRootChainId(), '888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced');
            assert.strictEqual(issuance.getTokenChainId(), tokenChainId);
            assert.strictEqual(issuance.getEntryhash(), '80568d0f194a1a65d101d70099d820ea90d08badd94fef3944c53841952a603b');
            assert.strictEqual(issuance.getTimestamp(), 1550698020);
        });

        it('get-transaction', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const transaction = await tokenCLI.getTransaction('abba93b0acfaacffa081c25467ec9e18f0314f77787cbba58ed97491e59db07c');
            assert.isDefined(transaction);
            assert.instanceOf(transaction, Transaction);
            assert.strictEqual(transaction.getEntryhash(), 'abba93b0acfaacffa081c25467ec9e18f0314f77787cbba58ed97491e59db07c');
            assert.isNumber(transaction.getTimestamp());

            //regression testing
            assert.strictEqual(JSON.stringify(transaction.getInputs()), JSON.stringify({FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC: [34317712]}));
            assert.strictEqual(JSON.stringify(transaction.getOutputs()), JSON.stringify({FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM: [34317712]}));
            assert.isUndefined(transaction.metadata);
            assert.strictEqual(transaction.getEntryhash(), 'abba93b0acfaacffa081c25467ec9e18f0314f77787cbba58ed97491e59db07c');
            assert.strictEqual(transaction.getTimestamp(), 1550698680);
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
            assert.strictEqual(token.id, 12);
            assert.isTrue(require('factom/src/addresses').isValidFctAddress(token.owner));
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

            //regression testing
            assert.isNumber(stats.circulating);
            assert.isNumber(stats.burned);
            assert.isNumber(stats.transactions);
            assert.isNumber(stats.issuancets);
            assert.isNumber(stats.lasttxts);
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

            //regression testing
            assert.strictEqual(result.chainid, tokenChainId);
            assert.isString(result.txid);
            assert.isString(result.entryhash);
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