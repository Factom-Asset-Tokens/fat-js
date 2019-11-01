<a name="Transaction0"></a>

## Transaction0
Model A signed or unsigned FAT-0 Transaction

**Kind**: global class  
**Access**: protected  

* [Transaction0](#Transaction0)
    * [new Transaction(builder)](#new_Transaction0_new)
    * [.getInputs()](#Transaction0+getInputs) ⇒ <code>object</code>
    * [.getOutputs()](#Transaction0+getOutputs) ⇒ <code>object</code>
    * [.getMetadata()](#Transaction0+getMetadata) ⇒ <code>\*</code>
    * [.isCoinbase()](#Transaction0+isCoinbase) ⇒ <code>boolean</code>
    * [.getEntry()](#Transaction0+getEntry) ⇒ <code>Entry</code>
    * [.getChainId()](#Transaction0+getChainId) ⇒ <code>string</code>
    * [.getEntryhash()](#Transaction0+getEntryhash) ⇒ <code>string</code>
    * [.getTimestamp()](#Transaction0+getTimestamp) ⇒ <code>number</code>
    * [.getPending()](#Transaction0+getPending) ⇒ <code>boolean</code>
    * [.getMarshalDataSig(inputIndex)](#Transaction0+getMarshalDataSig) ⇒ <code>Buffer</code>
    * [.validateSignatures()](#Transaction0+validateSignatures) ⇒ <code>boolean</code>

<a name="new_Transaction0_new"></a>

### new Transaction(builder)

| Param | Type | Description |
| --- | --- | --- |
| builder | <code>TransactionBuilder</code> \| <code>object</code> | Either a TransactionBuilder object or a FAT-0 transaction object content |

**Example**  
```js
//From transaction builder
let tx = new TransactionBuilder(tokenChainId)
.input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
.output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
.build();

tx.getInputs(); // => {"FA1PkAEbmo1XNangSnxmKqi1PN5sVDbQ6zsnXCsMUejT66WaDgkm":150}

tx.getChainId(); // => "013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec"


//or from API response
const response =
{
    entryhash: '68f3ca3a8c9f7a0cb32dc9717347cb179b63096e051a60ce8be9c292d29795af',
    timestamp: 1550696040,
    data:
        {
            inputs: {FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC: 10},
            outputs: {FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM: 10}
        }
};

tx = new Transaction(response);

tx.getEntryHash(); // => "68f3ca3a8c9f7a0cb32dc9717347cb179b63096e051a60ce8be9c292d29795af"
```
<a name="Transaction0+getInputs"></a>

### transaction0.getInputs() ⇒ <code>object</code>
Get the inputs object for the transaction (Map of Address => Token IDs)

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>object</code> - - The transaction's inputs  
<a name="Transaction0+getOutputs"></a>

### transaction0.getOutputs() ⇒ <code>object</code>
Get the outputs object for the transaction (Map of Address => Token IDs)

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>object</code> - - The transaction's outputs  
<a name="Transaction0+getMetadata"></a>

### transaction0.getMetadata() ⇒ <code>\*</code>
Get the metadata if present for the transaction if present

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>\*</code> - - The transaction's metadata (if present, undefined if not)  
<a name="Transaction0+isCoinbase"></a>

### transaction0.isCoinbase() ⇒ <code>boolean</code>
Check whether this transaction is a coinbase (token minting) transaction

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>boolean</code> - - Whether the transaction is a coinbase transaction or not  
<a name="Transaction0+getEntry"></a>

### transaction0.getEntry() ⇒ <code>Entry</code>
Get the factom-js Entry object representing the signed FAT transaction. Can be submitted directly to Factom

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>Entry</code> - - Get the Factom-JS Factom entry representation of the transaction, including extids & other signatures  
**See**: https://github.com/PaulBernier/factomjs/blob/master/src/entry.js  
**Example**  
```js
const {FactomCli, Entry, Chain} = require('factom');
     const cli = new FactomCli(); // Default factomd connection to localhost:8088 and walletd connection to localhost:8089

     const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

     const tx = new TransactionBuilder(tokenChainId)
     .input("Fs1q7FHcW4Ti9tngdGAbA3CxMjhyXtNyB1BSdc8uR46jVUVCWtbJ", 150)
     .output("FA3aECpw3gEZ7CMQvRNxEtKBGKAos3922oqYLcHQ9NqXHudC6YBM", 150)
     .build();

     //"cast" the entry object to prevent compatibility issues
     const entry = Entry.builder(tx.getEntry()).build();

     await cli.add(entry, "Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym"); //commit the transaction entry to the token chain
```
<a name="Transaction0+getChainId"></a>

### transaction0.getChainId() ⇒ <code>string</code>
Get the token chain ID for this transaction

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>string</code> - - The chain ID string. Undefined if the transaction is constructed from an object or unsigned  
<a name="Transaction0+getEntryhash"></a>

### transaction0.getEntryhash() ⇒ <code>string</code>
Get the Factom entryhash of the transaction.

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>string</code> - - The entryhash of the transaction. Only defined if the Transaction was constructed from an object  
<a name="Transaction0+getTimestamp"></a>

### transaction0.getTimestamp() ⇒ <code>number</code>
Get the unix timestamp of when the Transaction was signed (locally built transactions) or committed to Factom (from RPC response JSON)

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>number</code> - - The integer unix timestamp  
<a name="Transaction0+getPending"></a>

### transaction0.getPending() ⇒ <code>boolean</code>
Get the pending status of the transaction at the time of request.

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>boolean</code> - - The pending status of the entry in the daemon  
<a name="Transaction0+getMarshalDataSig"></a>

### transaction0.getMarshalDataSig(inputIndex) ⇒ <code>Buffer</code>
Get the assembled ("marshalled") data that needs to be signed for the transaction for the given input address index

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>Buffer</code> - - Get the marshalled data that needs to be hashed then signed  

| Param | Type | Description |
| --- | --- | --- |
| inputIndex | <code>number</code> | The input index to marshal to prep for hashing then signing |

<a name="Transaction0+validateSignatures"></a>

### transaction0.validateSignatures() ⇒ <code>boolean</code>
Validate all the signatures in the transaction against the input addresses

**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>boolean</code> - returns true if signatures are valid, throws error otherwise.  
