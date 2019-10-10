<a name="CLI"></a>

## CLI
Base CLI object. Provides an interfaces to access fatd daemon calls & get token CLI objects

**Kind**: global class  
**Access**: protected  

* [CLI](#CLI)
    * [new CLI(builder)](#new_CLI_new)
    * [.call(method, params)](#CLI+call) ⇒ <code>Promise</code>
    * [.getTokenCLI(tokenChainId, [type])](#CLI+getTokenCLI) ⇒ <code>Promise</code>
    * [.getTokenCLISync(tokenChainId, type)](#CLI+getTokenCLISync) ⇒ [<code>BaseTokenCLI</code>](#BaseTokenCLI)
    * [.getTrackedTokens()](#CLI+getTrackedTokens) ⇒ <code>Promise</code>
    * [.getDaemonProperties()](#CLI+getDaemonProperties) ⇒ <code>Promise</code>
    * [.getSyncStatus()](#CLI+getSyncStatus) ⇒ <code>Promise</code>
    * [.getBalances(address)](#CLI+getBalances) ⇒ <code>Promise</code>
    * [.getCompatibility()](#CLI+getCompatibility) ⇒ <code>Object</code>

<a name="new_CLI_new"></a>

### new CLI(builder)

| Param | Type | Description |
| --- | --- | --- |
| builder | [<code>CLIBuilder</code>](#CLIBuilder) | A CLIBuilder object |

**Example**  
```js
const CLIBuilder = require('fat-js').CLIBuilder
let cli = new CLIBuilder()
.host('fatnode.mysite.com')
.port(8078)
.timeout(3500) //optional, timeout ms
.build();
```
<a name="CLI+call"></a>

### clI.call(method, params) ⇒ <code>Promise</code>
Provide a method to do a raw call to the fatd RPC endpoint, allow arbitrary RPC method name and params object

**Kind**: instance method of [<code>CLI</code>](#CLI)  

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The method name string to call |
| params | <code>object</code> | The params object to submit |

<a name="CLI+getTokenCLI"></a>

### clI.getTokenCLI(tokenChainId, [type]) ⇒ <code>Promise</code>
Generate a CLI object that allows calls about token specific data. Will automatically determine token type async if not specified

**Kind**: instance method of [<code>CLI</code>](#CLI)  

| Param | Type | Description |
| --- | --- | --- |
| tokenChainId | <code>string</code> | The Factom chain ID of the token to get the CLI for |
| [type] | <code>string</code> | Optional type string of the token to get the CLI for. Must be Either "FAT-0" or "FAT-1". If specified overrides auto-detection |

<a name="CLI+getTokenCLISync"></a>

### clI.getTokenCLISync(tokenChainId, type) ⇒ [<code>BaseTokenCLI</code>](#BaseTokenCLI)
Generate a CLI object that allows calls about token specific data synchronously

**Kind**: instance method of [<code>CLI</code>](#CLI)  

| Param | Type | Description |
| --- | --- | --- |
| tokenChainId | <code>string</code> | The Factom chain ID of the token to get the CLI for |
| type | <code>string</code> | The type string of the object to submit. Must be Either "FAT-0" or "FAT-1" |

<a name="CLI+getTrackedTokens"></a>

### clI.getTrackedTokens() ⇒ <code>Promise</code>
Get all the tokens that are currently tracked by the FAT daemon

**Kind**: instance method of [<code>CLI</code>](#CLI)  
<a name="CLI+getDaemonProperties"></a>

### clI.getDaemonProperties() ⇒ <code>Promise</code>
Get the properties of the FAT daemon

**Kind**: instance method of [<code>CLI</code>](#CLI)  
<a name="CLI+getSyncStatus"></a>

### clI.getSyncStatus() ⇒ <code>Promise</code>
Get the Factom sync status of the FAT daemon

**Kind**: instance method of [<code>CLI</code>](#CLI)  
<a name="CLI+getBalances"></a>

### clI.getBalances(address) ⇒ <code>Promise</code>
Get the numeric token balance counts for all tracked tokens for a public Factoid address

**Kind**: instance method of [<code>CLI</code>](#CLI)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | The public Factoid address to get all token balances for |

<a name="CLI+getCompatibility"></a>

### clI.getCompatibility() ⇒ <code>Object</code>
Get an array of compatibility warnings for the connected fatd node. Zero elements returned means full compatibility

**Kind**: instance method of [<code>CLI</code>](#CLI)  
**Returns**: <code>Object</code> - [] - The array of compatibility error objects  
