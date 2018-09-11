const util = require('../util');


const crypto = require('crypto');
const djb2a = require('djb2a');


const {FAT} = require('../fat/BaseFAT');
const TransactionUtil = require('../deps/factomjs-master/src/transaction');
const fctIdentityUtils = require('factom-identity-lib/src/crypto');
const fctAddressUtils = require('factom/src/addresses');

const {Entry} = require('factom/src/entry');
const {Chain} = require('factom/src/chain');

const {Transaction} = require('factom');

const {FAT0IssuanceBuilder} = require('./FAT0IssuanceBuilder');

class FAT0 extends FAT {

    constructor(tokenId, factomParams) {
        super(tokenId, factomParams);
        this._type = 'FAT-0';
    }

    //validation
    validateIssuance(issuance) {
        if (this._issuance) return false; //FAT-0 only allows 1 issuance entry, so reject if we already have it

        issuance = super.validateIssuance(issuance); //base validation from super (FATIP-101)
        if (!issuance) return false;

        //FAT0 Specific validation:
        if (issuance.type !== 'FAT-0') return false;

        if (isNaN(issuance.supply)) return false;
        if (!issuance.supply > 0) return false;

        this._issuance = issuance; //set initial FATIP-0 issuance
        return issuance;
    }

    validateTransaction(transaction) {
        try {
            if (!transaction) return false;

            //validate the nonce for this token's transaction type
            if (transaction.txSalt === undefined) throw new Error('No TX salt included');
            let expectedNonce = djb2a(this._assetId + transaction.txSalt);
            if (transaction.txNonce !== expectedNonce) throw new Error('Invalid nonce for this token');

            //Validate the transaction:
            //validate the RCD for the transaction
            TransactionUtil.validateRcd(transaction.input, Buffer.from(transaction.rcd, 'hex'));

            //calculate the expected marshalled binary signature from the input
            let calculatedMarshalledBinarySig = TransactionUtil.marshalBinarySig(transaction.txNonce, [new TransactionUtil.TransactionAddress(transaction.input.address, transaction.input.amount)], [new TransactionUtil.TransactionAddress(transaction.output.address, transaction.output.amount)], []);
            // console.log('Calculated binary sig: ' + calcBinSig.toString('hex'));

            //check that the expected signature matches the marshalled one with the transaction
            if (calculatedMarshalledBinarySig.toString('hex') !== transaction.marshalBinarySig) throw new Error('Marshalled sig was not valid!');

            //validate the marshalled binary signature for this transaction
            TransactionUtil.validateSignature(transaction.marshalBinarySig, Buffer.from(transaction.rcd, 'hex'), Buffer.from(transaction.signature, 'hex'));

            //coinbase tx validation
            if (transaction.input.address === fctAddressUtils.getPublicAddress('Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj').toString('hex')) { //this is a coinbase tx
                //validate the identity's signature
                if (!fctIdentityUtils.verify(Buffer.from(this._idKey, 'hex'), Buffer.from(transaction.idNonce, 'hex'), Buffer.from(transaction.idSignature, 'hex'))) throw new Error('Coinbase TX Identity Signature invalid');
            }
            return transaction;
        } catch (e) {
            return false;
        }
    }

    applyTransaction(secret, transaction, simulate) {
        // super.applyTransaction(this._secret, transaction);

        if (!this.validateTransaction(transaction)) return false;

        try {
            //check tx uniqueness among others in this asset
            if (this._signatureFilter.test(transaction.signature)) return false; //this is a duplicate transaction (sad face)

            //check if this is a coinbase tx (from all zeroes private key)
            //all zeroes is this token's burn address with a known private key. It can not send transactions other than those signed by the issuing identity.
            // Tokens sent here are verifiably unspendable
            if (transaction.input.address === fctAddressUtils.getPublicAddress('Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj').toString('hex')) { //this is a coinbase tx

                if (!this._idKey) return false; //cant apply a tx if we're not synced yet

                //calculate and validate nonce

                //validate the identity's signature
                if (!fctIdentityUtils.verify(Buffer.from(this._idKey, 'hex'), Buffer.from(transaction.idNonce, 'hex'), Buffer.from(transaction.idSignature, 'hex'))) throw new Error('Coinbase TX Identity Signature invalid');

                if (this._circulatingSupply + transaction.input.amount > this._issuance.supply) return false; //if the issuance pushes the token over max supply, it's invalid

                if (!simulate) {
                    this._circulatingSupply += transaction.input.amount;
                    this._signatureFilter.add(transaction.idSignature);
                }
            } else { //otherwise it's a normal transaction
                //check balance of the input address is at least amount, since we're about to deduct amount from it
                if (!this._balances[transaction.input.address] || this._balances[transaction.input.amount] < transaction.input.amount) return false;

                //deduct amount from the input address
                if (!simulate) this._balances[transaction.input.address] -= transaction.input.amount;
            }

            //initialize or increment value to the output address by amount
            if (!simulate) {
                this._balances[transaction.output.address] ? this._balances[transaction.output.address] += transaction.input.amount : this._balances[transaction.output.address] = transaction.input.amount;

                //add the tx ID to the filter
                this._signatureFilter.add(transaction.signature);
            }

            return transaction;
        } catch (e) {
            // console.error(e);
            return false;
        }
    }

