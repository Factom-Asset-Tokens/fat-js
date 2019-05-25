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
    * [.metadata(metadata)](#TransactionBuilder1+metadata) ⇒ <code>TransactionBuilder</code>
    * [.tokenMetadata(tokenMetadata)](#TransactionBuilder1+tokenMetadata) ⇒ <code>TransactionBuilder</code>
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
tx = new TransactionBuilder('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec')
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
```
<a name="TransactionBuilder1+input"></a>

### transactionBuilder1.input(fs, ids) ⇒ <code>TransactionBuilder</code>
Set up a Factoid address input for the transaction

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| fs | <code>string</code> | The private Factoid address to use as the input of the transaction |
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

<a name="TransactionBuilder1+build"></a>

### transactionBuilder1.build() ⇒ <code>Transaction</code>
Build the transaction

**Kind**: instance method of [<code>TransactionBuilder1</code>](#TransactionBuilder1)  
