const constant = require('../constant');
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

/**
 * The FAT-1 a CLI access object. Used to request data about a FAT-0 token
 * @alias CLI1
 * @class
 * @protected
 * @extends BaseTokenCLI
 */
class CLI extends BaseTokenCLI {
    /**
     * @constructor
     */
    constructor(rpc, tokenChainId) {
        super(rpc, tokenChainId);
    }

    /**
     * Get the issuance for the FAT-1 token, returns a typed FAT-1 Issuance object
     * @method
     * @returns {Promise}
     */
    async getIssuance() {
        const issuance = await super.getIssuance();
        return new Issuance(issuance);
    }

    /**
     * Get a FAT-1 transaction for the token by entryhash
     * @method
     * @async
     * @param {string} entryhash - The Factom entryhash of the transaction to get. Resolves to a FAT-0 Transaction object
     * @returns {Promise}
     */
    async getTransaction(entryhash) {
        const transaction = await super.getTransaction(txId);
        return new Transaction(transaction);
    }

    /**
     * Get a set of FAT-1 transactions for the token. Adjust results by parameters. Resolves to an of array FAT-1 Transaction objects
     * @method
     * @async
     * @param {object} params - Get transaction request parameters
     * @param {string[]} [params.addresses] - The list of public Factoid addresses to retrieve transactions for (Address appearing in inputs or outputs)
     * @param {string} [params.entryhash] - The Factom entryhash of the transaction to start the result set at
     * @param {number} [params.limit=25] - The integer limit of number of transactions returned
     * @param {number} [params.page=0] - The page count of the results returned
     * @param {string} [params.order=asc] - The time based sort order of transactions returned. Must be either "asc" or "desc"
     * @returns {Promise}
     */
    async getTransactions(params) {
        const transactions = await super.getTransactions(params);
        return transactions.map(tx => new Transaction(tx));
    }

    /**
     * Get an individual FAT-1 non-fungible token for the current token
     * @method
     * @async
     * @param {number} nftokenid - The integer non-fungible token ID. 0 -> +inf
     * @returns {Promise}
     */
    getNFToken(nftokenid) {
        return this._cli.call('get-nf-token', generateTokenCLIParams(this, {nftokenid}));
    }

    /**
     * Get the individual non-fungible tokens belonging to a public Factoid address
     * @method
     * @async
     * @param {object} params - The request parameters
     * @param {string} params.address - The public Factoid address to get the nf balance of
     * @param {number} [params.limit=25] - The integer limit of number of transactions returned
     * @param {number} [params.page=0] - The page count of the results returned
     * @returns {Promise}
     */
    getNFBalance(params) {
        const validation = Joi.validate(params, getNFBalanceSchema);
        if (validation.error) throw new Error('Params validation error - ' + validation.error.details[0].message);
        if (!fctAddressUtil.isValidPublicFctAddress(params.address)) throw new Error("You must include a valid public Factoid address");
        return this._cli.call('get-nf-balance', generateTokenCLIParams(this, params));
    }

    /**
     * Get all the currently issued non-fungible tokens on this FAT-1 token
     * @method
     * @async
     * @param {object} [params] - The request parameters
     * @param {number} [params.limit=25] - The integer limit of number of transactions returned
     * @param {number} [params.page=0] - The page count of the results returned
     * @returns {Promise}
     */
    getNFTokens(params) {
        const validation = Joi.validate(params, getNFTokensSchema);
        if (validation.error) throw new Error('Params validation error - ' + validation.error.details[0].message);
        return this._cli.call('get-nf-tokens', generateTokenCLIParams(this, params));
    }

    /**
     * Get the type constant string of this CLI object. For example, "FAT-1"
     * @method
     * @returns {string}
     */
    getType() {
        return constant.FAT1;
    }
}

/**
 * Generate token RPC call parameters by including Factom token chain ID
 * @method
 * @private
 * * @param {BaseTokenCLI} tokenCLI - The public Factoid address to get the balance for
 * * @param {object} params - The parameters object for the RPC call
 * @returns {object}
 */
function generateTokenCLIParams(tokenCLI, params) {
    return Object.assign({
        'chainid': tokenCLI._tokenChainId
    }, params);
}

module.exports = {
    CLI
};
