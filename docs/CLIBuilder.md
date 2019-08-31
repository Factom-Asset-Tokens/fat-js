<a name="CLIBuilder"></a>

## CLIBuilder
Build a CLI object, defining the connection parameters to fatd and other network dependencies

**Kind**: global class  
**Access**: public  

* [CLIBuilder](#CLIBuilder)
    * [.host(host)](#CLIBuilder+host) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
    * [.port(port)](#CLIBuilder+port) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
    * [.timeout(timeout)](#CLIBuilder+timeout) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
    * [.secure([secure])](#CLIBuilder+secure) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
    * [.protocol([protocol])](#CLIBuilder+protocol) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
    * [.username(username)](#CLIBuilder+username) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
    * [.password(password)](#CLIBuilder+password) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
    * [.build()](#CLIBuilder+build) ⇒ [<code>CLI</code>](#CLI)

<a name="CLIBuilder+host"></a>

### cliBuilder.host(host) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
Set the host information for connection to fatd

**Kind**: instance method of [<code>CLIBuilder</code>](#CLIBuilder)  

| Param | Type | Description |
| --- | --- | --- |
| host | <code>string</code> | The host string of where the fatd RPC host can be found |

<a name="CLIBuilder+port"></a>

### cliBuilder.port(port) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
Set the port information for connection to fatd

**Kind**: instance method of [<code>CLIBuilder</code>](#CLIBuilder)  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>number</code> | The port the fatd RPC host can be found on at the destination host |

<a name="CLIBuilder+timeout"></a>

### cliBuilder.timeout(timeout) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
Set the connection timeout during connection to fatd

**Kind**: instance method of [<code>CLIBuilder</code>](#CLIBuilder)  

| Param | Type | Description |
| --- | --- | --- |
| timeout | <code>number</code> | The timeout in milliseconds before giving up |

<a name="CLIBuilder+secure"></a>

### cliBuilder.secure([secure]) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
Enforce strict security on https connections to fatd (forbid self signed certs, etc)

**Kind**: instance method of [<code>CLIBuilder</code>](#CLIBuilder)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [secure] | <code>boolean</code> | <code>true</code> | True if secure connection is desired, false if not |

<a name="CLIBuilder+protocol"></a>

### cliBuilder.protocol([protocol]) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
Which transport protocol to use to contact fatd

**Kind**: instance method of [<code>CLIBuilder</code>](#CLIBuilder)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [protocol] | <code>number</code> | <code>&quot;http&quot;</code> | The protocol to use. Either "http" or "https" |

<a name="CLIBuilder+username"></a>

### cliBuilder.username(username) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
Set the username to use for basic HTTP authentication with fatd

**Kind**: instance method of [<code>CLIBuilder</code>](#CLIBuilder)  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | The username string to use |

<a name="CLIBuilder+password"></a>

### cliBuilder.password(password) ⇒ [<code>CLIBuilder</code>](#CLIBuilder)
Set the password to use for basic HTTP authentication with fatd

**Kind**: instance method of [<code>CLIBuilder</code>](#CLIBuilder)  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> | The password string to use |

<a name="CLIBuilder+build"></a>

### cliBuilder.build() ⇒ [<code>CLI</code>](#CLI)
Build the CLI

**Kind**: instance method of [<code>CLIBuilder</code>](#CLIBuilder)  
