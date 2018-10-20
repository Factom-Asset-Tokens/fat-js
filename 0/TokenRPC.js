const BaseTokenRPC = require('../rpc/RPC').TokenRPC;

const Issuance = require('./Issuance').Issuance;
const Transaction = require('./Transaction').Transaction;

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
    TokenRPC
};