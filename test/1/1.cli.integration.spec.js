const assert = require('chai').assert;
let TransactionBuilder = require('../../1/Transaction').TransactionBuilder;
let Transaction = require('../../1/Transaction').Transaction;
let Issuance = require('../../1/Issuance').Issuance;

// const testChainId = 'eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8';

describe('FAT-1 CLI Integration', function () {

    const CLIBuilder = require('../../cli/CLI').CLIBuilder;

    const cli = new CLIBuilder()
        .host('0.testnet.fat.dbgrow.com')
        .port(8078)
        .build();

    describe('Untyped Token CLI Methods', function () {
        const tokenCLI = cli.getTokenCLI('eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8');

        assert(tokenCLI.getTokenChainId() === 'eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8', 'Unexpected token chain ID in CLI: ' + tokenCLI.getTokenChainId());

        it('get-issuance', async function () {
            const issuance = await tokenCLI.getIssuance();
            assert(issuance !== undefined, 'Issuance was not returned');
            assert(typeof issuance === 'object', 'Issuance was not an object');
            console.log(JSON.stringify(issuance, undefined, 2));
        });

        it('get-transaction', async function () {
            const transaction = await tokenCLI.getTransaction('2774b2bbb41fce285351565604d3674208582aaf10b36c046d06259d9e97c536');
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

        it('get-nf-token', async function () {
            const token = await tokenCLI.getToken(0);
            assert(token !== undefined, 'Token was not returned');
            // assert(Array.isArray(transactions), 'Transactions was not an array');
            console.log(JSON.stringify(token, undefined, 2));
        });

        it('get-balance', async function () {
            const balance = await tokenCLI.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
            assert(balance !== undefined, 'Balance was not returned');
            assert(Number.isInteger(balance), 'Balance was not an number');
            assert(balance > 0, 'Balance was 0 (expected > 0)');
            console.log(balance)
        });

        it('get-nf-balance', async function () {
            const balance = await tokenCLI.getNFBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM', undefined, undefined, 'desc');
            assert(balance !== undefined, 'Balance was not returned');
            // assert(Number.isInteger(balance), 'Balance was not an number');
            // assert(balance > 0, 'Balance was 0 (expected > 0)');
            console.log(balance)
        });

        it('get-nf-tokens', async function () {
            const tokens = await tokenCLI.getNFTokens(undefined, undefined, 'desc');
            assert(tokens !== undefined, 'Tokens were not returned');
            console.log(JSON.stringify(tokens, undefined, 2))
        });

        it('get-stats', async function () {
            const stats = await tokenCLI.getStats();
            assert(stats !== undefined, 'Stats were not returned');
            assert(typeof stats === 'object', 'Stats was not an object');
            console.log(JSON.stringify(stats, undefined, 2));
        });

        it('send-transaction', async function () {
            this.timeout(60000);

            const randomId = getRandomInteger(12, 100000);

            const tx = new TransactionBuilder('eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8')
                .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", [randomId])
                .output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", [randomId])
                .build();

            // console.log(tx.getEntry());

            const result = await tokenCLI.sendTransaction(tx);
            console.log(JSON.stringify(result, undefined, 2));
        });

        it('send-transaction(coinbase)', async function () {
            this.timeout(60000);

            const randomId = getRandomInteger(100000, 99999999);

            const tx = new TransactionBuilder('eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8')
                .coinbaseInput([randomId])
                .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [randomId])
                .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
                .build();

            // console.log(JSON.stringify(tx.getExtIds(), undefined, 2));

            const result = await tokenCLI.sendTransaction(tx);
            console.log(JSON.stringify(result, undefined, 2));
        });
    });

    describe('Typed Token CLI Methods', function () {
        const typedTokenCLI = cli.getTypedTokenCLI('FAT-1', 'eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8');

        it('get-issuance', async function () {
            const issuance = await typedTokenCLI.getIssuance();
            assert(issuance !== undefined, 'Issuance was not returned');
            assert(issuance instanceof Issuance, 'Issuance returned was not properly typed')
        });

        it('get-transaction', async function () {
            const transaction = await typedTokenCLI.getTransaction('2774b2bbb41fce285351565604d3674208582aaf10b36c046d06259d9e97c536');
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

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}