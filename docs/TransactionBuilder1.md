<a name="TransactionBuilder1"></a>

## TransactionBuilder1
Build & Model A FAT-1 Transaction

**Kind**: global class  
**Access**: public  

* [TransactionBuilder1](#TransactionBuilder1)
    * [new TransactionBuilder(tokenChainId)](#new_TransactionBuilder1_new)
    * [.input(fs, ids)](#TransactionBuilder1+input) ⇒ <code>TransactionBuilder</code>
    * [.coinbaseInput(ids)](#TransactionBuilder1+coinbaseInput) ⇒ <code>TransactionBuilder</code>
    * [.output(fa, ids)](#TransactionBuilder1+output) ⇒ <code>TransactionBuilder</code>
    * [.burnOutput(ids)](#TransactionBuilder1+burnOutput) ⇒ <code>TransactionBuilder</code>
    * [.sk1(sk1)](#TransactionBuilder1+sk1) ⇒ <code>TransactionBuilder</code>
    * [.id1(id1)](#TransactionBuilder1+id1) ⇒ <code>TransactionBuilder</code>
    * [.id1Signature(id1pubkey, signature)](#TransactionBuilder1+id1Signature) ⇒ <code>TransactionBuilder</code>
    * [.metadata(metadata)](#TransactionBuilder1+metadata) ⇒ <code>TransactionBuilder</code>
    * [.tokenMetadata(tokenMetadata)](#TransactionBuilder1+tokenMetadata) ⇒ <code>TransactionBuilder</code>
    * [.pkSignature(publicKey, signature)](#TransactionBuilder1+pkSignature) ⇒ <code>TransactionBuilder</code>
    * [.build()](#TransactionBuilder1+build) ⇒ <code>Transaction</code>

<a name="new_TransactionBuilder1_new"></a>

### new TransactionBuilder(tokenChainId)

| Param | Type | Description |
| --- | --- | --- |
| tokenChainId | <code>string</code> | 64 character Factom Chain ID of the token to build the transaction for |

**Example**  
```js
const TransactionBuilder = require('fat-js').FAT1.TransactionBuilder

const tokenId = 'mytoken';
const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

let tx = new TransactionBuilder(testTokenChainId)
.input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [{min: 0, max: 3}, 150])
.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [{min: 0, max: 3}, 150])
.build();

//coinbase transaction
tx = new TransactionBuilder(testTokenChainId)
.coinbaseInput([10])
.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
.sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
 .build();

//burn transaction
tx = new TransactionBuilder(testTokenChainId)
.input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [{min: 0, max: 3}, 150])
.burnOutput([{min: 0, max: 3}, 150])
.build();

//transaction metadata
tx = new TransactionBuilder(testTokenChainId)
.input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", [10])
.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [10])
.metadata({type: 'fat-js test run', timestamp: new Date().getTime()})
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
.sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
.build();

//You can also use external signatures (from hardware devices, etc):

let keyPair = nacl.keyPair.fromSeed(fctAddrUtils.addressToKey("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ"));
let pubaddr = fctAddrUtils.keyToPublicFctAddress(keyPair.publicKey);

let unsignedTx = new TransactionBuilder(testTokenChainId)
.input(pubaddr, [10])
.output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", [10])
.build();

let extsig = nacl.detached(fctUtil.sha512(unsignedTx.getMarshalDataSig(0)), keyPair.secretKey);

let signedTx = new TransactionBuilder(unsignedTx)
.pkSignature(keyPair.publicKey, extsig)
.build();
```
<a name="TransactionBuilder1+input"></a>

### transactionBuilder1.input(fs, ids) ⇒ <code>TransactionBuilder</code>
Set up a Factoid address input for the transaction

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| fs | <code>string</code> | The private Factoid address to use as the input of the transaction OR raw public key if supplying external signatures |
| ids | <code>Array.&lt;object&gt;</code> | The token ID ranges to send in the transaction |

<a name="TransactionBuilder1+coinbaseInput"></a>

### transactionBuilder1.coinbaseInput(ids) ⇒ <code>TransactionBuilder</code>
Set up a coinbase input for the transaction, which mints tokens

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| ids | <code>Array.&lt;object&gt;</code> | The token ID ranges to mint in the transaction |

<a name="TransactionBuilder1+output"></a>

### transactionBuilder1.output(fa, ids) ⇒ <code>TransactionBuilder</code>
Set up a Factoid address output for the transaction

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| fa | <code>string</code> | The public Factoid address destination of the output |
| ids | <code>Array.&lt;object&gt;</code> | The token ID ranges to send to the output address |

<a name="TransactionBuilder1+burnOutput"></a>

### transactionBuilder1.burnOutput(ids) ⇒ <code>TransactionBuilder</code>
Set up a burn output for the transaction, which will destroy tokens

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| ids | <code>Array.&lt;object&gt;</code> | The token ID ranges to send to the output address |

<a name="TransactionBuilder1+sk1"></a>

### transactionBuilder1.sk1(sk1) ⇒ <code>TransactionBuilder</code>
Set the SK1 private key of the token's issuing identity. Required for coinbase transactions

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| sk1 | <code>string</code> | The SK1 private key string of the issuing identity |

<a name="TransactionBuilder1+id1"></a>

### transactionBuilder1.id1(id1) ⇒ <code>TransactionBuilder</code>
Set up the identity public key of the issuing identity in prep for an externally signed coinbase transaction

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| id1 | <code>string</code> | The ID1 public key string of the issuing identity, external signature will be required in second pass |

<a name="TransactionBuilder1+id1Signature"></a>

### transactionBuilder1.id1Signature(id1pubkey, signature) ⇒ <code>TransactionBuilder</code>
Set up the identity signature of the issuing identity in prep for an externally signed coinbase transaction

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| id1pubkey | <code>string</code> | The ID1 public key string of the issuing identity, external signature expected. |
| signature | <code>Buffer</code> | signature - Optional signature provided on second pass |

<a name="TransactionBuilder1+metadata"></a>

### transactionBuilder1.metadata(metadata) ⇒ <code>TransactionBuilder</code>
Set arbitrary metadata for the transaction

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>\*</code> | The metadata. Must be JSON stringifyable |

<a name="TransactionBuilder1+tokenMetadata"></a>

### transactionBuilder1.tokenMetadata(tokenMetadata) ⇒ <code>TransactionBuilder</code>
Set arbitrary metadata for the transaction

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| tokenMetadata | <code>\*</code> | The token metadata. Must follow the proper format. Must be JSON stringifyable |

<a name="TransactionBuilder1+pkSignature"></a>

### transactionBuilder1.pkSignature(publicKey, signature) ⇒ <code>TransactionBuilder</code>
Add a public key and signature to the transaction. This is used only in the case of externally signed transactions (useful for hardware wallets).
Public Key's /signatures need to be added in the same order as their corresponding inputs.

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  
**Returns**: <code>TransactionBuilder</code> - - TransactionBuilder instance.  

| Param | Type | Description |
| --- | --- | --- |
| publicKey | <code>string</code> \| <code>Array</code> \| <code>Buffer</code> | FCT public key as hex string, uint8array, or buffer |
| signature | <code>Buffer</code> | Signature |

<a name="TransactionBuilder1+build"></a>

### transactionBuilder1.build() ⇒ <code>Transaction</code>
Build the transaction

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  
