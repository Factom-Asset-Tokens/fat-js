const axios = require('axios');
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

    getTokenCLI(tokenChainId) {
        return new BaseTokenCLI(this, tokenChainId);
    }

    getTypedTokenCLI(type, tokenChainId) {
        switch (type) {
            case 'FAT-0': {
                return new FAT0CLI(this, tokenChainId);
            }
            case 'FAT-1': {
                return new FAT1CLI(this, tokenChainId);
            }
            default:
                throw new Error("Unsupported FAT token type " + type);
        }
    }

    getTrackedTokens() {
        return call(this, 'get-daemon-tokens');
    }

    getDaemonProperties() {
        return call(this, 'get-daemon-properties');
    }
}

class BaseTokenCLI {
    constructor(rpc, tokenChainId) {
        if (!(rpc instanceof CLI)) throw new Error("Must include an RPc object of type CLI");
        this._rpc = rpc;

        if (!tokenChainId || tokenChainId.length !== 64) throw new Error("You must include a valid token chain ID to construct BaseTokenCLI");
        this._tokenChainId = tokenChainId;
    }

    getTokenChainId() {
        return this._tokenChainId;
    }

    getIssuance() {
        return call(this._rpc, 'get-issuance', generateTokenCLIParams(this));
    }

    getTransaction(txId) {
        if (txId.length !== 64) throw new Error("You must include a valid 32 Byte tx ID (entryhash)");
        return call(this._rpc, 'get-transaction', generateTokenCLIParams(this, {'entryhash': txId}));
    }

    getTransactions(entryhash, address, page, limit) {
        if (entryhash && entryhash.length !== 32) throw new Error("You must include a valid 32 Byte tx ID (entryhash)");
        if (address && !fctAddressUtil.isValidFctPublicAddress(address)) throw new Error("You must include a valid public Factoid address");
        return call(this._rpc, 'get-transactions', generateTokenCLIParams(this, {
            entryhash,
            address,
            page,
            limit
        }));
    }

    getBalance(address) {
        if (!fctAddressUtil.isValidFctPublicAddress(address)) throw new Error("You must include a valid public Factoid address");
        return call(this._rpc, 'get-balance', generateTokenCLIParams(this, {address}));
    }

    getStats() {
        return call(this._rpc, 'get-stats', generateTokenCLIParams(this));
    }

    sendTransaction(transaction) {
        const entry = transaction.getEntry();

        const params = {
            chainid: this._tokenChainId,
            extids: entry.extIdsHex,
            content: entry.content.toString('hex')
        };

        return call(this._rpc, 'send-transaction', generateTokenCLIParams(this, params));
    }

    getToken(nftokenid) {
        return call(this._rpc, 'get-nf-token', generateTokenCLIParams(this, {nftokenid}));
    }

    getNFBalance(address, page, limit, order) {
        if (!fctAddressUtil.isValidFctPublicAddress(address)) throw new Error("You must include a valid public Factoid address");
        return call(this._rpc, 'get-nf-balance', generateTokenCLIParams(this, {address, page, limit, order}));
    }

    getNFTokens(page, limit, order) {
        return call(this._rpc, 'get-nf-tokens', generateTokenCLIParams(this, {page, limit, order}));
    }
}

function generateTokenCLIParams(tokenRPC, params) {
    return Object.assign({
        'chainid': tokenRPC._tokenChainId
    }, params);
}

async function call(rpc, method, params) {
    if (!(rpc instanceof CLI)) throw new Error("Must include a valid CLI instance to call endpoint");

    const response = await rpc._axios.post('/', {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 10000),
        method: method,
        params: params
    });

    const data = response.data;

    if (data.error !== undefined) throw new Error(JSON.stringify(data.error));

    return data.result;
}

module.exports = {
    CLIBuilder,
    BaseTokenCLI,
};

const FAT0CLI = require('../0/CLI').CLI;
const FAT1CLI = require('../1/CLI').CLI;
