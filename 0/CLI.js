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

    async getTransactions(entryhash, address, page, limit, order) {
        const transactions = await super.getTransactions(entryhash, address, page, limit, order);
        return transactions.map(tx => new Transaction(tx));
    }

    getType() {
        return 'FAT-0';
    }
}

module.exports = {
    CLI
};
