const assert = require('chai').assert;

const fctAddrUtils = require('factom/src/addresses');

const ES = 'Es3k4L7La1g7CY5zVLer21H3JFkXgCBCBx8eSM2q9hLbevbuoL6a'; //EC1tE4afVGPrBUStDhZPx1aHf4yHqsJuaDpM7WDbXCcYxruUxj2D

//Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ', 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');

describe('CLI Unit', function () {

    describe('CLI Builder', function () {

        let CLIBuilder = require('../../cli/CLI').CLIBuilder;
        let BaseTokenCLI = require('../../cli/CLI').BaseTokenCLI;
        let TypedTokenCLI = require('../../cli/CLI').TypedTokenCLI;

        it('Builder Methods', function () {
            let cli = new CLIBuilder()
                .host('fatnode.mysite.com')
                .port(1234)
                .auth('my-user', 'my-pass')
                .build();


        });

        it('CLI Methods', function () {
            let cli = new CLIBuilder().build();

            //Get Untyped Token CLI
            const untypedTokenCLI = cli.getTokenCLI('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');
            assert(untypedTokenCLI instanceof BaseTokenCLI, 'getTokenCLI did not return an object of type BaseTokenCLI');

            assert(typeof untypedTokenCLI['getBalance'] === 'function', "getBalance was not a function");

            //Get Typed Token CLI
            const typedTokenCLI = cli.getTypedTokenCLI('FAT-0', '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');
            assert(typedTokenCLI instanceof TypedTokenCLI, 'getTokenCLI did not return an object of type TypedTokenCLI');
        });

        it('Untyped Token CLI Methods', function () {
            let cli = new CLIBuilder().build();
            const untypedTokenCLI = cli.getTokenCLI('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');

            assert(untypedTokenCLI.getTokenChainId() === '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');
            assert(typeof untypedTokenCLI['getIssuance'] === 'function', "getIssuance was not a function");
            assert(typeof untypedTokenCLI['getTransaction'] === 'function', "getTransaction was not a function");
            assert(typeof untypedTokenCLI['getTransactions'] === 'function', "getTransactions was not a function");
            assert(typeof untypedTokenCLI['getBalance'] === 'function', "getBalance was not a function");
            assert(typeof untypedTokenCLI['getStats'] === 'function', "getStats was not a function");
            assert(typeof untypedTokenCLI['sendTransaction'] === 'function', "sendTransaction was not a function");
        });

        it('Typed Token CLI Methods', function () {
            let cli = new CLIBuilder().build();
            const typedTokenCLI = cli.getTokenCLI('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');

            assert(typedTokenCLI.getTokenChainId() === '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');
            assert(typeof typedTokenCLI['getIssuance'] === 'function', "getIssuance was not a function");
            assert(typeof typedTokenCLI['getTransaction'] === 'function', "getTransaction was not a function");
            assert(typeof typedTokenCLI['getTransactions'] === 'function', "getTransactions was not a function");
            assert(typeof typedTokenCLI['getBalance'] === 'function', "getBalance was not a function");
            assert(typeof typedTokenCLI['getStats'] === 'function', "getStats was not a function");
            assert(typeof typedTokenCLI['sendTransaction'] === 'function', "sendTransaction was not a function");
        });

    })

});