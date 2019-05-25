<a name="CLI1"></a>

## CLI1 ⇐ [<code>BaseTokenCLI</code>](#BaseTokenCLI)
The FAT-1 a CLI access object. Used to request data about a FAT-0 token

**Kind**: global class  
**Extends**: [<code>BaseTokenCLI</code>](#BaseTokenCLI)  
**Access**: protected  

* [CLI1](#CLI1) ⇐ [<code>BaseTokenCLI</code>](#BaseTokenCLI)
    * [.getIssuance()](#CLI1+getIssuance) ⇒ <code>Promise</code>
    * [.getTransaction(entryhash)](#CLI1+getTransaction) ⇒ <code>Promise</code>
    * [.getTransactions(params)](#CLI1+getTransactions) ⇒ <code>Promise</code>
    * [.getNFToken(nftokenid)](#CLI1+getNFToken) ⇒ <code>Promise</code>
    * [.getNFBalance(params)](#CLI1+getNFBalance) ⇒ <code>Promise</code>
    * [.getNFTokens([params])](#CLI1+getNFTokens) ⇒ <code>Promise</code>
    * [.getType()](#CLI1+getType) ⇒ <code>string</code>
    * [.getCLI()](#BaseTokenCLI+getCLI) ⇒ [<code>CLI</code>](#CLI)
    * [.getTokenChainId()](#BaseTokenCLI+getTokenChainId) ⇒ <code>string</code>
    * [.getBalance(address)](#BaseTokenCLI+getBalance) ⇒ <code>Promise</code>
    * [.getStats()](#BaseTokenCLI+getStats) ⇒ <code>Promise</code>
    * [.sendTransaction()](#BaseTokenCLI+sendTransaction) ⇒ <code>Promise</code>

<a name="CLI1+getIssuance"></a>

### clI1.getIssuance() ⇒ <code>Promise</code>
Get the issuance for the FAT-1 token, returns a typed FAT-1 Issuance object

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  
**Overrides**: [<code>getIssuance</code>](#BaseTokenCLI+getIssuance)  
<a name="CLI1+getTransaction"></a>

### clI1.getTransaction(entryhash) ⇒ <code>Promise</code>
Get a FAT-1 transaction for the token by entryhash

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  
**Overrides**: [<code>getTransaction</code>](#BaseTokenCLI+getTransaction)  

| Param | Type | Description |
| --- | --- | --- |
| entryhash | <code>string</code> | The Factom entryhash of the transaction to get. Resolves to a FAT-0 Transaction object |

<a name="CLI1+getTransactions"></a>

### clI1.getTransactions(params) ⇒ <code>Promise</code>
Get a set of FAT-1 transactions for the token. Adjust results by parameters. Resolves to an of array FAT-1 Transaction objects

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  
**Overrides**: [<code>getTransactions</code>](#BaseTokenCLI+getTransactions)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>object</code> |  | Get transaction request parameters |
| [params.addresses] | <code>Array.&lt;string&gt;</code> |  | The list of public Factoid addresses to retrieve transactions for (Address appearing in inputs or outputs) |
| [params.entryhash] | <code>string</code> |  | The Factom entryhash of the transaction to start the result set at |
| [params.limit] | <code>number</code> | <code>25</code> | The integer limit of number of transactions returned |
| [params.page] | <code>number</code> | <code>0</code> | The page count of the results returned |
| [params.order] | <code>string</code> | <code>&quot;asc&quot;</code> | The time based sort order of transactions returned. Must be either "asc" or "desc" |

<a name="CLI1+getNFToken"></a>

### clI1.getNFToken(nftokenid) ⇒ <code>Promise</code>
Get an individual FAT-1 non-fungible token for the current token

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  

| Param | Type | Description |
| --- | --- | --- |
| nftokenid | <code>number</code> | The integer non-fungible token ID. 0 -> +inf |

<a name="CLI1+getNFBalance"></a>

### clI1.getNFBalance(params) ⇒ <code>Promise</code>
Get the individual non-fungible tokens belonging to a public Factoid address

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>object</code> |  | The request parameters |
| params.address | <code>string</code> |  | The public Factoid address to get the nf balance of |
| [params.limit] | <code>number</code> | <code>25</code> | The integer limit of number of transactions returned |
| [params.page] | <code>number</code> | <code>0</code> | The page count of the results returned |

<a name="CLI1+getNFTokens"></a>

### clI1.getNFTokens([params]) ⇒ <code>Promise</code>
Get all the currently issued non-fungible tokens on this FAT-1 token

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [params] | <code>object</code> |  | The request parameters |
| [params.limit] | <code>number</code> | <code>25</code> | The integer limit of number of transactions returned |
| [params.page] | <code>number</code> | <code>0</code> | The page count of the results returned |

<a name="CLI1+getType"></a>

### clI1.getType() ⇒ <code>string</code>
Get the type constant string of this CLI object. For example, "FAT-1"

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  
<a name="BaseTokenCLI+getCLI"></a>

### clI1.getCLI() ⇒ [<code>CLI</code>](#CLI)
Get the CLI object that was used to originally construct the BaseTokenCLI

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  
<a name="BaseTokenCLI+getTokenChainId"></a>

### clI1.getTokenChainId() ⇒ <code>string</code>
Get the Factom token chain ID used to originally construct the BaseTokenCLI

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  
<a name="BaseTokenCLI+getBalance"></a>

### clI1.getBalance(address) ⇒ <code>Promise</code>
Get the numeric balance of a Factoid address on the token. Returned as type BigNumber(https://www.npmjs.com/package/bignumber.js)

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | The public Factoid address to get the balance for |

<a name="BaseTokenCLI+getStats"></a>

### clI1.getStats() ⇒ <code>Promise</code>
Get statistics for the token.
stats.circulating, stats.burned and stats.transactions are all of type BigNumber(https://www.npmjs.com/package/bignumber.js)

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  
<a name="BaseTokenCLI+sendTransaction"></a>

### clI1.sendTransaction() ⇒ <code>Promise</code>
Submit a signed FAT-0/1 Transaction

**Kind**: instance method of [<code>CLI1</code>](#CLI1)  
