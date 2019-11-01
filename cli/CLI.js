const https = require('https');
const constant = require('../constant');
const axios = require('axios');
const JSONBig = require('json-bigint')({strict: true});
const BigNumber = require('bignumber.js');
const Joi = require('joi-browser').extend(require('joi-factom'));
const fctAddressUtil = require('factom/src/addresses');
const compatibility = require('./compatibility');

const nonPendingMethods = [
    'get-daemon-properties',
    'get-daemon-tokens',
    'get-sync-status'
];

/**
 * Build a CLI object, defining the connection parameters to fatd and other network dependencies
 * @class
 * @public
 */
class CLIBuilder {

    /**
     * @constructor
     */
    constructor() {
        //set defaults
        this._protocol = 'http';
    }

    /**
     * Set the host information for connection to fatd. Defaults to localhost if host is not set.
     * @method
     * @param {string} host - The host string of where the fatd RPC host can be found. For example 'node.fatd.org', `88.21.0.1`
     * @returns {CLIBuilder}
     */
    host(host) {
        if (typeof host !== 'string' || host.length === 0) throw new Error('Host must be a string with length >=1 and contain no special characters');
        this._host = host;
        return this;
    }

    /**
     * Set the port information for connection to fatd
     * @method
     * @param {number} port - The port the fatd RPC host can be found on at the destination host
     * @returns {CLIBuilder}
     */
    port(port) {
        if (isNaN(port) || !Number.isInteger(port) || port < 0) throw new Error("Port must be an integer >= 0");
        this._port = port;
        return this;
    }

    /**
     * Set the connection timeout during connection to fatd
     * @method
     * @param {number} timeout - The timeout in milliseconds before giving up
     * @returns {CLIBuilder}
     */
    timeout(timeout) {
        this._timeout = timeout;
        return this;
    }

    /**
     * Enforce strict security on https connections to fatd (forbid self signed certs, etc). Default false
     * @method
     * @param {boolean} [secure=true] - True if secure connection is desired, false if not
     * @returns {CLIBuilder}
     */
    secure(secure) {
        if (typeof secure !== 'boolean') throw new Error('Argument must be a boolean');
        this._secure = secure;
        return this;
    }

    /**
     * Which transport protocol to use to contact fatd. Default "http"
     * @method
     * @param {number} [protocol="http"] - The protocol to use. Either "http" or "https"
     * @returns {CLIBuilder}
     */
    protocol(protocol) {
        if (protocol !== 'http' && protocol !== 'https') throw new Error('Invalid protocol string');
        this._protocol = protocol;
        return this;
    }

    /**
     * Set the username to use for basic HTTP authentication with fatd
     * @method
     * @param {string} username - The username string to use
     * @returns {CLIBuilder}
     */
    username(username) {
        if (typeof username !== 'string') throw new Error('Username must be a string');
        if (username.length === 0) throw new Error('Username must be at least one character long');
        this._username = username;
        return this;
    }

    /**
     * Set the password to use for basic HTTP authentication with fatd
     * @method
     * @param {string} password - The password string to use
     * @returns {CLIBuilder}
     */
    password(password) {
        if (typeof password !== 'string') throw new Error('Password must be a string');
        if (password.length === 0) throw new Error('Password must be at least one character long');
        this._password = password;
        return this;
    }

    /**
     * Request a pending view of data & statistics from fatd based on transaction entries that have not made it to a dblock yet. Default false
     * @method
     * @param {boolean} [pending=false] - True if secure connection is desired, false if not
     * @returns {CLIBuilder}
     */
    pending(pending) {
        if (typeof pending !== 'boolean') throw new Error('Argument pending must be a boolean');
        this._pending = pending;
        return this;
    }

    /**
     * Build the CLI
     * @method
     * @returns {CLI}
     */
    build() {
        if (this._username && !this._password || this._password && !this._username) throw new Error('You must specify both a username and password for basic authentication');

        return new CLI(this);
    }
}

/**
 * Base CLI object. Provides an interfaces to access fatd daemon calls & get token CLI objects
 * @class
 * @protected
 * @example
 * const CLIBuilder = require('fat-js').CLIBuilder
 * let cli = new CLIBuilder()
 * .host('fatnode.mysite.com')
 * .port(8078)
 * .timeout(3500) //optional, timeout ms
 * .build();
 */
class CLI {

    /**
     * @constructor
     * @param {CLIBuilder} builder - A CLIBuilder object
     */
    constructor(builder) {
        if (!(builder instanceof CLIBuilder)) throw new Error("Must include an cli builder");
        this._host = builder._host || 'localhost';
        this._port = builder._port || 8078;
        this._username = builder._username;
        this._password = builder._password;
        this._secure = builder._secure;
        this._protocol = builder._protocol;

        this._timeout = builder._timeout || 5000;
        this._pending = builder._pending;

        this._axios = axios.create({
            baseURL: this._protocol + '://' + this._host + ':' + this._port + '/v1',
            timeout: this._timeout,
            auth: (this._username && this._password) ? {username: this._username, password: this._password} : undefined,
            httpsAgent: this._secure ? undefined : new https.Agent({rejectUnauthorized: false}) //if secure is true use default https agent with full security
        });
    }

