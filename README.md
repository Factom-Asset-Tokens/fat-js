![](https://png.icons8.com/ios-glyphs/128/3498db/octahedron.png)![](https://png.icons8.com/ios/40/3498db/javascript-filled.png)

# fat-js

[![Build Status](https://travis-ci.com/DBGrow/fat-js.svg?token=REedCkSxoVCAw1Krjc8q&branch=master)](https://travis-ci.com/DBGrow/fat-js)

[![Coverage Status](https://coveralls.io/repos/github/DBGrow/fat-js/badge.svg?branch=master&t=X5s8cd)](https://coveralls.io/github/DBGrow/fat-js?branch=master)

[Factom Asset Token](https://github.com/DBGrow/FAT) implementation in JS :blue_heart:

Currently supports **FAT-0** & **FAT-1** token standards.



## Installation

package.json:

```
"dependencies":{
	"fat-js": "git+https://<github_token>:x-oauth-basic@github.com/DBGrow/fat-js.git"
}
```

or include directly on project path via clone



## FAT-0

### Initialization

```javascript
const {FAT0} = require('fat-js/fat0/FAT0');

//Get the token for FAT-0 token with ID: AQQW
let testToken = await new FAT0('AQQW');

//after the constructor has been completed the token is synced and ready to go
```



### Get Issuance Entry

```javascript
let issuance = testToken.getIssuance();

console.log(JSON.stringify(issuance,undefined,2)) 
/*=>
{
  "type": "FAT-0",
  "issuer": "888888dd9e60c1f0216f753caf5c9b5be4c9ca69db27a6c33d30dce3fe5ee709",
  "supply": 10000000,
  "name": "Example Token",
  "symbol": "EXT",
   "salt": "874220a808090fb736f345dd5d67ac26eab94c9c9f51b708b05cdc4d42f65aae",
  "idNonce": "cc4fee39dcdcfc1999ab07689230321acdd83fcd0ace521107041ef354b9cfb5",
  "idSignature": "33467893a440561d96ae27798dc8be291e1ce264d3c6f36f33a0d983e745f1d87db61c77946fe57db3e185f548d51da85106dfec592383a556091dd45f384b0c"
}
*/
```



### Get A Transaction by EntryHash

```javascript
  let tx = testToken.getTransaction('e1a71b335c3be54659f84e0d36c6c53d0a7e06a960f1cf5fef3af7faac413f2f');

console.log(JSON.stringify(issuance, undefined, 2)) 
/*=>
{
  "input": {
    "address": "FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM",
    "amount": 100
  },
  "output": {
    "address": "FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM",
    "amount": 100
  },
  "rcd": "011eddd2b3cfb40c581c2afdf675c60a39baeab4cbe75e2ff8b0dc808de6a67cfe",
  "txSalt": 88395950515565,
  "txNonce": 3119868535,
  "marshalBinarySig": "020000b9f56a7701010064d381a44afa76ad5ab8f0d82adb27d6ffa031302cc3bb281c86b1b3dfabde395e64d381a44afa76ad5ab8f0d82adb27d6ffa031302cc3bb281c86b1b3dfabde395e",
  "signature": "8d4091f55eb6383514cbc569ab174469d7c4b17929bfe87a8d7879536c2eb3b1e446d0d97eb6267014da4630117c093cb0f72641b1c370351899509ed019e80c",
  "timestamp": 1536612540,
  "entryHash": "e1a71b335c3be54659f84e0d36c6c53d0a7e06a960f1cf5fef3af7faac413f2f"
}
*/
```



### Get All Transactions

```javascript
 let transactions =
                testToken.getTransactions();
```



### Get Balance

```javascript
let balance = testToken.getBalance('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');

console.log(balance) 
/* =>
100
*/
```



### Get All Balances

Return a map of all addresses and their balances

```javascript
let balances = testToken.getBalances();

console.log(JSON.stringify(balances, undefined, 2) 
/* =>
{
"FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM": 100,
"FA2ZrcG8xkwWWNfdMRw5pGNjMPEkLaxRGqacvzfLS6TGHEHZqAA4 " : 1.00938,
...
}
*/
```



### Get Transaction History of Address

```javascript
 let transactions = testToken.getTransactionsOfAddress('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM');
```



### Get Token Stats

```javascript
let stats = testToken.getStats();
console.log(JSON.stringify(stats, undefined, 2); 
/* =>
{
  "supply": 1000,
  "circulatingSupply": 100,
  "transactionCount": 54,
  "issuanceTimestamp": 1536278460
}
*/
```



### Send A Transaction (Static)

```javascript
//sendTransaction(token ID, from private key, to public address, amount, EC address)

let transaction = await FAT0.sendTransaction('AQQW', 'Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ', 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM', 100, 'Es3k4L7La1g7CY5zVLer21H3JFkXgCBCBx8eSM2q9hLbevbuoL6a');
```



### Send A Transaction (Instance)

```javascript
//sendTransaction(from private key, to public address, amount, EC address)

let transaction = await testToken.sendTransaction('Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ', 'FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM', 100, 'Es3k4L7La1g7CY5zVLer21H3JFkXgCBCBx8eSM2q9hLbevbuoL6a');
```



### Issue A Token

Issue a token with ID `AQQW`, trade symbol `AQQW` , and display name `Test FAT-0 AQQW`

```javascript
const FAT0IssuanceBuilder = FAT0.IssuanceBuilder;
var let = new FAT0IssuanceBuilder('AQQW')
.setSymbol('AQQW')
.setName('Test FAT-0 AQQW')          .setIssuerIdentity('888888ab72e748840d82c39213c969a11ca6cb026f1d3da39fd82b95b3c1fced')
.setSK1('sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu')
.setSupply(1000)               .setCoinbaseTransaction('FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM', 100) //send 100 tokens to a public factoid address

let issuanceEntryAndCoinbaseTx = await FAT0.issue(issuance, EC);
```



## Legal

Icons by [Icons8](https://icons8.com)