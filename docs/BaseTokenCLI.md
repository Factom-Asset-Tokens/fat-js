<a name="BaseTokenCLI"></a>

## *BaseTokenCLI*
Base Token CLI object. Provides an abstract interface to access token specific data from fatd

**Kind**: global abstract class  
**Access**: protected  

* *[BaseTokenCLI](#BaseTokenCLI)*
    * *[new BaseTokenCLI(cli, tokenChainId)](#new_BaseTokenCLI_new)*
    * *[.getCLI()](#BaseTokenCLI+getCLI) ⇒ [<code>CLI</code>](#CLI)*
    * *[.getChainId()](#BaseTokenCLI+getChainId) ⇒ <code>string</code>*
    * *[.getIssuance()](#BaseTokenCLI+getIssuance) ⇒ <code>Promise</code>*
    * *[.getTransaction(entryhash)](#BaseTokenCLI+getTransaction) ⇒ <code>Promise</code>*
    * *[.getTransactions(params)](#BaseTokenCLI+getTransactions) ⇒ <code>Promise</code>*
    * *[.getBalance(address)](#BaseTokenCLI+getBalance) ⇒ <code>Promise</code>*
    * *[.getStats()](#BaseTokenCLI+getStats) ⇒ <code>Promise</code>*
    * *[.sendTransaction()](#BaseTokenCLI+sendTransaction) ⇒ <code>Promise</code>*

<a name="new_BaseTokenCLI_new"></a>

### *new BaseTokenCLI(cli, tokenChainId)*

| Param | Type | Description |
| --- | --- | --- |
| cli | [<code>CLI</code>](#CLI) | An existing CLI object |
| tokenChainId | <code>string</code> | The Factom chain ID of the token to get the CLI for |

<a name="BaseTokenCLI+getCLI"></a>

### *baseTokenCLI.getCLI() ⇒ [<code>CLI</code>](#CLI)*
Get the CLI object that was used to originally construct the BaseTokenCLI

**Kind**: instance method of [<code>BaseTokenCLI</code>](#BaseTokenCLI)  
<a name="BaseTokenCLI+getChainId"></a>

### *baseTokenCLI.getChainId() ⇒ <code>string</code>*
Get the Factom token chain ID used to originally construct the BaseTokenCLI

**Kind**: instance method of [<code>BaseTokenCLI</code>](#BaseTokenCLI)  
<a name="BaseTokenCLI+getIssuance"></a>

### *baseTokenCLI.getIssuance() ⇒ <code>Promise</code>*
Get the token's issuance object

**Kind**: instance method of [<code>BaseTokenCLI</code>](#BaseTokenCLI)  
<a name="BaseTokenCLI+getTransaction"></a>

### *baseTokenCLI.getTransaction(entryhash) ⇒ <code>Promise</code>*
Get a generic FAT transaction for the token by entryhash

**Kind**: instance method of [<code>BaseTokenCLI</code>](#BaseTokenCLI)  

| Param | Type | Description |
| --- | --- | --- |
| entryhash | <code>string</code> | The Factom entryhash of the transaction to get |

<a name="BaseTokenCLI+getTransactions"></a>

### *baseTokenCLI.getTransactions(params) ⇒ <code>Promise</code>*
Get a set of FAT transactions for the token. Adjust results by parameters

**Kind**: instance method of [<code>BaseTokenCLI</code>](#BaseTokenCLI)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>object</code> |  | Get transaction request parameters |
| [params.addresses] | <code>Array.&lt;string&gt;</code> |  | The list of public Factoid addresses to retrieve transactions for (Address appearing in inputs or outputs) |
| [params.entryhash] | <code>string</code> |  | The Factom entryhash of the transaction to start the result set at |
| [params.limit] | <code>number</code> | <code>25</code> | The integer limit of number of transactions returned |
| [params.page] | <code>number</code> | <code>0</code> | The page count of the results returned |
| [params.order] | <code>string</code> | <code>&quot;asc&quot;</code> | The time based sort order of transactions returned. Must be either "asc" or "desc" |

<a name="BaseTokenCLI+getBalance"></a>

### *baseTokenCLI.getBalance(address) ⇒ <code>Promise</code>*
Get the numeric balance of a Factoid address on the token. Returned as type BigNumber(https://www.npmjs.com/package/bignumber.js)

**Kind**: instance method of [<code>BaseTokenCLI</code>](#BaseTokenCLI)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | The public Factoid address to get the balance for |

<a name="BaseTokenCLI+getStats"></a>

### *baseTokenCLI.getStats() ⇒ <code>Promise</code>*
Get statistics for the token.
stats.circulating, stats.burned and stats.transactions are all of type BigNumber(https://www.npmjs.com/package/bignumber.js)

**Kind**: instance method of [<code>BaseTokenCLI</code>](#BaseTokenCLI)  
<a name="BaseTokenCLI+sendTransaction"></a>

### *baseTokenCLI.sendTransaction() ⇒ <code>Promise</code>*
Submit a signed FAT-0/1 Transaction

**Kind**: instance method of [<code>BaseTokenCLI</code>](#BaseTokenCLI)  
