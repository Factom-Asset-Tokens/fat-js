<a name="TransactionBuilder0"></a>

## TransactionBuilder0
Build & Model A FAT-0 Transaction

**Kind**: global class  
**Access**: public  

* [TransactionBuilder0](#TransactionBuilder0)
    * [new TransactionBuilder(tokenChainId)](#new_TransactionBuilder0_new)
    * [.input(fs, amount)](#TransactionBuilder0+input) ⇒ <code>TransactionBuilder</code>
    * [.coinbaseInput(amount)](#TransactionBuilder0+coinbaseInput) ⇒ <code>TransactionBuilder</code>
    * [.output(fa, amount)](#TransactionBuilder0+output) ⇒ <code>TransactionBuilder</code>
    * [.burnOutput(amount)](#TransactionBuilder0+burnOutput) ⇒ <code>TransactionBuilder</code>
    * [.setIssuerSK1(sk1)](#TransactionBuilder0+setIssuerSK1) ⇒ <code>TransactionBuilder</code>
    * [.metadata(metadata)](#TransactionBuilder0+metadata) ⇒ <code>TransactionBuilder</code>
    * [.build()](#TransactionBuilder0+build) ⇒ <code>Transaction</code>

<a name="new_TransactionBuilder0_new"></a>

### new TransactionBuilder(tokenChainId)

| Param | Type | Description |
| --- | --- | --- |
| tokenChainId | <code>string</code> | 64 character Factom Chain ID of the token to build the transaction for |

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
.setIssuerSK1("sk13Rp3LVmVvWqo8mff82aDJN2yNCzjUs2Zuq3MNQSA5oC5ZwFAuu")
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
```
<a name="TransactionBuilder0+input"></a>

### transactionBuilder0.input(fs, amount) ⇒ <code>TransactionBuilder</code>
Set up a Factoid address input for the transaction

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| fs | <code>string</code> | The private Factoid address to use as the input of the transaction |
| amount | <code>number</code> | The integer amount of token units to send. Must be a safe integer |

<a name="TransactionBuilder0+coinbaseInput"></a>

### transactionBuilder0.coinbaseInput(amount) ⇒ <code>TransactionBuilder</code>
Set up a coinbase input for the transaction, which mints tokens

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | The integer amount of token units to send |

<a name="TransactionBuilder0+output"></a>

### transactionBuilder0.output(fa, amount) ⇒ <code>TransactionBuilder</code>
Set up a Factoid address output input for the transaction

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| fa | <code>string</code> | The public Factoid address destination of the output |
| amount | <code>number</code> | The integer amount of token units to recieve. Must be a safe integer |

<a name="TransactionBuilder0+burnOutput"></a>

### transactionBuilder0.burnOutput(amount) ⇒ <code>TransactionBuilder</code>
Set up a burn output for the transaction, which will destroy tokens

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | The integer amount of token units to send |

<a name="TransactionBuilder0+setIssuerSK1"></a>

### transactionBuilder0.setIssuerSK1(sk1) ⇒ <code>TransactionBuilder</code>
Set the SK1 private key of the token's issuing identity. Required for coinbase transactions

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| sk1 | <code>string</code> | The SK1 private key string of the issuing identity |

<a name="TransactionBuilder0+metadata"></a>

### transactionBuilder0.metadata(metadata) ⇒ <code>TransactionBuilder</code>
Set arbitrary metadata for the transaction

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>\*</code> | The metadata. Must be JSON stringifyable |

<a name="TransactionBuilder0+build"></a>

### transactionBuilder0.build() ⇒ <code>Transaction</code>
Build the transaction

**Kind**: instance method of [<code>TransactionBuilder0</code>](#TransactionBuilder0)  