    //generation
    static generateTransaction(tokenId, fromPrivate, toPublic, amount) {
        if (!fromPrivate || !fctAddressUtils.isValidFctPrivateAddress(fromPrivate)) throw new Error("You must specify a valid private FCT Address to sign the transaction");
        if (!toPublic || !fctAddressUtils.isValidFctPublicAddress(toPublic)) throw new Error("You must specify a valid public FCT Address to transfer to");

        if (!amount) throw new Error("You must specify a value");
        if (isNaN(amount)) throw new Error("You must specify a value that is a number");
        if (amount < 0) throw new Error("You must specify a value greater than or equal to 0");

        //limit tx amount to 10 decimal places
        amount = parseFloat(amount.toFixed(10));

        const txSalt = util.getNonceInt();
        const txNonce = djb2a(tokenId + txSalt);

        const transaction = Transaction.builder()
            .input(fromPrivate, amount)
            .output(toPublic, amount)
            .timestamp(txNonce) //nonce instead of actual timestamp
            .build();

        //validate the inputs and outputs
        TransactionUtil.validateRcds(transaction.inputs, transaction.rcds);
        TransactionUtil.validateSignatures(transaction.marshalBinarySig, transaction.rcds, transaction.signatures);

        return {
            //take the single input and output + rcd from the Factoid transaction
            input: {
                address: transaction.inputs[0].address.toString('hex'),
                // rcdHash: transaction.inputs[0].rcdHash.toString('hex'),
                amount: transaction.inputs[0].amount
            },
            output: {
                address: transaction.factoidOutputs[0].address.toString('hex'),
                amount: transaction.factoidOutputs[0].amount
            },
            rcd: transaction.rcds[0].toString('hex'),
            txSalt: txSalt,
            txNonce: txNonce,
            marshalBinarySig: transaction.marshalBinarySig.toString('hex'),
            signature: transaction.signatures[0].toString('hex')
        };
    }


    //getters
    getBalance(address) {
        return super.getBalance(address, 0);
    }

    getStats() {
        let stats = super.getStats(); //base stats

        //add extra info, 24hr volume, etc
        return stats;
    }