    /**
     * Provide a method to do a raw call to the fatd RPC endpoint, allow arbitrary RPC method name and params object
     * @method
     * @async
     * @param {string} method - The method name string to call
     * @param {object} params - The params object to submit
     * @returns {Promise}
     */
    async call(method, params) {

        //If pending entries are enabled, splice in the param for methods that allow it
        if (this._pending && !nonPendingMethods.includes(method)) params.includepending = true;

        const response = await this._axios.post(
            '/',
            {
                jsonrpc: '2.0',
                id: Math.floor(Math.random() * 10000),
                method,
                params
            },
            {
                transformResponse: [data => {
                    try {
                        return JSONBig.parse(data)
                    } catch (e) {
                        console.error('Invalid Non-JSON API Response: ', data);
                        return {}
                    }
                }]
            }
        );

        const data = response.data;
        if (data.error !== undefined) throw new Error(JSON.stringify(data.error));

        //check response conforms to expected fatd return

        return data.result;
    }

    /**
     * Generate a CLI object that allows calls about token specific data. Will automatically determine token type async if not specified
     * @method
     * @async
     * @param {string} tokenChainId - The Factom chain ID of the token to get the CLI for
     * @param {string} [type] - Optional type string of the token to get the CLI for. Must be Either "FAT-0" or "FAT-1". If specified overrides auto-detection
     * @returns {Promise}
     */
    async getTokenCLI(tokenChainId, type) {
        switch (type) {
            case constant.FAT0: {
                return new FAT0CLI(this, tokenChainId);
            }
            case constant.FAT1: {
                return new FAT1CLI(this, tokenChainId);
            }
            default: {
                const issuanceEntry = await new BaseTokenCLI(this, tokenChainId).getIssuance();
                return this.getTokenCLI(tokenChainId, issuanceEntry.issuance.type);
            }
        }
    }

    /**
     * Generate a CLI object that allows calls about token specific data synchronously
     * @method
     * @async
     * @param {string} tokenChainId - The Factom chain ID of the token to get the CLI for
     * @param {string} type - The type string of the object to submit. Must be Either "FAT-0" or "FAT-1"
     * @returns {BaseTokenCLI}
     */
    getTokenCLISync(tokenChainId, type) {
        switch (type) {
            case constant.FAT0: {
                return new FAT0CLI(this, tokenChainId);
            }
            case constant.FAT1: {
                return new FAT1CLI(this, tokenChainId);
            }
            default: {
                throw new Error('Invalid FAT type string: ' + type);
            }
        }
    }

    /**
     * Get all the tokens that are currently tracked by the FAT daemon
     * @method
     * @async
     * @returns {Promise}
     */
    getTrackedTokens() {
        return this.call('get-daemon-tokens');
    }

    /**
     * Get the properties of the FAT daemon
     * @method
     * @async
     * @returns {Promise}
     */
    getDaemonProperties() {
        return this.call('get-daemon-properties');
    }

    /**
     * Get the Factom sync status of the FAT daemon
     * @method
     * @async
     * @returns {Promise}
     */
    getSyncStatus() {
        return this.call('get-sync-status');
    }

    /**
     * Get the numeric token balance counts for all tracked tokens for a public Factoid address
     * @method
     * @async
     * @param {string} address - The public Factoid address to get all token balances for
     * @returns {Promise}
     */
    async getBalances(address) {
        if (!fctAddressUtil.isValidPublicFctAddress(address)) throw new Error('Invalid public Factoid address');
        const balances = await this.call('get-balances', {address});

        //force all values in the balance map to bignumber
        Object.keys(balances).forEach((chainId) => balances[chainId] = new BigNumber(balances[chainId]));
        return balances;
    }

    /**
     * Get an array of compatibility warnings for the connected fatd node. Zero elements returned means full compatibility
     * @method
     * @async
     * @returns {Object}[] - The array of compatibility error objects
     */
    async getCompatibility() {

        const response = await this._axios.post(
            '/',
            {
                jsonrpc: '2.0',
                id: Math.floor(Math.random() * 10000),
                method: 'get-daemon-properties'
            }
        );

        const data = response.data;
        if (data.error !== undefined) throw new Error(JSON.stringify(data.error));

        return compatibility.getVersionCompatibility(response.headers['fatd-version'])
    }
}

const getTransactionsSchema = Joi.object().keys({
    entryhash: Joi.string().length(64),
    addresses: Joi.array().items(Joi.factom().factoidAddress('public')),
    page: Joi.number().integer().min(0),
    limit: Joi.number().integer().min(0),
    order: Joi.string().valid(['asc', 'desc']),
});

/**
 * Base Token CLI object. Provides an abstract interface to access token specific data from fatd
 * @class
 * @protected
 * @abstract
 */
