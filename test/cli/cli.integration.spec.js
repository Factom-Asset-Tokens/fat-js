const assert = require('chai').assert;
let CLIBuilder = require('../../cli/CLI').CLIBuilder;

describe('CLI Integration', function () {

    const cli = new CLIBuilder()
        .host('localhost')
        .port(8078)
        .build();

    describe('Daemon Methods', function () {
        it('get-daemon-properties', async function () {
            const properties = await cli.getDaemonProperties();
            console.log(JSON.stringify(properties, undefined, 2));
            assert(properties !== undefined, 'Properties was not returned');
            assert(typeof properties === 'object', 'Properties was not a string');
            assert(typeof properties.apiversion === 'string', 'API version was not a string');
            assert(typeof properties.fatdversion === 'string', 'FATD version was not a string');
        });

        it('get-tracked-tokens', async function () {
            const tokens = await cli.getTrackedTokens();
            console.log(JSON.stringify(tokens, undefined, 2))
            assert(tokens !== undefined, 'Tokens were not returned');
            assert(Array.isArray(tokens), 'Tokens was not an array of tracked tokens');
        });
    });
});