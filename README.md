![](https://png.icons8.com/ios-glyphs/128/3498db/octahedron.png)![](https://png.icons8.com/ios/40/3498db/javascript-filled.png)

# fat-js

[![npm (scoped)](https://img.shields.io/npm/v/@fat-token/fat-js.svg)](https://www.npmjs.com/package/@fat-token/fat-js)

[![Build Status](https://travis-ci.com/Factom-Asset-Tokens/fat-js.svg?branch=master)](https://travis-ci.com/Factom-Asset-Tokens/fat-js)

[![Coverage Status](https://coveralls.io/repos/github/Factom-Asset-Tokens/fat-js/badge.svg?branch=master)](https://coveralls.io/github/Factom-Asset-Tokens/fat-js?branch=master)



[Factom Asset Token](https://github.com/DBGrow/FAT) client implementation in JS :blue_heart:

Currently supports **FAT-0** and **FAT-1** token standards.



**Note:** FAT is experimental software. This commit has been tested with [fatd](https://github.com/Factom-Asset-Tokens/fatd) version `v0.5.1` - commit `39a50ed13112530f1b8ec07f3a1e6d58d87e8769`



## Installation

NPM via package.json:

```json
"dependencies":{
	"@fat-token/fat-js": "1.0.0"
}
```

or

NPM CLI:

```
npm i @fat-token/fat-js
```



## Browser Bundle

A browser friendly bundle of the current fat-js version can be found at `dist/fatjs.js`

To build the bundle from source ensure you have browserify installed, and simply navigate to the root of the fat-js project and run:

```bash
npm run build
```

A fresh `fatjs.js` will be built in the  `dist` directory.



# Transactions

Build and use FAT transactions

## FAT-0

### [Transaction Builder](docs/TransactionBuilder0.md)

#### Example

```javascript
const TransactionBuilder = require('fat-js').FAT0.TransactionBuilder

const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

let tx = new TransactionBuilder(tokenChainId)
	.input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
	.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
	.build();

//with metadata
tx = new TransactionBuilder(tokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
            .metadata({type: 'fat-js test run', timestamp: new Date().getTime()})
            .build();

//You can also use string or  BigNumber(https://github.com/MikeMcl/bignumber.js/) format for larger transactions than a native JS integer would support
tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", '19007199254740991')
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", '19007199254740991')
            .build();
```



### [Transaction](docs/Transaction0.md)

#### Example

```javascript
const Transaction = require('fat-js').FAT0.Transaction

//From transaction builder
let tx = new TransactionBuilder(tokenChainId)
	.input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
	.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
	.build();

tx.getInputs(); // => {"FA1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm": new BigNumber(150)}

tx.getTokenChainId(); // => "013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec"


//or from API response
const response =
    {
        entryhash: '68f3ca3a8c9f7a0cb32dc9717347cb179b63096e051a60ce8be9c292d29795af',
        timestamp: 1550696040,
        data:
            {
                inputs: {FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC: new BigNumber(150)},
                outputs: {FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM: new BigNumber(150)}
            }
    };

tx = new Transaction(response);

tx.getEntryHash(); // => "68f3ca3a8c9f7a0cb32dc9717347cb179b63096e051a60ce8be9c292d29795af"
```




## FAT-1

### [Transaction Builder](docs/TransactionBuilder1.md)

#### Example

```javascript
const TransactionBuilder = require('fat-js').FAT1.TransactionBuilder

const tokenId = 'mytoken';
const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

 let tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [{min: 0, max: 3}, 150])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [{min: 0, max: 3}, 150])
            .build();

//NF token metadata
tx = new TransactionBuilder(testTokenChainId)
            .coinbaseInput([10])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
            .tokenMetadata([
                {
                    ids: [10],
                    metadata: {type: 'fat-js test run', timestamp: new Date().getTime()},
                }
            ])
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
            .build();
```



### [Transaction](docs/Transaction1.md)

#### Example

```javascript
const Transaction = require('fat-js').FAT1.Transaction

//From transaction builder
let tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [{min: 0, max: 3}, 150])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [{min: 0, max: 3}, 150])
            .build();

tx.getInputs(); // => {"FA1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm":[{min: 0, max: 3}, 150]}

tx.getTokenChainId(); // => "013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec"


//or from API response
const response =
    {
        entryhash: '68f3ca3a8c9f7a0cb32dc9717347cb179b63096e051a60ce8be9c292d29795af',
        timestamp: 1550696040,
        data:
            {
                inputs: {FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC: [{min: 0, max: 3}, 150]},
                outputs: {FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM: [{min: 0, max: 3}, 150]}
            }
    };

tx = new Transaction(response);

tx.getEntryHash(); // => "68f3ca3a8c9f7a0cb32dc9717347cb179b63096e051a60ce8be9c292d29795af"
```



# CLI

#### [Complete CLI Documentation](docs/CLI.md)

## Instantiate FAT CLI

```javascript
const CLIBuilder = require('fat-js').CLIBuilder
let cli = new CLIBuilder()
    .host('fatnode.mysite.com')
    .port(8078)
	.timeout(3500) //optional, timeout ms
    .build();
```



## Daemon CLI

### Get Daemon Properties

Get a object containing a readout of properties for the connected fatd node

```javascript
const properties = await cli.getDaemonProperties();

/*
{
  "fatdversion": "r162.3d7f272",
  "apiversion": "1"
}
*/
```

### Get Daemon Sync Status

Get a object containing a readout of properties for the connected fatd node

```javascript
const properties = await cli.getDaemonProperties();

/*
{
  "jsonrpc": "2.0",
  "result": {
    "syncheight": 70990,
    "factomheight": 70990
  },
  "id": 6482
}
*/
```



## Token CLI

#### [Complete FAT-0 Token CLI Documentation](docs/CLI0.md)

#### [Complete FAT-1 Token CLI Documentation](docs/CLI1.md)

The token CLI allows access to both FAT-0 and FAT-1 data from fatd.

Before creating a token you must create a token CLI instance using the token's chain ID:



### Instantiate Token CLI

```javascript
const tokenCLI = await cli.getTokenCLI('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');
```

Fat-js will automatically and asynchronously determine the proper FAT token type to use for the CLI. 

You can also synchronously generate a token CLI instance if if you already know the token type:

```javascript
const tokenCLI = await cli.getTokenCLISync('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec','FAT-0');
```



### Get Issuance

Get a FAT issuance entry for the selected token

```javascript
const issuance = await tokenCLI.getIssuance();
```



### Get Transaction

Get a FAT transaction Object by its entryhash

```javascript
const transaction = await tokenCLI.getTransaction('d9b6ca250c97fdbe48eb3972a7d4b906aac54f2048982acfcb6019bc2a018be9');
```



### Get Transactions

Get a paged list of FAT transactions.

```javascript
const transactions = await tokenCLI.getTransactions();
```



### Get Balance

Get the numeric balance of a public Factoid address. Returned as a [BigNumber](https://www.npmjs.com/package/bignumber.js)

```javascript
let balance = await tokenCLI.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');

/*
new BigNumber(150)
*/
```

*Note: The NF token balance count is returned for FAT-1 tokens*



### Get Non-Fungible Balance

Get the tokens owned by a public Factoid address.

```javascript
let tokens = await tokenCLI.getNFBalance(params);

/*
[
  0,
  1,
  3,
  4
]
*/
```


## Send A Transaction

Send a FAT-0 or FAT-1 transaction.

```javascript
const tx = new TransactionBuilder(tokenChainId)
	.input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
	.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
	.build();

const result = await tokenCLI.sendTransaction(tx);

/*
{
  "chainid": "eb55f75551acfb9c4d8dc1f09f11f2512d8aa98ebc1c0d05652ce8d92102fad8",
  "txid": "6eeb96a4b7cb58cb5e7455c96b4d5db74a627485291820c3f3f3e2a7854ebfbe",
  "entryhash": "5a6c6d1a2c8275c5854e5ecc54a10814834580ea4114d0c0f4348d21849284e2"
}
*/
```



## Issuance Builder

```javascript
const CLIBuilder = require('fat-js').FAT0.IssuanceBuilder
const issuance = new IssuanceBuilder("mytoken", "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
                .supply(1000000)
                .symbol('TTK')
                .build()
```



## Utility Methods

### Calculate Token Chain ID

Get token chain ID from token ID and issuer root chain ID

```javascript
const chainId = util.getTokenChainId('mytoken', '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584').toString('hex')

/*
0dce2c10a51a7df92e2e9e4f848da054509ff9761311bd58ebcc55df656fb409
*/
```



### Validate Non-Fungible Token ID Range

Take an array of integers or integer ranges representing NF token IDs and validate them

```javascript
let valid = util.validateNFIds([0, 1, 2, {min: 3, max: 3}, {min: 4, max: 100}]);

/*
=> true
*/

valid = util.validateNFIds([0, 1, 2, -3]); //negative ID
valid = util.validateNFIds([0, 1, 2, {min: 3, max: 2}]); //min > max
valid = util.validateNFIds([0, 1, 2, {min: 3, abc: 4}]); //malformed range or int
valid = util.validateNFIds([0, 1, 2, {min: 3, max: 2}]); //min < max
valid = util.validateNFIds([0, 1, 2, {min: 3, max: 3}, {min: 3, max: 4}]); //overlapping range

/*
=> false
*/

```

### 

### Reduce Non-Fungible Token ID Range

Take an array of integers representing NF token IDs and group them into ID ranges

```javascript
const ranges = util.reduceNFIds([0, 1, 2, 5, 99, 100, 101, 102])

/*
[
  {
    "min": 0,
    "max": 2
  },
  5,
  {
    "min": 99,
    "max": 102
  }
]
*/
```



### Expand Non-Fungible Token ID Range

Take an array of ID ranges representing NF token IDs expand them into an array of integers

```javascript
const numbers = util.expandNFIds([{min: 0, max: 3}, 5, 9])

/*
[
  0,
  1,
  2,
  3,
  5,
  9
]
*/
```



### Count Non-Fungible Token ID Range

Take an array of ID ranges representing NF token IDs get the count of tokens represented

```javascript
const count = util.countNFIds([{min: 0, max: 3}, 5, 9])

/*
6
*/
```



## Legal

[MIT Licensed](LICENSE.md)

Icons by [Icons8](https://icons8.com)