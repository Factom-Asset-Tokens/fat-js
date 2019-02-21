const assert = require('chai').assert;
let CLIBuilder = require('../../cli/CLI').CLIBuilder;

describe('CLI Unit', function () {

    it('CLI Builder', function () {
        let cli = new CLIBuilder()
            .host(process.env.fatd)
            .port(1234)
            .auth('my-user', 'my-pass')
            .build();
    });
});