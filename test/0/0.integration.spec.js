const assert = require('chai').assert;

describe('Integration Spec', function () {

    const CLIBuilder = require('../../cli/CLI').CLIBuilder;

    const cli = new CLIBuilder()
        .host('localhost')
        .port(8078)
        .build();

    const tokenCLI = cli.getTokenRPC('514b5c9694f3e225ba77f942d72269a023da8b0c3bc5e8aea8dceb565ab7d915');

    describe('RPC Methods', function () {
        it('get-daemon-properties', async function () {
            const properties = await cli.getDaemonProperties();
            assert(properties !== undefined, 'Properties was not returned');
            assert(typeof properties === 'object', 'Properties was not a string');
            assert(typeof properties.apiversion === 'string', 'API version was not a string');
            assert(typeof properties.fatdversion === 'string', 'FATD version was not a string');
        });

        it('get-issuance', async function () {
            const issuance = await tokenCLI.getIssuance();
            assert(issuance !== undefined, 'Issuance was not returned');
            assert(typeof issuance === 'object', 'Issuance was not an object');
            console.log(JSON.stringify(issuance, undefined, 2));
        });

        it('get-transaction', async function () {
            const transaction = await tokenCLI.getTransaction('f08bd163fbc6a004aa827350cc5f1df2f800c880614f968d5817446092fe3b78');
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
        });

        it('get-stats', async function () {
            const stats = await tokenCLI.getStats();
            assert(stats !== undefined, 'Stats were not returned');
            assert(typeof stats === 'object', 'Stats was not an object');
            console.log(JSON.stringify(stats, undefined, 2));
        });
    });
});
