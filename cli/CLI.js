const constant = require('../constant');
const axios = require('axios');
const JSONBig = require('json-bigint')({strict: true});
const Joi = require('joi-browser').extend(require('joi-factom'));
const fctAddressUtil = require('factom/src/addresses');
const compatibility = require('./compatibility');

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
    }

    /**
     * Set the host information for connection to fatd
     * @method
     * @param {string} host - The host string of where the fatd RPC host can be found
     * @returns {CLIBuilder}
     */
    host(host) {
        //TODO: Host string validation
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
    }

    /**
     * Build the CLI
     * @method
     * @returns {CLI}
     */
    build() {
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

        if (this._username && !this._password || this._password && !this._username) throw new Error('Must specify both username and password to use RPC authentication');

        this._timeout = builder._timeout || 5000;

        this._axios = axios.create({
            baseURL: 'http://' + this._host + ':' + this._port + '/v1',
            timeout: this._timeout,
            auth: (this._username && this._password) ? {username: this._username, password: this._password} : undefined
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

        const response = await this._axios.post(
            '/',
            {
                jsonrpc: '2.0',
                id: Math.floor(Math.random() * 10000),
                method: method,
                params: params
            },
            {
                transformResponse: [data => JSONBig.parse(data)]
            }
        );

        compatibility.checkVersion(response.headers['fatd-version']);

        const data = response.data;
        if (data.error !== undefined) throw new Error(JSON.stringify(data.error));

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
    getTokenChainId() {
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
     * Get the balance of a Factoid address on the token
     * @method
     * @async
     * @param {string} address - The public Factoid address to get the balance for
     * @returns {Promise}
     */
    getBalance(address) {
        if (!fctAddressUtil.isValidPublicFctAddress(address)) throw new Error("You must include a valid public Factoid address");
        return this._cli.call('get-balance', generateTokenCLIParams(this, {address}));
    }

    /**
     * Get statistics for the token
     * @method
     * @async
     * @returns {Promise}
     */
    getStats() {
        return this._cli.call('get-stats', generateTokenCLIParams(this));
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
