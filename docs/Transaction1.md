<a name="Transaction1"></a>

## Transaction1
Model A signed or unsigned FAT-1 Transaction

**Kind**: global class  
**Access**: protected  

* [Transaction1](#Transaction1)
    * [new Transaction(builder)](#new_Transaction1_new)
    * [.getInputs()](#Transaction1+getInputs) ⇒ <code>object</code>
    * [.getOutputs()](#Transaction1+getOutputs) ⇒ <code>object</code>
    * [.getMetadata()](#Transaction1+getMetadata) ⇒ <code>\*</code>
    * [.getTokenMetadata()](#Transaction1+getTokenMetadata) ⇒ <code>Array.&lt;object&gt;</code>
    * [.isCoinbase()](#Transaction1+isCoinbase) ⇒ <code>boolean</code>
    * [.getEntry()](#Transaction1+getEntry) ⇒ <code>Entry</code>
    * [.getChainId()](#Transaction1+getChainId) ⇒ <code>string</code>
    * [.getEntryhash()](#Transaction1+getEntryhash) ⇒ <code>string</code>
    * [.getTimestamp()](#Transaction1+getTimestamp) ⇒ <code>number</code>
    * [.getPending()](#Transaction1+getPending) ⇒ <code>boolean</code>
    * [.getMarshalDataSig(inputIndex)](#Transaction1+getMarshalDataSig) ⇒ <code>Buffer</code>
    * [.validateSignatures()](#Transaction1+validateSignatures) ⇒ <code>boolean</code>

<a name="new_Transaction1_new"></a>

### new Transaction(builder)

| Param | Type | Description |
| --- | --- | --- |
| builder | <code>TransactionBuilder</code> \| <code>object</code> | Either a TransactionBuilder object or a FAT-0 transaction object content |

<a name="Transaction1+getInputs"></a>

### transaction1.getInputs() ⇒ <code>object</code>
Get the inputs object for the transaction (Map of Address => Amount)

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>object</code> - - The transaction's inputs  
<a name="Transaction1+getOutputs"></a>

### transaction1.getOutputs() ⇒ <code>object</code>
Get the outputs object for the transaction (Map of Address => Amount)

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>object</code> - - The transaction's outputs  
<a name="Transaction1+getMetadata"></a>

### transaction1.getMetadata() ⇒ <code>\*</code>
Get the metadata if present for the transaction if present

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>\*</code> - - The transaction's metadata (if present, undefined if not)  
<a name="Transaction1+getTokenMetadata"></a>

### transaction1.getTokenMetadata() ⇒ <code>Array.&lt;object&gt;</code>
Get the token metadata if present for the coinbase transaction

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>Array.&lt;object&gt;</code> - - The token metadata (if present, undefined if not)  
<a name="Transaction1+isCoinbase"></a>

### transaction1.isCoinbase() ⇒ <code>boolean</code>
Check whether this transaction is a coinbase (token minting) transaction

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>boolean</code> - - Whether the transaction is a coinbase transaction or not  
<a name="Transaction1+getEntry"></a>

### transaction1.getEntry() ⇒ <code>Entry</code>
Get the factom-js Entry object representing the signed FAT transaction. Can be submitted directly to Factom

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>Entry</code> - - Get the Factom-JS Factom entry representation of the transaction, including extids & other signatures  
**See**: https://github.com/PaulBernier/factomjs/blob/master/src/entry.js  
**Example**  
```js
const {FactomCli, Entry, Chain} = require('factom');
     const cli = new FactomCli(); // Default factomd connection to localhost:8088 and walletd connection to localhost:8089

     const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

     const tx = new TransactionBuilder(tokenChainId)
     .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", [150])
     .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", [150])
     .build();

     //"cast" the entry object to prevent compatibility issues
     const entry = Entry.builder(tx.getEntry()).build();

     await cli.add(entry, "Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym"); //commit the transaction entry to the token chain
```
<a name="Transaction1+getChainId"></a>

### transaction1.getChainId() ⇒ <code>string</code>
Get the token chain ID for this transaction

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>string</code> - - The chain ID string. Undefined if the transaction is constructed from an object or unsigned  
<a name="Transaction1+getEntryhash"></a>

### transaction1.getEntryhash() ⇒ <code>string</code>
Get the Factom entryhash of the transaction.

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>string</code> - - The entryhash of the transaction. Only defined if the Transaction was constructed from an object  
<a name="Transaction1+getTimestamp"></a>

### transaction1.getTimestamp() ⇒ <code>number</code>
Get the unix timestamp of when the Transaction was signed (locally built transactions) or committed to Factom (from RPC response JSON)

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>number</code> - - The integer unix timestamp  
<a name="Transaction1+getPending"></a>

### transaction1.getPending() ⇒ <code>boolean</code>
Get the pending status of the transaction at the time of request.

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>boolean</code> - - The pending status of the entry in the daemon  
<a name="Transaction1+getMarshalDataSig"></a>

### transaction1.getMarshalDataSig(inputIndex) ⇒ <code>Buffer</code>
Get the assembled ("marshalled") data that needs to be signed for the transaction for the given input address index

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>Buffer</code> - - Get the marshalled data that needs to be hashed then signed  

| Param | Type | Description |
| --- | --- | --- |
| inputIndex | <code>number</code> | The input index to marshal to prep for hashing then signing |

<a name="Transaction1+validateSignatures"></a>

### transaction1.validateSignatures() ⇒ <code>boolean</code>
Validate all the signatures in the transaction against the input addresses

**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>boolean</code> - returns true if signatures are valid, throws error otherwise.  
