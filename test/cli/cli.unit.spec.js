const assert = require('chai').assert;
let CLIBuilder = require('../../cli/CLI').CLIBuilder;
let FAT0CLI = require('../../0/CLI').CLI;
let FAT1CLI = require('../../1/CLI').CLI;

describe('CLI Unit', function () {

    it('CLI Builder', function () {
        let cli = new CLIBuilder()
            .host(process.env.fatd)
            .port(1234)
            .secure(true)
            .protocol('https')
            .build();
    });

    it('Instantiate CLI Sync', function () {
        let cli = new CLIBuilder()
            .host(process.env.fatd)
            .port(1234)
            .build();

        let tokenCLI = cli.getTokenCLISync('0cccd100a1801c0cf4aa2104b15dec94fe6f45d0f3347b016ed20d81059494df', 'FAT-0');
        assert.instanceOf(tokenCLI, FAT0CLI);

        tokenCLI = cli.getTokenCLISync('962a18328c83f370113ff212bae21aaf34e5252bc33d59c9db3df2a6bfda966f', 'FAT-1');
        assert.instanceOf(tokenCLI, FAT1CLI);

        assert.throws(() => cli.getTokenCLISync('962a18328c83f370113ff212bae21aaf34e5252bc33d59c9db3df2a6bfda966f', 'ABC'));
    });
});