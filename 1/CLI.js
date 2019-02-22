const fctAddressUtil = require('factom/src/addresses');
const Joi = require('joi-browser');

const Transaction = require('./Transaction').Transaction;
const Issuance = require('./Issuance').Issuance;
const BaseTokenCLI = require('../cli/CLI').BaseTokenCLI;

const getNFBalanceSchema = Joi.object().keys({
    address: Joi.string().length(52).required(),
    page: Joi.number().integer().min(0),
    limit: Joi.number().integer().min(0),
    order: Joi.string().valid(['asc', 'desc']),
});

const getNFTokensSchema = Joi.object().keys({
    page: Joi.number().integer().min(0),
    limit: Joi.number().integer().min(0),
    order: Joi.string().valid(['asc', 'desc']),
});

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

    async getTransactions(params) {
        const transactions = await super.getTransactions(params);
        return transactions.map(tx => new Transaction(tx));
    }

    getNFToken(nftokenid) {
        return this._cli.call('get-nf-token', generateTokenCLIParams(this, {nftokenid}));
    }

    getNFBalance(params) {
        const validation = Joi.validate(params, getNFBalanceSchema);
        if (validation.error) throw new Error('Params validation error - ' + validation.error.details[0].message);
        if (!fctAddressUtil.isValidPublicFctAddress(params.address)) throw new Error("You must include a valid public Factoid address");
        return this._cli.call('get-nf-balance', generateTokenCLIParams(this, params));
    }

    getNFTokens(params) {
        const validation = Joi.validate(params, getNFTokensSchema);
        if (validation.error) throw new Error('Params validation error - ' + validation.error.details[0].message);
        return this._cli.call('get-nf-tokens', generateTokenCLIParams(this, params));
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
