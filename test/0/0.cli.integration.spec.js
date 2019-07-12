const constant = require('../../constant');
const assert = require('chai').assert;
const BigNumber = require('bignumber.js');
const JSONBig = require('json-bigint')({strict: true});

const TransactionBuilder = require('../../0/TransactionBuilder');
const Transaction = require('../../0/Transaction');
const Issuance = require('../../0/Issuance');

const tokenChainId = '0cccd100a1801c0cf4aa2104b15dec94fe6f45d0f3347b016ed20d81059494df';

describe('FAT-0 CLI Integration', function () {

    this.timeout(10000);

    const CLIBuilder = require('../../cli/CLI').CLIBuilder;

    const cli = new CLIBuilder()
        .host(process.env.fatd)
        .port(8078)
        .build();

    describe('CLI Methods', function () {

        it('get-issuance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            assert.strictEqual(tokenCLI.getChainId(), tokenChainId);
            assert.strictEqual(tokenCLI.getType(), constant.FAT0);

            const issuance = await tokenCLI.getIssuance();
            assert.isDefined(issuance);
            assert.instanceOf(issuance, Issuance);

            //regression testing
            assert.strictEqual(issuance.getType(), 'FAT-0');
            assert.strictEqual(issuance.getTokenId(), 'test');
            assert.strictEqual(issuance.getSymbol(), 'T0');
            assert.instanceOf(issuance.getSupply(), BigNumber);
            assert.isTrue(issuance.getSupply().isEqualTo(-1));
            assert.strictEqual(issuance.getIssuerChainId(), '888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced');
            assert.strictEqual(issuance.getChainId(), tokenChainId);
            assert.strictEqual(issuance.getEntryhash(), 'fc0f57ea3a4dc5b8ffc1a9c051f4b6ae0cd7137f9110b98e3c3eb08f132a5e18');
            assert.strictEqual(issuance.getTimestamp(), 1550612940);
        });

        it('get-transaction', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const transaction = await tokenCLI.getTransaction('68f3ca3a8c9f7a0cb32dc9717347cb179b63096e051a60ce8be9c292d29795af');
            assert.isDefined(transaction);
            assert.instanceOf(transaction, Transaction);

            //regression testing
            assert.strictEqual(JSONBig.stringify(transaction.getInputs()), JSONBig.stringify({FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC: new BigNumber(10)}));
            assert.strictEqual(JSONBig.stringify(transaction.getOutputs()), JSONBig.stringify({FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM: new BigNumber(10)}));
            assert.isUndefined(transaction.metadata);
            assert.strictEqual(transaction.getEntryhash(), '68f3ca3a8c9f7a0cb32dc9717347cb179b63096e051a60ce8be9c292d29795af');
            assert.strictEqual(transaction.getTimestamp(), 1550696040);
        });

        it('get-transaction (amount over Number.MAX_SAFE_INTEGER)', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const transaction = await tokenCLI.getTransaction('a652d4db99ab853b6fb1404411ef36b1b3769c9cc91346807ede4015a3439985');
            assert.isDefined(transaction);
            assert.instanceOf(transaction, Transaction);

            //regression testing for large numbers!
            assert.strictEqual(JSONBig.stringify(transaction.getInputs()), JSONBig.stringify({FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC: new BigNumber("9007199254740992")}));
            assert.strictEqual(JSONBig.stringify(transaction.getOutputs()), JSONBig.stringify({FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM: new BigNumber("9007199254740992")}));
        });

        it('get-transactions', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const transactions = await tokenCLI.getTransactions();
            assert.isDefined(transactions);
            assert.isArray(transactions);
            assert.isTrue(transactions.every(tx => tx instanceof Transaction));
        });

        it('get-balance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const balance = await tokenCLI.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
            assert.isDefined(balance);
            assert.instanceOf(balance, BigNumber);
            assert.isTrue(balance.isGreaterThan(new BigNumber("9007199254743307"))); //test returned balance is over max int limit allowed by JS
        });

        it('get-stats', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const stats = await tokenCLI.getStats();
            assert.isDefined(stats);
            assert.isObject(stats);

            //regression testing
            assert.instanceOf(stats.circulating, BigNumber);
            assert.isTrue(stats.circulating.isInteger());
            assert.isTrue(stats.circulating.isGreaterThan(0));

            assert.instanceOf(stats.burned, BigNumber);
            assert.isTrue(stats.burned.isInteger());
            assert.isTrue(stats.burned.isGreaterThan(0));

            assert.instanceOf(stats.transactions, BigNumber);
            assert.isTrue(stats.transactions.isInteger());
            assert.isTrue(stats.transactions.isGreaterThan(0));

            assert.isNumber(stats.issuancets);
            assert.isNumber(stats.lasttxts);
        });

        it('send-transaction', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 1)
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", 1)
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

            const tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 1)
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", 1)
                .metadata({type: 'fat-js test run'})
                .build();

            const result = await tokenCLI.sendTransaction(tx);
            assert.isObject(result);
        });

        it('send-transaction(coinbase)', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            let tx = new TransactionBuilder(tokenChainId)
                .coinbaseInput(10)
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
                .sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
                .build();

            const result = await tokenCLI.sendTransaction(tx);
            assert.isObject(result);
        });

        it('send-transaction(burn)', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            let tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 1)
                .burnOutput(1)
                .build();

            const result = await tokenCLI.sendTransaction(tx);
            assert.isObject(result);
        });
    });

});
