//Token Specific Token RPCs (Optional, wraps response in class from corresponding token type)
const Transaction = require('./Transaction').Transaction;
const Issuance = require('./Issuance').Issuance;

const BaseTokenCLI = require('../cli/CLI').BaseTokenCLI;

class CLI extends BaseTokenCLI {
    constructor(rpc, tokenChainId) {
        super(rpc, tokenChainId);
    }

    async getIssuance() {
        const issuance = await super.getIssuance();
        return new Issuance(issuance);
    }

    async getTransaction(txId) {
        const transaction = await super.getTransaction(txId);
        return new Transaction(transaction);
    }

    async getTransactions(txId, address, start, limit) {
        const transactions = await super.getTransactions(txId, address, start, limit);
        return transactions.map(tx => new Transaction(tx));
    }
}

module.exports = {
    CLI
};
