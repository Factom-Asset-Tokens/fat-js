const constant = require('../constant');
const Transaction = require('./Transaction');
const Issuance = require('./Issuance');

const BaseTokenCLI = require('../cli/CLI').BaseTokenCLI;

/**
 * The FAT-0 CLI access object. Used to request data about a FAT-0 token
 * @alias CLI0
 * @class
 * @extends BaseTokenCLI
 * @protected
 * @example
 * const tokenCLI = await cli.getTokenCLI('013de826902b7d075f00101649ca4fa7b49b5157cba736b2ca90f67e2ad6e8ec');
 * const transaction = await tokenCLI.getTransaction('d9b6ca250c97fdbe48eb3972a7d4b906aac54f2048982acfcb6019bc2a018be9');
 */
class CLI extends BaseTokenCLI {
    /**
     * @constructor
     */
    constructor(rpc, tokenChainId) {
        super(rpc, tokenChainId);
    }

    /**
     * Get the issuance for the FAT-0 token, returns a typed FAT-0 Issuance object
     * @method
     * @returns {Promise}
     */
    async getIssuance() {
        const issuance = await super.getIssuance();
        return new Issuance(issuance);
    }

    /**
     * Get a FAT-0 transaction for the token by entryhash
     * @method
     * @async
     * @param {string} entryhash - The Factom entryhash of the transaction to get. Resolves to a FAT-0 Transaction object
     * @returns {Promise}
     */
    async getTransaction(entryhash) {
        const transaction = await super.getTransaction(entryhash);
        return new Transaction(transaction);
    }

    /**
     * Get a set of FAT-1 transactions for the token. Adjust results by parameters. Resolves to an of array FAT-0 Transaction objects
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
     * Get the type constant string of this CLI object. In this case, "FAT-0"
     * @method
     * @returns {string}
     */
    getType() {
        return constant.FAT0;
    }
}

module.exports = {
    CLI
};
