const assert = require('chai').assert;

describe('Integration Spec', function () {

    const RPCBuilder = require('../../rpc/RPC').RPCBuilder;

    const RPC = new RPCBuilder()
        .host('localhost')
        .port(8078)
        .build();

    const TokenRPC = RPC.getTokenRPC('mytoken', "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762");

    describe('RPC Methods', function () {
        it('version', async function () {
            const version = await RPC.getVersion();
            assert(version !== undefined, 'Version was not returned');
            assert(typeof version === 'string', 'Version was not a string');
        });

        it('get-issuance', async function () {
            const issuance = await TokenRPC.getIssuance();
            assert(issuance !== undefined, 'Issuance was not returned');
            assert(typeof issuance === 'object', 'Issuance was not an object');
        });

        it('get-transaction', async function () {
            const transaction = await TokenRPC.getTransaction('15c757b10adfba465f5ae90e914b8bd9171510b31aa890bb3abf53b412cc40d2');
            assert(transaction !== undefined, 'Transaction was not returned');
            assert(typeof transaction === 'object', 'Transaction was not an object');
        });

        it('get-transactions', async function () {
            const transactions = await TokenRPC.getTransactions();
            assert(transactions !== undefined, 'Transactions were not returned');
            assert(Array.isArray(transactions), 'Transactions was not an array');
        });

        it('get-balance', async function () {
            const balance = await TokenRPC.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
            assert(balance !== undefined, 'Balance was not returned');
            assert(Number.isInteger(balance), 'Transactions was not an integer');
        });

        it('get-stats', async function () {
            const stats = await TokenRPC.getStats();
            assert(stats !== undefined, 'Stats were not returned');
            assert(typeof stats === 'object', 'Stats was not an object');
        });
    });
});
