const axios = require('axios');
const fctIdentityUtil = require('factom-identity-lib/src/validation');
const fctAddressUtil = require('factom/src/addresses');

class RPCBuilder {
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

    version(version) {
        this._version = version;
        return this;
    }

    auth(username, password) {
        this._username = username;
        this._password = password;
        return this;
    }

    build() {
        return new RPC(this);
    }
}

class RPC {
    constructor(builder) {
        if (!builder instanceof RPCBuilder) throw new Error("Must include an rpc builder");
        this._host = builder._host || 'localhost';
        this._port = builder._port || 8078;
        this._version = builder._version || 'v0';
        this._username = builder._username;
        this._password = builder._password;
    }

    getTokenRPC(tokenId, rootChainId) {
        return new TokenRPC(this, tokenId, rootChainId);
    }

    async getTrackedTokens() {
        return call(this, 'get-daemon-tokens', generateTokenRPCParams(this));
    }
}

class TokenRPC {
    constructor(rpc, tokenId, rootChainId) {
        if (!rpc instanceof RPC) throw new Error("Must include an RPc object of type RPC");
        this._rpc = rpc;

        if (tokenId === undefined || typeof  tokenId !== 'string') throw new Error('Token is a required string');
        this._tokenId = tokenId;

        if (!fctIdentityUtil.isValidIdentityChainId(rootChainId)) throw new Error("You must include a valid issuer identity Root Chain Id to issue a FAT token");
        this._rootChainId = rootChainId;
    }

    async getIssuance() {
        let response = await call(this._rpc, 'get-issuance', generateTokenRPCParams(this));
        return response.result;
    }

    async getTransaction(txId) {
        if (txId.length !== 32) throw new Error("You must include a valid 32 Byte tx ID (entryhash)");
        let response = await call(this._rpc, 'get-transaction', generateTokenRPCParams(this, {'tx-id': txId}));
        return response.result;
    }

    async getTransactions(txId, fa, start, limit) {
        if (txId !== undefined && txId.length !== 32) throw new Error("You must include a valid 32 Byte tx ID (entryhash)");
        if (!fctAddressUtil.isValidFctPublicAddress(fa)) throw new Error("You must include a valid public Factoid address");
        let response = await call(this._rpc, 'get-transactions', generateTokenRPCParams(this, {
            'tx-id': txId,
            fa: fa,
            start: start,
            limit: limit
        }));
        return response.result;
    }

    async getBalance(fa) {
        if (!fctAddressUtil.isValidFctPublicAddress(fa)) throw new Error("You must include a valid public Factoid address");
        let response = await call(this._rpc, 'get-balance', generateTokenRPCParams(this, {'fa-address': fa}));
        return response.result;
    }

    async getStats() {
        let response = await call(this._rpc, 'get-stats', generateTokenRPCParams(this));
        return response.result;
    }

    //non-fungible
    async getToken(tokenId) {
        let response = await call(this._rpc, 'get-token', generateTokenRPCParams(this, {'nf-id': tokenId}));
        return response.result;
    }
}

function generateTokenRPCParams(tokenRPC, params) {
    return Object.assign({'token-id': tokenRPC._tokenId, 'issuer-id': tokenRPC._rootChainId}, params ? params : {});
}

async function call(rpc, method, params) {
    if (!rpc instanceof RPC) throw new Error("Must include a valid RPC instance to call endpoint");

    //TODO: Basic Auth

    return axios.post('http://' + rpc._host + ':' + rpc._port + '/' + rpc._version, {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 10000),
        method: method,
        params: params
    });
}

module.exports = {
    RPCBuilder,
    RPC,
    TokenRPC
};