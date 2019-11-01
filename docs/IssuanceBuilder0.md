<a name="IssuanceBuilder0"></a>

## IssuanceBuilder0
Build & Model A FAT-0 Issuance

**Kind**: global class  
**Access**: public  

* [IssuanceBuilder0](#IssuanceBuilder0)
    * [new IssuanceBuilder(tokenId, identityChainId, sk1)](#new_IssuanceBuilder0_new)
    * [.symbol(symbol)](#IssuanceBuilder0+symbol) ⇒ <code>IssuanceBuilder</code>
    * [.supply(supply)](#IssuanceBuilder0+supply) ⇒ <code>IssuanceBuilder</code>
    * [.precision(precision)](#IssuanceBuilder0+precision) ⇒ <code>IssuanceBuilder</code>
    * [.metadata(metadata)](#IssuanceBuilder0+metadata) ⇒ <code>IssuanceBuilder</code>
    * [.build()](#IssuanceBuilder0+build) ⇒ <code>Issuance</code>

<a name="new_IssuanceBuilder0_new"></a>

### new IssuanceBuilder(tokenId, identityChainId, sk1)

| Param | Type | Description |
| --- | --- | --- |
| tokenId | <code>string</code> | arbitrary string to use as a token identifier |
| identityChainId | <code>string</code> | 64 character Factom Chain ID of the identity to issue the token under |
| sk1 | <code>string</code> | SK1 Private key belonging to the identity at identityChainId |

<a name="IssuanceBuilder0+symbol"></a>

### issuanceBuilder0.symbol(symbol) ⇒ <code>IssuanceBuilder</code>
Set a symbol for the token

**Kind**: instance method of [<code>IssuanceBuilder0</code>](#IssuanceBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | arbitrary string to use as a token symbol identifier. e.x. MYT |

<a name="IssuanceBuilder0+supply"></a>

### issuanceBuilder0.supply(supply) ⇒ <code>IssuanceBuilder</code>
Set a maximum circulating supply for the token

**Kind**: instance method of [<code>IssuanceBuilder0</code>](#IssuanceBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| supply | <code>number</code> | An integer maximum circulating supply to allow for the token. May be -1 for infinite, otherwise must be greater than 0 |

<a name="IssuanceBuilder0+precision"></a>

### issuanceBuilder0.precision(precision) ⇒ <code>IssuanceBuilder</code>
Set a decimal precision for the token.

**Kind**: instance method of [<code>IssuanceBuilder0</code>](#IssuanceBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| precision | <code>number</code> | Must be an integer between 0 and 18 inclusive |

<a name="IssuanceBuilder0+metadata"></a>

### issuanceBuilder0.metadata(metadata) ⇒ <code>IssuanceBuilder</code>
Set arbitrary metadata for the token issuance

**Kind**: instance method of [<code>IssuanceBuilder0</code>](#IssuanceBuilder0)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>\*</code> | The metadata. Must be JSON stringifyable |

<a name="IssuanceBuilder0+build"></a>

### issuanceBuilder0.build() ⇒ <code>Issuance</code>
Build the issuance

**Kind**: instance method of [<code>IssuanceBuilder0</code>](#IssuanceBuilder0)  
