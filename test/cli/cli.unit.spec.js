const assert = require('chai').assert;
let CLIBuilder = require('../../cli/CLI').CLIBuilder;

describe('CLI Unit', function () {

    it('CLI Builder', function () {
        let cli = new CLIBuilder()
            .host('fatnode.mysite.com')
            .port(1234)
            .auth('my-user', 'my-pass')
            .build();
    });

    it('Typed Token CLI', function () {
        let cli = new CLIBuilder()
            .host('fatnode.mysite.com')
            .port(1234)
            .auth('my-user', 'my-pass')
            .build();

        const FAT0CLI = require('../../0/CLI').CLI;
        const FAT1CLI = require('../../1/CLI').CLI;

        const fat0 = cli.getTypedTokenCLI('FAT-0', '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');
        assert(fat0 instanceof FAT0CLI, 'FAT-0 token type did not return the proper typed token CLI');

        const fat1 = cli.getTypedTokenCLI('FAT-1', 'eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8');
        assert(fat1 instanceof FAT1CLI, 'FAT-1 token type did not return the proper typed token CLI');

        //check invalid token type is caught
        assert.throws(() => cli.getTypedTokenCLI('ABC', '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec'));
    });

});