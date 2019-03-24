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
    * [.getTokenChainId()](#Transaction1+getTokenChainId) ⇒ <code>string</code>
    * [.getEntryhash()](#Transaction1+getEntryhash) ⇒ <code>string</code>
    * [.getTimestamp()](#Transaction1+getTimestamp) ⇒ <code>number</code>

<a name="new_Transaction1_new"></a>

### new Transaction(builder)

| Param | Type | Description |
| --- | --- | --- |
| builder | <code>TransactionBuilder</code> \| <code>object</code> | Either a TransactionBuilder object or a FAT-0 transaction object content |

<a name="Transaction1+getInputs"></a>

### transaction1.getInputs() ⇒ <code>object</code>
**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>object</code> - - The transaction's inputs  
<a name="Transaction1+getOutputs"></a>

### transaction1.getOutputs() ⇒ <code>object</code>
**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>object</code> - - The transaction's outputs  
<a name="Transaction1+getMetadata"></a>

### transaction1.getMetadata() ⇒ <code>\*</code>
**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>\*</code> - - The transaction's metadata (if present, undefined if not)  
<a name="Transaction1+getTokenMetadata"></a>

### transaction1.getTokenMetadata() ⇒ <code>Array.&lt;object&gt;</code>
**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>Array.&lt;object&gt;</code> - - The token metadata (if present, undefined if not)  
<a name="Transaction1+isCoinbase"></a>

### transaction1.isCoinbase() ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>boolean</code> - - Whether the transaction is a coinbase transaction or not  
<a name="Transaction1+getEntry"></a>

### transaction1.getEntry() ⇒ <code>Entry</code>
**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>Entry</code> - - Get the Factom-JS Factom entry representation of the transaction, including extids & other signatures  
<a name="Transaction1+getTokenChainId"></a>

### transaction1.getTokenChainId() ⇒ <code>string</code>
**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>string</code> - - Get the Factom chain ID of the transaction's token. Returns undefined if the Transaction was constructed from an object  
<a name="Transaction1+getEntryhash"></a>

### transaction1.getEntryhash() ⇒ <code>string</code>
**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>string</code> - - Get the Factom entryhash of the transaction. Only defined if the Transaction was constructed from an object  
<a name="Transaction1+getTimestamp"></a>

### transaction1.getTimestamp() ⇒ <code>number</code>
**Kind**: instance method of [<code>Transaction1</code>](#Transaction1)  
**Returns**: <code>number</code> - - Get the unix timestamp of when the Transaction was constructed  
