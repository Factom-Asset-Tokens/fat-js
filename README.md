![](https://png.icons8.com/ios-glyphs/128/3498db/octahedron.png)![](https://png.icons8.com/ios/40/3498db/javascript-filled.png)

# fat-js

[![Build Status](https://travis-ci.com/DBGrow/fat-js.svg?token=REedCkSxoVCAw1Krjc8q&branch=master)](https://travis-ci.com/DBGrow/fat-js)

[![Coverage Status](https://coveralls.io/repos/github/DBGrow/fat-js/badge.svg?branch=master&t=X5s8cd)](https://coveralls.io/github/DBGrow/fat-js?branch=master)

[Factom Asset Token](https://github.com/DBGrow/FAT) Client and CLI implementation in JS :blue_heart:

Currently supports **FAT-0** token standard.



## Installation

package.json:

```json
"dependencies":{
	"fat-js": "0.0.0"
}
```

or

CLI:

```
npm install fat-js
```



## Browser Bundle

A browser friendly bundle of the current fat-js version can be found at `browser/bundle.js`

To build the bundle from source ensure you have browserify installed, and simply navigate to the root of the fat-js project and run:

```bash
npm run build
```

A fresh `bundle.js` will be built in the  `browser` directory.



## Instantiate FAT CLI

```javascript
const CLIBuilder = require('fat-js').CLIBuilder
let cli = new CLIBuilder()
    .host('fatnode.mysite.com')
    .port(1234)
    .build();
 
//get the CLI client for a token: <tokenId> <issuer Root Chain ID>
let tokenCLI = cli.getTokenCLI('mytoken','888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762')
```



## FAT Token CLI Calls

### Get Issuance

```javascript
//using async/await
let issuance = await tokenCLI.getIssuance();

//or using promises
tokenCLI.getIssuance().then(function(issuance){
    
}).catch(function(err){
    console.error(err);
});

console.log(JSON.stringify(issuance.toObject(), undefined, 2));
/* =>
{  
      "type":"FAT-0",
      "supply":10000000,
      "name":"Example Token",
      "symbol":"EXT",
      "salt":"874220a808090fb736f345dd5d67ac26eab94c9c9f51b708b05cdc4d42f65aae"
}
*/
```



### Get Transaction

```javascript
let transaction = await tokenCLI.getTransaction('d9b6ca250c97fdbe48eb3972a7d4b906aac54f2048982acfcb6019bc2a018be9');

console.log(JSON.stringify(transaction.toObject(), undefined, 2));
/* =>
{
      "inputs:":[  
         {  
            "address":"FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC",
            "amount":100
         },
         {  
            "address":"FA2y6VYYPR9Y9Vyy1ZuZqWWRXGXLeuvsLWGkDxq3Ed7yc11dbBKV",
            "amount":50
         }
      ],
      "outputs:":[  
         {  
            "address":"FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM",
            "amount":150
         }
      ],
      "blockheight":1537450868,
      "salt":"80d87a8bd5cf2a3eca9037c2229f3701eed29360caa975531ef5fe476b1b70b5"
}
*/
```



### Get Transactions

```javascript
let transaction = await tokenCLI.getTransactions();
```



### Get Balance

```javascript
let balance = await tokenCLI.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');

console.log(balance);
/* =>
150
*/
```



### Get Stats

```javascript
let stats = await tokenCLI.getStats();

console.log(JSON.stringify(stats, undefined, 2));
/* =>
{
        "supply":10000000,
        "circulatingSupply":8113,
        "transactions":18429,
        "issuanceTimestamp": 1518286500,
        "lastTransactionTimestamp": 1539212767
}
*/
```



## Construct FAT-0 Transaction

### Transaction Builder

All FAT-0 Transaction Builder Options

```javascript
const TransactionBuilder = require('fat-js').FAT0.TransactionBuilder

const tokenId = 'mytoken';
const issuerRootChainId = '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762';

let tx = new TransactionBuilder(tokenId, issuerRootChainId)
	.input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
	.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
	.build();
```



## Issuance Builder

All FAT-0 Issuance Builder Options

```javascript
const CLIBuilder = require('fat-js').FAT0.IssuanceBuilder
let issuance = new IssuanceBuilder("mytoken", "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
                .supply(1000000)
                .name('Test Token')
                .symbol('TTK')
                .build()
```



## Legal

[MIT Licensed](LICENSE.md)

Icons by [Icons8](https://icons8.com)