const constant = require('../constant');
const axios = require('axios');
const JSONBig = require('json-bigint')({strict: true});
const Joi = require('joi-browser');
const fctAddressUtil = require('factom/src/addresses');

class CLIBuilder {
    constructor() {
    }

    host(host) {
        //TODO: Host string validation
        this._host = host;
        return this;
    }

    port(port) {
        if (isNaN(port) || !Number.isInteger(port) || port < 0) throw new Error("Port must be an integer >= 0");
        this._port = port;
        return this;
    }

    auth(username, password) {
        this._username = username;
        this._password = password;
        return this;
    }

    //
    timeout(timeout) {
        this._timeout = timeout;
    }

    build() {
        return new CLI(this);
    }
}


class CLI {
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

        const data = response.data;

        if (data.error !== undefined) throw new Error(JSON.stringify(data.error));

        return data.result;
    }

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

    getTrackedTokens() {
        return this.call('get-daemon-tokens');
    }

    getDaemonProperties() {
        return this.call('get-daemon-properties');
    }

    getSyncStatus() {
        return this.call('get-sync-status');
    }
}

const getTransactionsSchema = Joi.object().keys({
    entryhash: Joi.string().length(64),
    addresses: Joi.array().items(Joi.string().length(52)),
    page: Joi.number().integer().min(0),
    limit: Joi.number().integer().min(0),
    order: Joi.string().valid(['asc', 'desc']),
});

class BaseTokenCLI {
    constructor(cli, tokenChainId) {
        if (!(cli instanceof CLI)) throw new Error("Must include an RPc object of type CLI");
        this._cli = cli;

        if (!tokenChainId || tokenChainId.length !== 64) throw new Error("You must include a valid token chain ID to construct BaseTokenCLI");
        this._tokenChainId = tokenChainId;
    }

    getCLI() {
        return this._cli;
    }

    getTokenChainId() {
        return this._tokenChainId;
    }

    getIssuance() {
        return this._cli.call('get-issuance', generateTokenCLIParams(this));
    }

    getTransaction(txId) {
        if (txId.length !== 64) throw new Error("You must include a valid 32 Byte tx ID (entryhash)");
        return this._cli.call('get-transaction', generateTokenCLIParams(this, {'entryhash': txId}));
    }

    getTransactions(params) {
        const validation = Joi.validate(params, getTransactionsSchema);
        if (validation.error) throw new Error('Params validation error - ' + validation.error.details[0].message);
        if (params && params.addresses && !params.addresses.every(fctAddressUtil.isValidPublicFctAddress)) {
            throw new Error("At least one of the Factoid addresses is invalid.");
        }

        return this._cli.call('get-transactions', generateTokenCLIParams(this, params));
    }

    getBalance(address) {
        if (!fctAddressUtil.isValidPublicFctAddress(address)) throw new Error("You must include a valid public Factoid address");
        return this._cli.call('get-balance', generateTokenCLIParams(this, {address}));
    }

    getStats() {
        return this._cli.call('get-stats', generateTokenCLIParams(this));
    }

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

function generateTokenCLIParams(tokenRPC, params) {
    return Object.assign({
        'chainid': tokenRPC._tokenChainId
    }, params);
}

module.exports = {
    CLIBuilder,
    BaseTokenCLI,
};

const FAT0CLI = require('../0/CLI').CLI;
const FAT1CLI = require('../1/CLI').CLI;
