const fctUtil = require('factom/src/util');
const fctAddrUtils = require('factom/src/addresses');
const nacl = require('tweetnacl/nacl-fast').sign;

const util = require('../../util');
const constant = require('../../constant');
const assert = require('chai').assert;
const BigNumber = require('bignumber.js');

const TransactionBuilder = require('../../1/TransactionBuilder');
const Transaction = require('../../1/Transaction');
const Issuance = require('../../1/Issuance');

const tokenChainId = '962a18328c83f370113ff212bae21aaf34e5252bc33d59c9db3df2a6bfda966f';

describe('FAT-1 CLI Integration', function () {

    this.timeout(10000);

    const CLIBuilder = require('../../cli/CLI').CLIBuilder;

    const cli = new CLIBuilder()
        .host(process.env.fatd || 'localhost')
        .port(Number.parseInt(process.env.port || 8078))
        .build();

    describe('Token CLI Methods', function () {

        it('get-issuance', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            assert.strictEqual(tokenCLI.getChainId(), tokenChainId);
            assert.strictEqual(tokenCLI.getType(), constant.FAT1);

            const issuance = await tokenCLI.getIssuance();
            assert.isDefined(issuance);
            assert.instanceOf(issuance, Issuance);

            //regression testing
            assert.strictEqual(issuance.getType(), 'FAT-1');
            assert.strictEqual(issuance.getTokenId(), 'testnf');
            assert.strictEqual(issuance.getSymbol(), 'T1');
            assert.instanceOf(issuance.getSupply(), BigNumber);
            assert.isTrue(issuance.getSupply().isEqualTo(-1));
            assert.strictEqual(issuance.getIssuerChainId(), '888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced');
            assert.strictEqual(issuance.getChainId(), tokenChainId);
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
            assert.instanceOf(balance, BigNumber);
            assert.isAbove(balance.toNumber(), 0);
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
                .sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
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
                .sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
                .build();

            const result = await tokenCLI.sendTransaction(tx);
            assert.isObject(result);
        });

        it('send-transaction(burn)', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            const randomId = getRandomInteger(12, 100000);

            const tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", [randomId])
                .burnOutput([randomId])
                .build();

            const result = await tokenCLI.sendTransaction(tx);
            assert.isObject(result);
        });

        it('send-transaction(externally signed)', async function () {
            const tokenCLI = await cli.getTokenCLI(tokenChainId);

            //test signing with private key externally, this will simulate an external signature such as from the Ledger
            let keyPair = nacl.keyPair.fromSeed(fctAddrUtils.addressToKey("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ"));
            let pubaddr = fctAddrUtils.keyToPublicFctAddress(keyPair.publicKey);

            const randomId = getRandomInteger(12, 100000);

            let unsignedTx = new TransactionBuilder(tokenChainId)
                .input(pubaddr, [randomId])
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", [randomId])
                .build();

            let extsig = nacl.detached(fctUtil.sha512(unsignedTx.getMarshalDataSig(0)), keyPair.secretKey);

            let signedTx = new TransactionBuilder(unsignedTx)
                .pkSignature(keyPair.publicKey, extsig)
                .build();

            const result = await tokenCLI.sendTransaction(signedTx);
            assert.isObject(result);
        });
    });

    describe('Pending Entries', function () {
        this.timeout(60000);

        const pendingCLI = new CLIBuilder()
            .host(process.env.fatd || 'localhost')
            .port(Number.parseInt(process.env.port || 8078))
            .pending(true) //test pending entry support
            .build();

        let pendingTokenCLI;

        it('Verify balance change with pending transaction', async function () {

            pendingTokenCLI = await pendingCLI.getTokenCLI(tokenChainId);

            const randomAddress = fctAddrUtils.generateRandomFctAddress().public;

            const randomId = getRandomInteger(12, 100000);

            const tx = new TransactionBuilder(tokenChainId)
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", [randomId])
                .output(randomAddress, [randomId])
                .build();

            //check the token stats pre-tx
            const preStats = await pendingTokenCLI.getStats();

            //get all the token balances at the random output address before the tx
            //check that the balance is zero for this chain
            const preBalances = await pendingCLI.getBalances(randomAddress);
            assert.isUndefined(preBalances[tokenChainId]);

            //get the balance of the random output address before the tx
            //check that the balance at the random address is zero to start
            const preBalance = await pendingTokenCLI.getBalance(randomAddress);
            assert.isTrue(preBalance.isEqualTo(0));

            //check the random address owns no NF tokens yet
            const preNFBalance = await pendingTokenCLI.getNFBalance({address: randomAddress});
            assert.lengthOf(preNFBalance, 0);

            //send the transaction
            const result = await pendingTokenCLI.sendTransaction(tx);

            //wait for the pending tx to get picked up
            await util.sleep(30000); //wait the default pending tx interval & then a little bit

            //get the tx we just sent
            const transaction = await pendingTokenCLI.getTransaction(result.entryhash);
            assert.isDefined(transaction);
            assert.instanceOf(transaction, Transaction);
            assert.strictEqual(transaction.getEntryhash(), result.entryhash);
            assert.isTrue(transaction.getPending());

            //verify the tx we just sent is in the list recent transactions
            const transactions = await pendingTokenCLI.getTransactions({entryhash: result.entryhash});
            assert.isDefined(transactions.find(tx => tx.getEntryhash() === result.entryhash));

            //check the token stats post-tx
            const postStats = await pendingTokenCLI.getStats();

            //check the TX added to the tx count in stats
            assert.isTrue(postStats.transactions.isGreaterThan(preStats.transactions));

            //check the TX added one to the nonzero holder count in stats
            assert.isTrue(postStats.nonzerobalances.isEqualTo(preStats.nonzerobalances.plus(1)));

            //check the list of all assets on the random now has the proper balance for this token
            const postBalances = await pendingCLI.getBalances(randomAddress);
            assert.isDefined(postBalances[tokenChainId]);
            assert.isTrue(postBalances[tokenChainId].isEqualTo(1));

            //get the output address balance after the tx
            const postBalance = await pendingTokenCLI.getBalance(randomAddress);
            assert.isTrue(postBalance.isEqualTo(1));

            //check the address contains the recently sent token by ID
            const postNFBalance = await pendingTokenCLI.getNFBalance({address: randomAddress});
            assert.include(postNFBalance, randomId);

            //get the NF token and verify it's owner is the same as where we just sent it
            const nfToken = await pendingTokenCLI.getNFToken(randomId);
            assert.strictEqual(nfToken.owner, randomAddress);
        });
    });

});

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}