<a name="CLI0"></a>

## CLI0 ⇐ [<code>BaseTokenCLI</code>](#BaseTokenCLI)
The FAT-0 CLI access object. Used to request data about a FAT-0 token

**Kind**: global class  
**Extends**: [<code>BaseTokenCLI</code>](#BaseTokenCLI)  
**Access**: protected  

* [CLI0](#CLI0) ⇐ [<code>BaseTokenCLI</code>](#BaseTokenCLI)
    * [.getIssuance()](#CLI0+getIssuance) ⇒ <code>Promise</code>
    * [.getTransaction(entryhash)](#CLI0+getTransaction) ⇒ <code>Promise</code>
    * [.getTransactions(params)](#CLI0+getTransactions) ⇒ <code>Promise</code>
    * [.getType()](#CLI0+getType) ⇒ <code>string</code>
    * [.getCLI()](#BaseTokenCLI+getCLI) ⇒ [<code>CLI</code>](#CLI)
    * [.getTokenChainId()](#BaseTokenCLI+getTokenChainId) ⇒ <code>string</code>
    * [.getBalance(address)](#BaseTokenCLI+getBalance) ⇒ <code>Promise</code>
    * [.getStats()](#BaseTokenCLI+getStats) ⇒ <code>Promise</code>
    * [.sendTransaction()](#BaseTokenCLI+sendTransaction) ⇒ <code>Promise</code>

<a name="CLI0+getIssuance"></a>

### clI0.getIssuance() ⇒ <code>Promise</code>
Get the issuance for the FAT-0 token, returns a typed FAT-0 Issuance object

**Kind**: instance method of [<code>CLI0</code>](#CLI0)  
**Overrides**: [<code>getIssuance</code>](#BaseTokenCLI+getIssuance)  
<a name="CLI0+getTransaction"></a>

### clI0.getTransaction(entryhash) ⇒ <code>Promise</code>
Get a FAT-0 transaction for the token by entryhash

**Kind**: instance method of [<code>CLI0</code>](#CLI0)  
**Overrides**: [<code>getTransaction</code>](#BaseTokenCLI+getTransaction)  

| Param | Type | Description |
| --- | --- | --- |
| entryhash | <code>string</code> | The Factom entryhash of the transaction to get. Resolves to a FAT-0 Transaction object |

<a name="CLI0+getTransactions"></a>

### clI0.getTransactions(params) ⇒ <code>Promise</code>
Get a set of FAT-1 transactions for the token. Adjust results by parameters. Resolves to an of array FAT-0 Transaction objects

**Kind**: instance method of [<code>CLI0</code>](#CLI0)  
**Overrides**: [<code>getTransactions</code>](#BaseTokenCLI+getTransactions)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>object</code> |  | Get transaction request parameters |
| [params.addresses] | <code>Array.&lt;string&gt;</code> |  | The list of public Factoid addresses to retrieve transactions for (Address appearing in inputs or outputs) |
| [params.entryhash] | <code>string</code> |  | The Factom entryhash of the transaction to start the result set at |
| [params.limit] | <code>number</code> | <code>25</code> | The integer limit of number of transactions returned |
| [params.page] | <code>number</code> | <code>0</code> | The page count of the results returned |
| [params.order] | <code>string</code> | <code>&quot;asc&quot;</code> | The time based sort order of transactions returned. Must be either "asc" or "desc" |

<a name="CLI0+getType"></a>

### clI0.getType() ⇒ <code>string</code>
Get the type constant string of this CLI object. In this case, "FAT-0"

**Kind**: instance method of [<code>CLI0</code>](#CLI0)  
<a name="BaseTokenCLI+getCLI"></a>

### clI0.getCLI() ⇒ [<code>CLI</code>](#CLI)
Get the CLI object that was used to originally construct the BaseTokenCLI

**Kind**: instance method of [<code>CLI0</code>](#CLI0)  
<a name="BaseTokenCLI+getTokenChainId"></a>

### clI0.getTokenChainId() ⇒ <code>string</code>
Get the Factom token chain ID used to originally construct the BaseTokenCLI

**Kind**: instance method of [<code>CLI0</code>](#CLI0)  
<a name="BaseTokenCLI+getBalance"></a>

### clI0.getBalance(address) ⇒ <code>Promise</code>
Get the numeric balance of a Factoid address on the token. Returned as type BigNumber(https://www.npmjs.com/package/bignumber.js)

**Kind**: instance method of [<code>CLI0</code>](#CLI0)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | The public Factoid address to get the balance for |

<a name="BaseTokenCLI+getStats"></a>

### clI0.getStats() ⇒ <code>Promise</code>
Get statistics for the token.
stats.circulating, stats.burned and stats.transactions are all of type BigNumber(https://www.npmjs.com/package/bignumber.js)

**Kind**: instance method of [<code>CLI0</code>](#CLI0)  
<a name="BaseTokenCLI+sendTransaction"></a>

### clI0.sendTransaction() ⇒ <code>Promise</code>
Submit a signed FAT-0/1 Transaction

**Kind**: instance method of [<code>CLI0</code>](#CLI0)  
