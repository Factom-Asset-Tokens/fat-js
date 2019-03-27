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
    * [.getTokenChainId()](#Transaction0+getTokenChainId) ⇒ <code>string</code>
    * [.getEntryhash()](#Transaction0+getEntryhash) ⇒ <code>string</code>
    * [.getTimestamp()](#Transaction0+getTimestamp) ⇒ <code>number</code>

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

tx.getTokenChainId(); // => "013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec"


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
**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>object</code> - - The transaction's inputs  
<a name="Transaction0+getOutputs"></a>

### transaction0.getOutputs() ⇒ <code>object</code>
**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>object</code> - - The transaction's outputs  
<a name="Transaction0+getMetadata"></a>

### transaction0.getMetadata() ⇒ <code>\*</code>
**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>\*</code> - - The transaction's metadata (if present, undefined if not)  
<a name="Transaction0+isCoinbase"></a>

### transaction0.isCoinbase() ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>boolean</code> - - Whether the transaction is a coinbase transaction or not  
<a name="Transaction0+getEntry"></a>

### transaction0.getEntry() ⇒ <code>Entry</code>
**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>Entry</code> - - Get the Factom-JS Factom entry representation of the transaction, including extids & other signatures  
<a name="Transaction0+getTokenChainId"></a>

### transaction0.getTokenChainId() ⇒ <code>string</code>
**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>string</code> - - Get the Factom chain ID of the transaction's token. Returns undefined if the Transaction was constructed from an object  
<a name="Transaction0+getEntryhash"></a>

### transaction0.getEntryhash() ⇒ <code>string</code>
**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>string</code> - - Get the Factom entryhash of the transaction. Only defined if the Transaction was constructed from an object  
<a name="Transaction0+getTimestamp"></a>

### transaction0.getTimestamp() ⇒ <code>number</code>
**Kind**: instance method of [<code>Transaction0</code>](#Transaction0)  
**Returns**: <code>number</code> - - Get the unix timestamp of when the Transaction was signed (locally built transactions) or committed to Factom (from RPC response JSON)  
