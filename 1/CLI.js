const fctAddressUtil = require('factom/src/addresses');

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

    getNFToken(nftokenid) {
        return this._cli.call('get-nf-token', generateTokenCLIParams(this, {nftokenid}));
    }

    getNFBalance(address, page, limit, order) {
        if (!fctAddressUtil.isValidPublicFctAddress(address)) throw new Error("You must include a valid public Factoid address");
        return this._cli.call('get-nf-balance', generateTokenCLIParams(this, {address, page, limit, order}));
    }

    getNFTokens(page, limit, order) {
        return this._cli.call('get-nf-tokens', generateTokenCLIParams(this, {page, limit, order}));
    }

    getType() {
        return 'FAT-1';
    }
}

function generateTokenCLIParams(tokenRPC, params) {
    return Object.assign({
        'chainid': tokenRPC._tokenChainId
    }, params);
}

module.exports = {
    CLI
};
