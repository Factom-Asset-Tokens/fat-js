const assert = require('chai').assert;
const BigNumber = require('bignumber.js');

const CLIBuilder = require('../../cli/CLI').CLIBuilder;

describe('CLI Integration', function () {

    const cli = new CLIBuilder()
        .host(process.env.fatd)
        .port(8078)
        .build();

    describe('Daemon Methods', function () {
        it('get-daemon-properties', async function () {
            const properties = await cli.getDaemonProperties();
            assert(properties !== undefined, 'Properties was not returned');
            assert.isObject(properties);
            assert.isString(properties.apiversion);
            assert.isString(properties.fatdversion);
        });

        it('get-tracked-tokens', async function () {
            const tokens = await cli.getTrackedTokens();
            assert.isDefined(tokens);
            assert.isArray(tokens);
        });

        it('get-sync-status', async function () {
            const syncStatus = await cli.getSyncStatus();
            assert.isDefined(syncStatus);
            // assert.isArray(syncStatus);
        });
    });

    describe('Global Token Methods', function () {
        it('get-balances', async function () {
            const balances = await cli.getBalances('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
            assert.isObject(balances);
            assert.isTrue(Object.values(balances).every(amount => amount instanceof BigNumber));
        });
    });
});