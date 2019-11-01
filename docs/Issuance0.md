<a name="Issuance0"></a>

## Issuance0
Build & Model A FAT-0 Issuance

**Kind**: global class  
**Access**: public  

* [Issuance0](#Issuance0)
    * [new Issuance(builder)](#new_Issuance0_new)
    * [.getChainId()](#Issuance0+getChainId) ⇒ <code>string</code>
    * [.getTokenId()](#Issuance0+getTokenId) ⇒ <code>string</code>
    * [.getIssuerChainId()](#Issuance0+getIssuerChainId) ⇒ <code>string</code>
    * [.getEntryhash()](#Issuance0+getEntryhash) ⇒ <code>string</code>
    * [.getTimestamp()](#Issuance0+getTimestamp) ⇒ <code>number</code>
    * [.getType()](#Issuance0+getType) ⇒ <code>string</code>
    * [.getSymbol()](#Issuance0+getSymbol) ⇒ <code>string</code>
    * [.getSupply()](#Issuance0+getSupply) ⇒ <code>BigNumber</code>
    * [.getPrecision()](#Issuance0+getPrecision) ⇒ <code>BigNumber</code>
    * [.getMetadata()](#Issuance0+getMetadata) ⇒ <code>\*</code>
    * [.getChain()](#Issuance0+getChain) ⇒ <code>Chain</code>
    * [.getEntry()](#Issuance0+getEntry) ⇒ <code>Entry</code>

<a name="new_Issuance0_new"></a>

### new Issuance(builder)

| Param | Type | Description |
| --- | --- | --- |
| builder | <code>IssuanceBuilder</code> \| <code>Object</code> | The IssuanceBuilder or object to construct the issuance from |

<a name="Issuance0+getChainId"></a>

### issuance0.getChainId() ⇒ <code>string</code>
Get the Factom Chain ID for this token issuance

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>string</code> - - The Factom Chain ID calculated from rootChainID and tokenId  
<a name="Issuance0+getTokenId"></a>

### issuance0.getTokenId() ⇒ <code>string</code>
Get the token ID string for this token issuance

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>string</code> - - The token ID string chosen by the issuer  
<a name="Issuance0+getIssuerChainId"></a>

### issuance0.getIssuerChainId() ⇒ <code>string</code>
Get identity's Factom Chain ID string for this token

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>string</code> - - The token ID string chosen by the issuer  
<a name="Issuance0+getEntryhash"></a>

### issuance0.getEntryhash() ⇒ <code>string</code>
Get the entryhash of this issuance object. Only populated for entries parsed from fatd

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>string</code> - - The Factom Entryhash  
<a name="Issuance0+getTimestamp"></a>

### issuance0.getTimestamp() ⇒ <code>number</code>
Get the timestamp in unix seconds of when this issuance object was signed

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>number</code> - - The signing timestamp  
<a name="Issuance0+getType"></a>

### issuance0.getType() ⇒ <code>string</code>
Get the type string constant of which type of FAT token this issuance represent

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>string</code> - - Returns "FAT-0"  
<a name="Issuance0+getSymbol"></a>

### issuance0.getSymbol() ⇒ <code>string</code>
Get the symbol string of this FAT token represent. E.x. MYT

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>string</code> - - The symbol string chosen by the issuer  
<a name="Issuance0+getSupply"></a>

### issuance0.getSupply() ⇒ <code>BigNumber</code>
Get the maximum circulating supply for this FAT token issuance

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>BigNumber</code> - [supply=-1] - The maximum number of circulating tokens allowed  
<a name="Issuance0+getPrecision"></a>

### issuance0.getPrecision() ⇒ <code>BigNumber</code>
Get the decimal precision for this FAT token issuance

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>BigNumber</code> - [precision=undefined] - The decimal precision of the tokens base units in relation to display units  
<a name="Issuance0+getMetadata"></a>

### issuance0.getMetadata() ⇒ <code>\*</code>
Get the metadata included with the FAT token issuance, if present

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>\*</code> - - The issuances's metadata (if present, undefined if not)  
<a name="Issuance0+getChain"></a>

### issuance0.getChain() ⇒ <code>Chain</code>
Get the Chain object representing the the token chain, including the first entry (chain establishment entry)
Can be submitted directly to Factom using factom-js. After the chain is established the signed issuance entry
may be placed on the new chain to issue the token (via getEntry())

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>Chain</code> - - The Chain object for the issuance  
**See**: https://github.com/PaulBernier/factomjs/blob/master/src/chain.js  
<a name="Issuance0+getEntry"></a>

### issuance0.getEntry() ⇒ <code>Entry</code>
Get the Entry object representing the initialization entry (token establishment entry)
Can be submitted directly to Factom

**Kind**: instance method of [<code>Issuance0</code>](#Issuance0)  
**Returns**: <code>Entry</code> - - The complete entry establishing the token's issuance  
**See**: https://github.com/PaulBernier/factomjs/blob/master/src/entry.js  
**Example**  
```js
const {FactomCli, Entry, Chain} = require('factom');

     const cli = new FactomCli(); // Default factomd connection to localhost:8088 and walletd connection to localhost:8089

     const tokenChainId = '013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec';

     const issuance = new IssuanceBuilder("mytoken", "888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762", "sk11pz4AG9XgB1eNVkbppYAWsgyg7sftDXqBASsagKJqvVRKYodCU")
     .symbol('TTK')
     .supply(1000000)
     .metadata({'abc': 123})
     .build();

     //"cast" the chain and entry objects to prevent compatibility issues
     const chain = new Chain(Entry.builder(issuance.getChain().firstEntry).build());
     const entry = Entry.builder(issuance.getEntry()).build();

     await cli.add(chain, "Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym"); //create the token chain on Factom
     await cli.add(entry, "Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym"); //commit the signed issuance entry to the token chain
```
