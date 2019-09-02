<a name="TransactionBuilder0"></a>

## TransactionBuilder0
Build & Model A FAT-0 Transaction

**Kind**: global class  
**Access**: public  

* [TransactionBuilder0](#TransactionBuilder0)
    * [new TransactionBuilder(Transaction)](#new_TransactionBuilder0_new)
    * [.input(fs, amount)](#TransactionBuilder0+input) ⇒ <code>TransactionBuilder</code>
    * [.coinbaseInput(amount)](#TransactionBuilder0+coinbaseInput) ⇒ <code>TransactionBuilder</code>
    * [.output(fa, amount)](#TransactionBuilder0+output) ⇒ <code>TransactionBuilder</code>
    * [.burnOutput(amount)](#TransactionBuilder0+burnOutput) ⇒ <code>TransactionBuilder</code>
    * [.sk1(sk1)](#TransactionBuilder0+sk1) ⇒ <code>TransactionBuilder</code>
    * [.id1(id1)](#TransactionBuilder0+id1) ⇒ <code>TransactionBuilder</code>
    * [.id1Signature(id1, signature)](#TransactionBuilder0+id1Signature) ⇒ <code>TransactionBuilder</code>
    * [.metadata(metadata)](#TransactionBuilder0+metadata) ⇒ <code>TransactionBuilder</code>
    * [.pkSignature(publicKey, signature)](#TransactionBuilder0+pkSignature) ⇒ <code>TransactionBuilder</code>
    * [.build()](#TransactionBuilder0+build) ⇒ <code>Transaction</code>

<a name="new_TransactionBuilder0_new"></a>

### new TransactionBuilder(Transaction)

| Param | Type | Description |
| --- | --- | --- |
| Transaction | <code>Transaction</code> \| <code>string</code> | or tokenChainId - Unsigned transaction or 64 character Factom Chain ID of the token to build the transaction for |

**Example**  
```js
const TransactionBuilder = require('fat-js').FAT0.TransactionBuilder

const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

let tx = new TransactionBuilder(tokenChainId)
.input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
.build();

//coinbase transaction
tx = new TransactionBuilder(tokenChainId)
.coinbaseInput(10)
.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 10)
.sk1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
.build();

//burn transaction
tx = new TransactionBuilder(tokenChainId)
.input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
.burnOutput(150)
.build();

//transaction metadata
tx = new TransactionBuilder(tokenChainId)
.input("Fs1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm", 150)
.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
.metadata({type: 'fat-js test run', timestamp: new Date().getTime()})
.build();

//You can also use external signatures (from hardware devices, etc):

let keyPair = nacl.keyPair.fromSeed(fctAddrUtils.addressToKey("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ"));
let pubaddr = fctAddrUtils.keyToPublicFctAddress(keyPair.publicKey);

let unsignedTx = new TransactionBuilder(testTokenChainId)
.input(pubaddr, 150)
.output("FA3umTvVhkcysBewF1sGAMeAeKDdG7kTQBbtf5nwuFUGwrNa5kAr", 150)
.build();

let extsig = nacl.detached(fctUtil.sha512(unsignedTx.getMarshalDataSig(0)), keyPair.secretKey);

let signedTx = new TransactionBuilder(unsignedTx)
.pkSignature(keyPair.publicKey, extsig)
.build();
```
<a name="TransactionBuilder0+input"></a>

### transactionBuilder0.input(fs, amount) ⇒ <code>TransactionBuilder</code>
Set up a Factoid address input for the transaction

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| fs | <code>string</code> | The private Factoid address to use as the input of the transaction OR raw public key if supplying external signatures |
| amount | <code>number</code> \| <code>string</code> \| <code>BigNumber</code> | The integer amount of token units to send. Native JS Numbers (e.x. 123), strings (e.x. "123"), and BigNumbers(e.x. new BigNumber("9999999999999999") are allowed as long as they represent integers |

<a name="TransactionBuilder0+coinbaseInput"></a>

### transactionBuilder0.coinbaseInput(amount) ⇒ <code>TransactionBuilder</code>
Set up a coinbase input for the transaction, which mints tokens

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> \| <code>string</code> \| <code>BigNumber</code> | The integer amount of token units to send. Native JS Numbers (e.x. 123), strings (e.x. '123'), and BigNumbers(e.x. new BigNumber("9999999999999999") are allowed as long as they represent integers |

<a name="TransactionBuilder0+output"></a>

### transactionBuilder0.output(fa, amount) ⇒ <code>TransactionBuilder</code>
Set up a Factoid address output for the transaction

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| fa | <code>string</code> | The public Factoid address destination of the output |
| amount | <code>number</code> \| <code>string</code> \| <code>BigNumber</code> | The integer amount of token units to receive at the destination address. Native JS Numbers (e.x. 123), strings (e.x. "123"), and BigNumbers(e.x. new BigNumber("9999999999999999") are allowed as long as they represent integers |

<a name="TransactionBuilder0+burnOutput"></a>

### transactionBuilder0.burnOutput(amount) ⇒ <code>TransactionBuilder</code>
Set up a burn output for the transaction, which will destroy tokens

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> \| <code>string</code> \| <code>BigNumber</code> | The integer amount of token units to receive at the destination address. Native JS Numbers (e.x. 123), strings (e.x. "123"), and BigNumbers(e.x. new BigNumber("9999999999999999") are allowed as long as they represent integers |

<a name="TransactionBuilder0+sk1"></a>

### transactionBuilder0.sk1(sk1) ⇒ <code>TransactionBuilder</code>
Set the SK1 private key of the token's issuing identity. Required for coinbase transactions

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| sk1 | <code>string</code> | The SK1 private key string of the issuing identity |

<a name="TransactionBuilder0+id1"></a>

### transactionBuilder0.id1(id1) ⇒ <code>TransactionBuilder</code>
Set up the identity public key of the issuing identity in prep for an externally signed coinbase transaction

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| id1 | <code>string</code> | The ID1 public key string of the issuing identity, external signature will be required in second pass |

<a name="TransactionBuilder0+id1Signature"></a>

### transactionBuilder0.id1Signature(id1, signature) ⇒ <code>TransactionBuilder</code>
Set up the identity signature of the issuing identity in prep for an externally signed coinbase transaction

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| id1 | <code>string</code> | The ID1 public key string of the issuing identity, external signature expected. |
| signature | <code>Buffer</code> | signature - Optional signature provided on second pass |

<a name="TransactionBuilder0+metadata"></a>

### transactionBuilder0.metadata(metadata) ⇒ <code>TransactionBuilder</code>
Set arbitrary metadata for the transaction

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>\*</code> | The metadata. Must be JSON stringifyable |

<a name="TransactionBuilder0+pkSignature"></a>

### transactionBuilder0.pkSignature(publicKey, signature) ⇒ <code>TransactionBuilder</code>
Add a public key and signature to the transaction. This is used only in the case of externally signed transactions (useful for hardware wallets).
Public Key's /signatures need to be added in the same order as their corresponding inputs.

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  
**Returns**: <code>TransactionBuilder</code> - - TransactionBuilder instance.  

| Param | Type | Description |
| --- | --- | --- |
| publicKey | <code>string</code> \| <code>Array</code> \| <code>Buffer</code> | FCT public key as hex string, uint8array, or buffer |
| signature | <code>Buffer</code> | Signature |

<a name="TransactionBuilder0+build"></a>

### transactionBuilder0.build() ⇒ <code>Transaction</code>
Build the transaction

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  
