const axios = require('axios');
const fctIdentityUtil = require('factom-identity-lib/src/validation');
const fctAddressUtil = require('factom/src/addresses');

class CLIBuilder {
    constructor(builder) {

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

    build() {
        return new CLI(this);
    }
}

class CLI {
    constructor(builder) {
        if (!builder instanceof CLIBuilder) throw new Error("Must include an cli builder");
        this._host = builder._host || 'localhost';
        this._port = builder._port || 8078;
        this._username = builder._username;
        this._password = builder._password;
    }

    getTokenRPC(tokenId, rootChainId) {
        return new BaseTokenCLI(this, tokenId, rootChainId);
    }

    getTypedTokenRPC(type, tokenId, rootChainId) {
        switch (type) {
            case 'FAT-0': {
                return new FAT0TokenCLI(this, tokenId, rootChainId);
            }
            default:
                throw new Error("Unsupported FAT token type " + type);
        }
    }

    getTrackedTokens() {
        return call(this, 'get-daemon-tokens');
    }

    getVersion() {
        return call(this, 'version');
    }
}

class BaseTokenCLI {
    constructor(rpc, tokenId, rootChainId) {
        if (!rpc instanceof CLI) throw new Error("Must include an RPc object of type CLI");
        this._rpc = rpc;

        if (tokenId === undefined || typeof  tokenId !== 'string') throw new Error('Token is a required string');
        this._tokenId = tokenId;

        if (!fctIdentityUtil.isValidIdentityChainId(rootChainId)) throw new Error("You must include a valid issuer identity Root Chain Id construct BaseTokenCLI");
        this._rootChainId = rootChainId;
    }

    getIssuance() {
        return call(this._rpc, 'get-issuance', generateTokenCLIParams(this));
    }

    getTransaction(txId) {
        if (txId.length !== 64) throw new Error("You must include a valid 32 Byte tx ID (entryhash)");
        return call(this._rpc, 'get-transaction', generateTokenCLIParams(this, {'tx-id': txId}));
    }

    getTransactions(txId, fa, start, limit) {
        if (txId && txId.length !== 32) throw new Error("You must include a valid 32 Byte tx ID (entryhash)");
        if (fa && !fctAddressUtil.isValidFctPublicAddress(fa)) throw new Error("You must include a valid public Factoid address");
        return call(this._rpc, 'get-transactions', generateTokenCLIParams(this, {
            'tx-id': txId,
            'fa-address': fa,
            start: start,
            limit: limit
        }));
    }

    getBalance(fa) {
        if (!fctAddressUtil.isValidFctPublicAddress(fa)) throw new Error("You must include a valid public Factoid address");
        return call(this._rpc, 'get-balance', generateTokenCLIParams(this, {'fa-address': fa}));
    }

    getStats() {
        return call(this._rpc, 'get-stats', generateTokenCLIParams(this));
    }

    //non-fungible
    getToken(tokenId) {
        return call(this._rpc, 'get-token', generateTokenCLIParams(this, {'nf-token-id': tokenId}));
    }
}

//Token Specific Token RPCs (Optional, wraps response in class from corresponding token type)
let FAT0Transaction = require('../0/Transaction').Transaction;
let FAT0Issuance = require('../0/Issuance').Issuance;

class FAT0TokenCLI extends BaseTokenCLI {
    constructor(rpc, rootChainId, tokenId) {
        super(rpc, rootChainId, tokenId);
    }

    async getIssuance() {
        let issuance = await super.getIssuance();
        return new FAT0Issuance(issuance);
    }

    async getTransaction(txId) {
        let transaction = await super.getTransaction(txId);
        return new FAT0Transaction(transaction);
    }

    async getTransactions(txId, fa, start, limit) {
        let transactions = await super.getTransactions(txId, fa, start, limit);
        return transactions.map(tx => new FAT0Transaction(tx));
    }
}


function generateTokenCLIParams(tokenRPC, params) {
    return Object.assign({
        'token-id': tokenRPC._tokenId,
        'issuer-id': tokenRPC._rootChainId
    }, params);
}

async function call(rpc, method, params) {
    if (!rpc instanceof CLI) throw new Error("Must include a valid CLI instance to call endpoint");

    //TODO: Basic HTTP Auth

    let response = await axios.post('http://' + rpc._host + ':' + rpc._port + '/v1', {
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
    BaseTokenCLI
};