    //write methods
    static async issue(issuanceBuilder, ES, factomParams) {
        if (!issuanceBuilder instanceof FAT0IssuanceBuilder) throw new Error('First parmeter must be issuance builder')

        let issuanceParams = issuanceBuilder.build();

        const tokenId = issuanceParams.tokenId;
        if (!tokenId) {
            throw new Error('Must include token ID');
        }

        if (typeof tokenId !== 'string') {
            throw new Error('Must include token ID String');
        }

        //check if the token has already been issued
        const issuanceExists = await util.getFactomCli(factomParams).chainExists(util.getIssuanceChainId(tokenId));
        const transactionsExists = await util.getFactomCli(factomParams).chainExists(util.getTransactionChainId(tokenId));

        if (issuanceExists || transactionsExists) {
            throw new Error('Token ' + tokenId + ' has already been issued, or there was an chain ID collision');
        }

        //required fields
        if (!issuanceParams.rootChainId) throw new Error('rootChainId is required');
        if (!issuanceParams.sk1) throw new Error('sk1 is required');
        if (!issuanceParams.supply) throw new Error('supply is required');
        if (isNaN(issuanceParams.supply)) throw new Error('isssuance must be a number');
        if (issuanceParams.supply <= 0) throw new Error('supply must be > 0');
        issuanceParams.supply = parseFloat(issuanceParams.supply.toFixed(10)); //limit supply to 10 decimal places

        //validate coinbase address if exists
        if (issuanceParams.coinbaseTransactionAddress && !fctAddressUtils.isValidFctPublicAddress(issuanceParams.coinbaseTransactionAddress)) throw new Error("Supplied genesis address is not a valid public Factoid genesisAddress");
        if (issuanceParams.coinbaseTransactionValue) {
            if (isNaN(issuanceParams.coinbaseTransactionValue)) throw new Error("Coinbase tx value must be a number");
            if (issuanceParams.coinbaseTransactionValue <= 0) throw new Error("Coinbase tx value must be > 0");
            if (issuanceParams.coinbaseTransactionValue > issuanceParams.supply) throw new Error("Coinbase tx value must be <= supply");
        }

        //check digital identity exists
        let identity = await util.getFactomIdentityManager(factomParams).getIdentityInformation(issuanceParams.rootChainId);
        let identityEntries = await util.getFactomCli(factomParams).getAllEntriesOfChain(issuanceParams.rootChainId);

        if (!identity) throw new Error('Identity with root ID ' + issuanceParams.rootChainId + ' does not exist');

        const identityKey = util.getIdentityKeyFromSK1(issuanceParams.sk1);

        //check that the SK1 key supplied matches up with an ID key of the identity
        if (!identity.identityKeys.includes(identityKey.toString('hex'))) throw new Error('This private key did not belong to the specified identity');

        //setup crypto
        const secret = fctIdentityUtils.extractSecretFromIdentityKey(issuanceParams.sk1);

        let salt = crypto.randomBytes(32);
        let idNonce = fctIdentityUtils.sha256d(tokenId + salt);
        let idSignature = fctIdentityUtils.sign(secret, idNonce);

        //check preimage is found and correct
        let idKeyPreimage = identityEntries[1].extIdsHex[3];
        if (idKeyPreimage !== idSignature.identityKeyPreImage.toString('hex')) throw new Error('Identity Key Preimage Not Found/Invalid');

        if (!fctIdentityUtils.verify(idSignature.identityKeyPreImage, idNonce, idSignature.signature)) throw new Error('Issuance tx sig invalid!!');

        //Prepare the issuance chain's first entry
        const issuanceEntryContent = {
            //issuance information
            type: 'FAT-0',
            issuer: issuanceParams.rootChainId,
            supply: issuanceParams.supply,

            name: issuanceParams.name,
            symbol: issuanceParams.symbol,
            metadata: issuanceParams.metadata,

            //crypto
            salt: salt.toString('hex'),
            idNonce: idNonce.toString('hex'),
            idSignature: idSignature.signature.toString('hex'),
        };

        const issuanceContentString = super.stringify(issuanceEntryContent);
        const issuanceEntry = Entry.builder()
            .extId(util.getIssuanceChainExtId(tokenId)) // If no encoding parameter is passed 'hex' is used
            .content(new Buffer(issuanceContentString))
            .build();

        const issuanceChain = new Chain(issuanceEntry);


        //Prepare the transaction chain's first entry
        salt = crypto.randomBytes(32);
        idNonce = fctIdentityUtils.sha256d(tokenId + issuanceParams.coinbaseTransactionAddress, issuanceParams.supply + salt);
        idSignature = fctIdentityUtils.sign(secret, idNonce);

        //attempt to validate
        if (!fctIdentityUtils.verify(idSignature.identityKeyPreImage, idNonce, idSignature.signature)) throw new Error('Issuance tx sig invalid!!');

        //coinbase TX is from all zeroes private factoid address (064780000000000000000000000000000000000000000000000000000000000000000)
        //issue an initial specified amount up to the supply, or a 0 value tx by default.
        const coinbaseTx = this.generateTransaction(tokenId, 'Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj', issuanceParams.coinbaseTransactionAddress ? issuanceParams.coinbaseTransactionAddress : 'FA1y5ZGuHSLmf2TqNf6hVMkPiNGyQpQDTFJvDLRkKQaoPo4bmbgu', issuanceParams.coinbaseTransactionValue ? issuanceParams.coinbaseTransactionValue : 0);

        //add issuance information, since this is a coinbase tx
        coinbaseTx.salt = salt.toString('hex');
        coinbaseTx.idNonce = idNonce.toString('hex');
        coinbaseTx.idSignature = idSignature.signature.toString('hex');

        coinbaseTx.metadata = issuanceParams.metadata;

        const coinbaseTxContentString = super.stringify(coinbaseTx);

        const coinbaseTxEntry = Entry.builder()
            .extId(util.getTransactionChainExtId(tokenId)) // If no encoding parameter is passed 'hex' is used
            .content(new Buffer(coinbaseTxContentString))
            .build();

        const txChain = new Chain(coinbaseTxEntry);

        //add the chains
        let chains = await Promise.all([util.getFactomCli(factomParams).addChain(issuanceChain, ES), util.getFactomCli(factomParams).addChain(txChain, ES)]);

        //add entry hashes
        issuanceEntryContent.entryHash = chains[0].entryHash;
        coinbaseTx.entryHash = chains[1].entryHash;

        return {issuanceEntry: issuanceEntryContent, coinbaseTx: coinbaseTx}
    }

    async sendTransaction(fromPrivate, toPublic, amount, ES) {
        return await FAT0.sendTransaction(this._assetId, fromPrivate, toPublic, amount, ES, this._factomParams);
    };

    static async sendTransaction(tokenId, fromPrivate, toPublic, amount, ES, factomParams) {
        let tx = FAT0.generateTransaction(tokenId, fromPrivate, toPublic, amount);

        const transactionContentString = FAT.stringify(tx);

        const transactionEntry = Entry.builder()
            .chainId(util.getTransactionChainId(tokenId), 'hex')
            .extId(new Buffer(new Date().getTime() + ''))
            .content(transactionContentString, 'utf-8')
            .build();

        // console.log('Transfering ' + amount + ' tokens to ' + toPublic + '...');
        let txEntry = await util.getFactomCli(factomParams).addEntry(transactionEntry, ES);
        tx.entryHash = txEntry.entryHash.toString('hex');
        tx.timestamp = new Date().getTime();
        return tx;
    }
}

module.exports.FAT0 = FAT0;
module.exports.FAT0.IssuanceBuilder = FAT0IssuanceBuilder;