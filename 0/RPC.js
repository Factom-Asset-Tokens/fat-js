const BaseRPCBuilder = require('../rpc/RPC').RPCBuilder;
const BaseRPC = require('../rpc/RPC').RPC;
const BaseTokenRPC = require('../rpc/RPC').TokenRPC;

const Issuance = require('./Issuance').Issuance;
const Transaction = require('./Transaction').Transaction;

class RPCBuilder extends BaseRPCBuilder {
    constructor(builder) {
        super(builder);
    }

    build() {
        return new RPC(this);
    }
}

class RPC extends BaseRPC {
    constructor(builder) {
        super(builder)
    }

    getTokenRPC(tokenId, rootChainId) {
        return new TokenRPC(this, rootChainId, tokenId);
    }
}

class TokenRPC extends BaseTokenRPC {
    constructor(rpc, rootChainId, tokenId) {
        super(rpc, rootChainId, tokenId);
    }

    async getIssuance() {
        let issuance = await super.getIssuance();
        return new Issuance(issuance);
    }


    async getTransaction(txId) {
        let transaction = await super.getTransaction(txId);
        return new Transaction(transaction);
    }

    async getTransactions(txId, fa, start, limit) {
        let transactions = await super.getTransactions(txId, fa, start, limit);
        return transactions.map(tx => new Transaction(tx));
    }
}

module.exports = {
    RPCBuilder,
    RPC
};