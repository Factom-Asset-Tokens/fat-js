const axios = require('axios');
const fctIdentityUtil = require('factom-identity-lib/src/validation');
const fctAddressUtil = require('factom/src/addresses');

const FAT0TokenRPC = require('../0/TokenRPC');

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
        this._username = builder._username;
        this._password = builder._password;
    }

    getTokenRPC(tokenId, rootChainId) {
        return new BaseTokenRPC(this, tokenId, rootChainId);
    }

    getTypedTokenRPC(type, tokenId, rootChainId) {
        switch (type) {
            case 'FAT-0': {
                return new FAT0TokenRPC(this, tokenId, rootChainId);
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

class BaseTokenRPC {
    constructor(rpc, tokenId, rootChainId) {
        if (!rpc instanceof RPC) throw new Error("Must include an RPc object of type RPC");
        this._rpc = rpc;

        if (tokenId === undefined || typeof  tokenId !== 'string') throw new Error('Token is a required string');
        this._tokenId = tokenId;

        if (!fctIdentityUtil.isValidIdentityChainId(rootChainId)) throw new Error("You must include a valid issuer identity Root Chain Id construct BaseTokenRPC");
        this._rootChainId = rootChainId;
    }

    getIssuance() {
        return call(this._rpc, 'get-issuance', generateTokenRPCParams(this));
    }

    getTransaction(txId) {
        if (txId.length !== 64) throw new Error("You must include a valid 32 Byte tx ID (entryhash)");
        return call(this._rpc, 'get-transaction', generateTokenRPCParams(this, {'tx-id': txId}));
    }

    getTransactions(txId, fa, start, limit) {
        if (txId && txId.length !== 32) throw new Error("You must include a valid 32 Byte tx ID (entryhash)");
        if (fa && !fctAddressUtil.isValidFctPublicAddress(fa)) throw new Error("You must include a valid public Factoid address");
        return call(this._rpc, 'get-transactions', generateTokenRPCParams(this, {
            'tx-id': txId,
            'fa-address': fa,
            start: start,
            limit: limit
        }));
    }

    getBalance(fa) {
        if (!fctAddressUtil.isValidFctPublicAddress(fa)) throw new Error("You must include a valid public Factoid address");
        return call(this._rpc, 'get-balance', generateTokenRPCParams(this, {'fa-address': fa}));
    }

    getStats() {
        return call(this._rpc, 'get-stats', generateTokenRPCParams(this));
    }

    //non-fungible
    getToken(tokenId) {
        return call(this._rpc, 'get-token', generateTokenRPCParams(this, {'nf-token-id': tokenId}));
    }
}

function generateTokenRPCParams(tokenRPC, params) {
    return Object.assign({
        'token-id': tokenRPC._tokenId,
        'issuer-id': tokenRPC._rootChainId
    }, params);
}

async function call(rpc, method, params) {
    if (!rpc instanceof RPC) throw new Error("Must include a valid RPC instance to call endpoint");

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
    RPCBuilder,
    RPC,
    TokenRPC: BaseTokenRPC
};