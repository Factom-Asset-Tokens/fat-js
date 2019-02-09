![](https://png.icons8.com/ios-glyphs/128/3498db/octahedron.png)![](https://png.icons8.com/ios/40/3498db/javascript-filled.png)

# fat-js

[![Build Status](https://travis-ci.com/DBGrow/fat-js.svg?token=REedCkSxoVCAw1Krjc8q&branch=master)](https://travis-ci.com/DBGrow/fat-js)

[![Coverage Status](https://coveralls.io/repos/github/DBGrow/fat-js/badge.svg?branch=master&t=X5s8cd)](https://coveralls.io/github/DBGrow/fat-js?branch=master)

[Factom Asset Token](https://github.com/DBGrow/FAT) Client and CLI implementation in JS :blue_heart:

Currently supports **FAT-0** and **FAT-1** token standards.



**Note:** FAT is experimental software. This commit has been tested with [fatd](https://github.com/Factom-Asset-Tokens/fatd) commit `ae61c53b3769b219adc277b7815c05cb0474c2e7`



## Installation

NPM via package.json:

```json
"dependencies":{
	"@fat-token/fat-js": "0.1.0-rc1"
}
```

or

NPM:

```
npm i @fat-token/fat-js
```



## Browser Bundle

A browser friendly bundle of the current fat-js version can be found at `browser/bundle.js`

To build the bundle from source ensure you have browserify installed, and simply navigate to the root of the fat-js project and run:

```bash
npm run build
```

A fresh `fatjs.js` will be built in the  `dist` directory.



## Instantiate FAT CLI

```javascript
const CLIBuilder = require('fat-js').CLIBuilder
let cli = new CLIBuilder()
    .host('fatnode.mysite.com')
    .port(1234)
	.timeout(3500) //optional, timeout ms
    .build();
```



## Daemon RPC Calls

### Get Daemon Properties

Get a object containing a readout of properties for the connected fatd node

```javascript
const properties = await cli.getDaemonProperties();

/*
{
  "fatdversion": "0.0.0",
  "apiversion": "v0"
}
*/
```



### Get Tracked Tokens

Get an array of the tokens that this fat daemon is currently tracking

```javascript
const tokens = await cli.getTrackedTokens();
            
/*
[
  {
    "chainid": "013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec",
    "tokenid": "testfat0-1",
    "issuerid": "888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced"
  },
  {
    "chainid": "d82c39213c969a11ca6d352c148eec627sdf7b382ddf51b0736c369d918b",
    "tokenid": "test",
    "issuerid": "888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced"
  }
]
*/
```



## Token RPC Calls

The token CLI allows access to both FAT-0 and FAT-1 data from fatd.

Before creating a token you must create a token CLI instance using the token's chain ID:

### Instantiate Token CLI

```javascript
const tokenCLI = cli.getTokenCLI('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');
```

*Note: Calling non fungible token methods on fungible token chains will result in an RPC error*



### Get Issuance

Get a FAT issuance entry for the token

```javascript
const issuance = await tokenCLI.getIssuance();

/*
{
  "chainid": "013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec",
  "tokenid": "testfat0-1",
  "issuerid": "888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced",
  "entryhash": "d8114eacba1e8d8d2bb66080be157005bba8baf788f32efc8fcd148e7f21c8a5",
  "timestamp": 1546489020,
  "issuance": {
    "type": "FAT-0",
    "supply": 10000000,
    "symbol": "TF0",
    "name": "testfat0-1"
  }
}
*/
```





### Get Transaction

Get a FAT transaction by its entryhash

```javascript
const transaction = await tokenCLI.getTransaction('d9b6ca250c97fdbe48eb3972a7d4b906aac54f2048982acfcb6019bc2a018be9');

/*
{
  "entryhash": "3f21c0b24a66ad5f95116c3ad5703d66c336831dac6451b4a41d126becd9b174",
  "timestamp": 1546491300,
  "data": {
    "inputs": {
      "FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC": 100 //or [100, {"min":100,"max":100}] for FAT-1
    },
    "outputs": {
      "FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM": 100
    }
  }
}
*/
```



### Get Transactions

Get a paged list of FAT transactions.

```javascript
const transactions = await tokenCLI.getTransactions(entryhash, address, page, limit);

/*
[
  {
    "entryhash": "04f92de4211c90952e73f4432c72db9dce086b2fcaa6fa6020d73153fb760302",
    "timestamp": 1546491300,
    "data": {
      "inputs": {
        "FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC": 100
      },
      "outputs": {
        "FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM": 100
      }
    }
  }
]
*/
```

| Param       | Type   | Description                                                  |
| ----------- | ------ | ------------------------------------------------------------ |
| `entryhash` | string | 64 Byte Factom entryhash of the transaction to start the page of transactions |
| `address`   | string | Public Factoid address input/output to filter the results by |
| `page`      | number | Integer result page number                                   |
| `limit`     | number | Integer number of results per page                           |

#### Ordering

Transactions are returned from oldest (0th) to newest (last)



### Get Balance

Get the numeric balance of a public Factoid address.

```javascript
let balance = await tokenCLI.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');

/*
150
*/
```

*Note: The NF token balance count is returned for FAT-1 tokens*



### Get Non-Fungible Balance

Get the tokens owned by a public Factoid address.

```javascript
let tokens = await tokenCLI.getNFBalance(address, page, limit, order);

/*
[
  0,
  1,
  3,
  4
]
*/
```

| Param     | Type   | Description                                                  |
| --------- | ------ | ------------------------------------------------------------ |
| `address` | string | Public Factoid address to get the balance of                 |
| `page`    | number | Integer result page number                                   |
| `limit`   | number | Integer number of results per page                           |
| `order`   | string | The sort order to return token IDS in. Either `desc` or `asc` |



### Get All Non-Fungible Tokens

Page through all tokens currently in circulation

```javascript
let tokens = await tokenCLI.getNFTokens(page, limit, order);

/*
[
  {
    "nftokenid": 0,
    "owner": "FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM"
  },
  {
    "nftokenid": 1,
    "owner": "FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM"
  }
]
*/
```

| Param   | Type   | Description                                                  |
| ------- | ------ | ------------------------------------------------------------ |
| `page`  | number | Integer result page number                                   |
| `limit` | number | Integer number of results per page                           |
| `order` | string | The sort order to return token IDS in. Either `desc` or `asc` |



### Get Token Stats

```javascript
let stats = await tokenCLI.getStats();

/*
{
  "supply": 99999999,
  "circulating": 100039,
  "burned": 0,
  "transactions": 81,
  "issuancets": 1548276060,
  "lasttxts": 1549680840
}
*/
```





## Transactions

### FAT-0 Transaction Builder

```javascript
const TransactionBuilder = require('fat-js').FAT0.TransactionBuilder

const tokenId = 'mytoken';
const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

let tx = new TransactionBuilder(tokenChainId)
	.input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
	.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
	.build();

//coinbase transaction
tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
             .coinbaseInput(10)
             .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
             .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
             .build();

//burn transaction
tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
            .burnOutput(150)
            .build();
```



### FAT-1 Transaction Builder

```javascript
const TransactionBuilder = require('fat-js').FAT1.TransactionBuilder

const tokenId = 'mytoken';
const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

 let tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [{min: 0, max: 3}, 150])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [{min: 0, max: 3}, 150])
            .build();

//coinbase transaction
tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
            .coinbaseInput([10])
            .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
            .setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
            .build();

//burn transaction
tx = new TransactionBuilder(testTokenChainId)
            .input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [{min: 0, max: 3}, 150])
            .burnOutput([{min: 0, max: 3}, 150])
            .build();
```



## Send A Transaction

First instantiate the token CLI for your selected token, then:

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
                .name('Test Token')
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







## Legal

[MIT Licensed](LICENSE.md)

Icons by [Icons8](https://icons8.com)