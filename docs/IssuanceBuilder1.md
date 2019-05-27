<a name="IssuanceBuilder1"></a>

## IssuanceBuilder1
Build & Model A FAT-1 Issuance

**Kind**: global class  
**Access**: public  

* [IssuanceBuilder1](#IssuanceBuilder1)
    * [new IssuanceBuilder(tokenId, identityChainId, sk1)](#new_IssuanceBuilder1_new)
    * [.symbol(symbol)](#IssuanceBuilder1+symbol) ⇒ <code>IssuanceBuilder</code>
    * [.supply(supply)](#IssuanceBuilder1+supply) ⇒ <code>IssuanceBuilder</code>
    * [.metadata(metadata)](#IssuanceBuilder1+metadata) ⇒ <code>IssuanceBuilder</code>
    * [.build()](#IssuanceBuilder1+build) ⇒ <code>Issuance</code>

<a name="new_IssuanceBuilder1_new"></a>

### new IssuanceBuilder(tokenId, identityChainId, sk1)

| Param | Type | Description |
| --- | --- | --- |
| tokenId | <code>string</code> | arbitrary string to use as a token identifier |
| identityChainId | <code>string</code> | 64 character Factom Chain ID of the identity to issue the token under |
| sk1 | <code>string</code> | SK1 Private key belonging to the identity at identityChainId |

<a name="IssuanceBuilder1+symbol"></a>

### issuanceBuilder1.symbol(symbol) ⇒ <code>IssuanceBuilder</code>
Set a symbol for the token

**Kind**: instance method of [<code>IssuanceBuilder1</code>](#IssuanceBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | arbitrary string to use as a token symbol identifier. e.x. MYT |

<a name="IssuanceBuilder1+supply"></a>

### issuanceBuilder1.supply(supply) ⇒ <code>IssuanceBuilder</code>
Set a maximum circulating supply for the token

**Kind**: instance method of [<code>IssuanceBuilder1</code>](#IssuanceBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| supply | <code>number</code> | An integer maximum circulating supply to allow for the token. May be -1 for infinite, otherwise must be greater than 0 |

<a name="IssuanceBuilder1+metadata"></a>

### issuanceBuilder1.metadata(metadata) ⇒ <code>IssuanceBuilder</code>
Set arbitrary metadata for the token issuance

**Kind**: instance method of [<code>IssuanceBuilder1</code>](#IssuanceBuilder1)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>\*</code> | The metadata. Must be JSON stringifyable |

<a name="IssuanceBuilder1+build"></a>

### issuanceBuilder1.build() ⇒ <code>Issuance</code>
Build the issuance

**Kind**: instance method of [<code>IssuanceBuilder1</code>](#IssuanceBuilder1)  