class BaseTokenCLI {

    /**
     * @constructor
     * @param {CLI} cli - An existing CLI object
     * @param {string} tokenChainId - The Factom chain ID of the token to get the CLI for
     */
    constructor(cli, tokenChainId) {
        if (!(cli instanceof CLI)) throw new Error("Must include an RPc object of type CLI");
        this._cli = cli;

        if (!tokenChainId || tokenChainId.length !== 64) throw new Error("You must include a valid token chain ID to construct BaseTokenCLI");
        this._tokenChainId = tokenChainId;
    }

    /**
     * Get the CLI object that was used to originally construct the BaseTokenCLI
     * @method
     * @returns {CLI}
     */
    getCLI() {
        return this._cli;
    }

    /**
     * Get the Factom token chain ID used to originally construct the BaseTokenCLI
     * @method
     * @returns {string}
     */
    getChainId() {
        return this._tokenChainId;
    }

    /**
     * Get the token's issuance object
     * @method
     * @async
     * @returns {Promise}
     */
    getIssuance() {
        return this._cli.call('get-issuance', generateTokenCLIParams(this));
    }

    /**
     * Get a generic FAT transaction for the token by entryhash
     * @method
     * @async
     * @param {string} entryhash - The Factom entryhash of the transaction to get
     * @returns {Promise}
     */
    getTransaction(entryhash) {
        if (entryhash.length !== 64) throw new Error("You must include a valid 32 Byte tx ID (entryhash)");
        return this._cli.call('get-transaction', generateTokenCLIParams(this, {'entryhash': entryhash}));
    }

    /**
     * Get a set of FAT transactions for the token. Adjust results by parameters
     * @method
     * @async
     * @param {object} params - Get transaction request parameters
     * @param {string[]} [params.addresses] - The list of public Factoid addresses to retrieve transactions for (Address appearing in inputs or outputs)
     * @param {string} [params.entryhash] - The Factom entryhash of the transaction to start the result set at
     * @param {number} [params.limit=25] - The integer limit of number of transactions returned
     * @param {number} [params.page=0] - The page count of the results returned
     * @param {string} [params.order=asc] - The time based sort order of transactions returned. Must be either "asc" or "desc"
     * @returns {Promise}
     */
    getTransactions(params) {
        const validation = Joi.validate(params, getTransactionsSchema);
        if (validation.error) throw new Error('Params validation error - ' + validation.error.details[0].message);
        if (params && params.addresses && !params.addresses.every(fctAddressUtil.isValidPublicFctAddress)) {
            throw new Error("At least one of the Factoid addresses is invalid.");
        }

        return this._cli.call('get-transactions', generateTokenCLIParams(this, params));
    }

    /**
     * Get the numeric balance of a Factoid address on the token. Returned as type BigNumber(https://www.npmjs.com/package/bignumber.js)
     * @method
     * @async
     * @param {string} address - The public Factoid address to get the balance for
     * @returns {Promise}
     */
    async getBalance(address) {
        if (!fctAddressUtil.isValidPublicFctAddress(address)) throw new Error("You must include a valid public Factoid address");
        const balance = await this._cli.call('get-balance', generateTokenCLIParams(this, {address}));
        return new BigNumber(balance);
    }

    /**
     * Get statistics for the token.
     * stats.circulating, stats.burned and stats.transactions are all of type BigNumber(https://www.npmjs.com/package/bignumber.js)
     *
     * @method
     * @async
     * @returns {Promise}
     */
    async getStats() {
        const stats = await this._cli.call('get-stats', generateTokenCLIParams(this));
        stats.circulating = new BigNumber(stats.circulating);
        stats.burned = new BigNumber(stats.burned);
        stats.transactions = new BigNumber(stats.transactions);
        stats.nonzerobalances = new BigNumber(stats.nonzerobalances);
        return stats;
    }

    /**
     * Submit a signed FAT-0/1 Transaction
     * @method
     * @async
     * * @param {Transaction} transaction - The public Factoid address to get the balance for
     * @returns {Promise}
     */
    sendTransaction(transaction) {
        const entry = transaction.getEntry();

        const params = {
            chainid: this._tokenChainId,
            extids: entry.extIdsHex,
            content: entry.content.toString('hex')
        };

        return this._cli.call('send-transaction', generateTokenCLIParams(this, params));
    }
}

/**
 * Generate token RPC call parameters by including Factom token chain ID
 * @method
 * @private
 * * @param {BaseTokenCLI} tokenCLI - The public Factoid address to get the balance for
 * * @param {object} params - The parameters object for the RPC call
 * @returns {object}
 */
function generateTokenCLIParams(tokenCLI, params) {
    return Object.assign({
        'chainid': tokenCLI._tokenChainId
    }, params);
}

module.exports = {
    CLIBuilder,
    BaseTokenCLI,
};

const FAT0CLI = require('../0/CLI').CLI;
const FAT1CLI = require('../1/CLI').CLI;
