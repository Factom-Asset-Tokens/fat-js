const util = require('../util');

const crypto = require('crypto');
const djb2a = require('djb2a');

const {FAT} = require('../fat/BaseFAT');
const BloomFilter = require('bloomfilter').BloomFilter;
const TransactionUtil = require('../deps/factomjs-master/src/transaction');
const fctIdentityUtils = require('factom-identity-lib/src/crypto');
const fctAddressUtils = require('factom/src/addresses');

const {Entry} = require('factom/src/entry');
const {Chain} = require('factom/src/chain');

const {Transaction} = require('factom');

const {FAT1IssuanceBuilder} = require('./FAT1IssuanceBuilder');

class FAT1 extends FAT {

    constructor(tokenId) {
        super(tokenId);
        this._type = 'FAT-1';
        if (!this._tokenIdFilter) this._tokenIdFilter = new BloomFilter(
            32 * 256, // number of bits to allocate.
            30        // number of hash functions.
        );
    }

    //validation
    validateIssuance(issuance) {
        if (!this._tokenIdFilter) this._tokenIdFilter = new BloomFilter(
            32 * 256, // number of bits to allocate.
            30        // number of hash functions.
        );

        try {

            let idKey = this._idKey;
            let tokenIdFilter = this._tokenIdFilter;
            super.validateIssuance(issuance);

            if (!this._issuance && issuance.type !== 'FAT-1') return false;

            //validate each token in the issuance
            let validTokens = issuance.tokens.filter(function (token) {

                //validate the token issuance crypto
                if (!fctIdentityUtils.verify(Buffer.from(idKey, 'hex'), Buffer.from(token.idNonce, 'hex'), Buffer.from(token.idSignature, 'hex'))) return false;

                //validate nonce, check that the calculated matches the expected
                //nonce = sha256d(asset Id + tokenId + medtadataString|'' + salt)
                // let expectedNonce = fctIdentityUtils.sha256d(assetID + token.id + ((token.metadata && Object.keys(token.metadata).length > 0) ? JSON.stringify(token.metadata) : '') + token.idSalt);

                // if (expectedNonce !== token.idNonce) throw new Error("Token failed expected nonce test");

                //check for uniqueness

                if (tokenIdFilter.test(token.id)) return false; //token has already been issued

                // tokenIdFilter.add(token.id);
                // this._signatureFilter.add(token.idSignature);
                return true;
            });
            if (validTokens.length !== issuance.tokens.length) return false; //if all the tokens in this issuance are valid, this is a valid issuance
            return issuance;
        } catch (e) {
            console.error(e);
            return false;
        }
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

            //token ID hash verification
            let expectedTokenIdHashInt = djb2a(JSON.stringify(transaction.tokenIds));
            if (transaction.input.amount !== expectedTokenIdHashInt || transaction.output.amount !== expectedTokenIdHashInt) throw new Error('Expected integer hash of token Ids did not match with tokenIds');


            // console.log(fctAddressUtils.getPublicAddress('Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj').toString('hex'));
            // console.log(transaction.input.address);


            //coinbase tx validation
            if (transaction.input.address === fctAddressUtils.getPublicAddress('Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj').toString('hex')) { //this is a coinbase tx
                //validate the identity's signature
                if (!fctIdentityUtils.verify(Buffer.from(this._idKey, 'hex'), Buffer.from(transaction.idNonce, 'hex'), Buffer.from(transaction.idSignature, 'hex'))) throw new Error('Coinbase TX Identity Signature invalid');
            }

            return transaction;
        } catch (e) {
            // console.error(e);
            return false;
        }
    }

    applyTransaction(secret, transaction, simulate) {
        if (!this.validateTransaction(transaction)) return false;
        // super.applyTransaction(this._secret, transaction);

        let _issuances = this._issuances;
        try {
            //check tx uniqueness among others in this asset

            //MOVE ABOVE
            if (this._signatureFilter.test(transaction.signature)) return false; //this is a duplicate transaction (sad face)

            //check all tokens in the TX are issued and in circulation
            const tokenInCirculation = transaction.tokenIds.every(function (tokenId) {

                //find a token in an issuace
                return (_issuances.find(function (issuance) {

                    //where the issuance's tokens has a token with the tokens id and a timestamp before or equal to the transaction
                    return issuance.tokens.find(function (token) {

                        return tokenId === token.id && issuance.timestamp <= transaction.timestamp
                    });
                }));
            });

            if (!tokenInCirculation) return false;

            //check if this is a coinbase tx (from all zeroes private key)
            //all zeroes is this token's burn address with a known private key. It can not send transactions other than those signed by the issuing identity.
            // Tokens sent here are verifiably unspendable
            if (transaction.input.address === fctAddressUtils.getPublicAddress('Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj').toString('hex')) { //this is a coinbase tx

                if (!this._idKey) return false; //cant apply a tx if we're not synced yet

                //calculate and validate salt

                //validate the identity's signature
                if (!fctIdentityUtils.verify(Buffer.from(this._idKey, 'hex'), Buffer.from(transaction.idNonce, 'hex'), Buffer.from(transaction.idSignature, 'hex'))) throw new Error('Coinbase TX Identity Signature invalid');

                if (this._circulatingSupply + transaction.tokenIds.length > this._issuance.supply) return false; //if the issuance pushes the token over max supply, it's invalid

                if (!simulate) {
                    this._circulatingSupply += transaction.input.amount;
                    this._signatureFilter.add(transaction.idSignature);
                }
            } else { //otherwise it's a normal transaction

                //check balance of the input address contains all the tokens in the tx, since we're about to deduct them from it
                if (!this._balances[transaction.input.address] || !this._balances[transaction.input.address].every(function (tokenId) {
                    return transaction.tokenIds.includes(tokenId);
                })) return false;

                //deduct the tokens from the input address

                //do the deduction
                if (!simulate) {
                    this._balances[transaction.input.address] = this._balances[transaction.input.address].filter(function (tokenId) {
                        return !transaction.tokenIds.includes(tokenId);
                    });

                    //if the input address has no balance then delete the key to save space
                    if (this._balances[transaction.input.address].length === 0) delete this._balances[transaction.input.address];
                }
            }

            //initialize or increment value to the output address by amount
            if (!simulate) {
                this._balances[transaction.output.address] ? this._balances[transaction.output.address].concat(transaction.tokenIds) : this._balances[transaction.output.address] = transaction.tokenIds;

                //add the tx signature to the filter
                this._signatureFilter.add(transaction.signature);
            }

            return transaction;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    //generation
    static generateTransaction(tokenId, fromPrivate, toPublic, tokenIds) {
        if (!fromPrivate || !fctAddressUtils.isValidFctPrivateAddress(fromPrivate)) throw new Error("You must specify a valid private FCT Address to sign the transaction");
        if (!toPublic || !fctAddressUtils.isValidFctPublicAddress(toPublic)) throw new Error("You must specify a valid public FCT Address to transfer to");

        if (!tokenIds) throw new Error("amount(TokenIDS) must be an array must specify a value");
        if (!Array.isArray(tokenIds)) throw new Error("You must specify tokenIds to send");

        //limit tx amount to 10 decimal places
        let amount = djb2a(JSON.stringify(tokenIds));

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

        //validate the tx
        // if (!this.validateTransaction(tx)) throw new Error('Generated an Invalid Transaction');

        // tx.input.rcdHash = transaction.inputs[0].rcdHash.toString('hex'); //lolwut investigate if we can avoid needing this

        return {
            //take the single input and output + rcd from the Factoid transaction
            input: {
                address: transaction.inputs[0].address.toString('hex'),
                // rcdHash: transaction.inputs[0].rcdHash.toString('hex'),
                amount: transaction.inputs[0].amount
            },
            output: {
                address: transaction.factoidOutputs[0].address.toString('hex'),
                // rcdHash: transaction.factoidOutputs[0].rcdHash.toString('hex'),
                amount: transaction.factoidOutputs[0].amount
            },
            rcd: transaction.rcds[0].toString('hex'),
            marshalBinarySig: transaction.marshalBinarySig.toString('hex'),
            signature: transaction.signatures[0].toString('hex'),
            txSalt: txSalt,
            txNonce: txNonce,
            tokenIds: tokenIds,
        };
    }

    //getters
    getBalance(address) {
        return super.getBalance(address, []);
    }

    getStats() {
        let stats = super.getStats(); //base stats

        //add extra info, 24hr volume, etc
        return stats;
    }


    //write methods
    static async issue(issuanceBuilder, ES, factomParams) {
        if (!issuanceBuilder instanceof FAT1IssuanceBuilder) throw new Error('First parameter must be issuance builder');

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
        // if (issuanceParams.coinbaseTransactionValue) {
        // if (isNaN(issuanceParams.coinbaseTransactionValue)) throw new Error("Coinbase tx value must be a number");
        // if (issuanceParams.coinbaseTransactionValue <= 0) throw new Error("Coinbase tx value must be > 0");
        // if (issuanceParams.coinbaseTransactionValue > issuanceParams.supply) throw new Error("Coinbase tx value must be <= supply");
        // }

        //check digital identity exists
        let identity = await util.getFactomIdentityManager().getIdentityInformation(issuanceParams.rootChainId);
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

        //handle tokens
        var tokenIds = new Set();

        issuanceParams.tokens.forEach(function (token) {
            if (!token.id || typeof token.id !== 'string' || !token.id instanceof String || tokenIds.has(token.id)) throw new Error('Each token being issued must have a unique ID string that is defined')

            let salt = crypto.randomBytes(32);

            //idNonce = sha256d(asset Id + tokenId + medtadataString|'' + salt)
            let tokenIdNonce = fctIdentityUtils.sha256d(tokenId + token.id + (token.metadata ? JSON.stringify(token.metadata) : '') + salt);
            let tokenIdSignature = fctIdentityUtils.sign(secret, tokenIdNonce);

            token.salt = salt.toString('hex');
            token.idNonce = tokenIdNonce.toString('hex');
            token.idSignature = tokenIdSignature.signature.toString('hex');

            //verify
            if (!fctIdentityUtils.verify(tokenIdSignature.identityKeyPreImage, tokenIdNonce, tokenIdSignature.signature)) throw new Error('Token issuance signature verification failed!!');

            tokenIds.add(token.id);
        });

        //Prepare the issuance chain's first entry
        const issuanceEntryContent = {
            //issuance information
            type: 'FAT-1',
            issuer: issuanceParams.rootChainId,
            supply: issuanceParams.supply,

            name: issuanceParams.name,
            symbol: issuanceParams.symbol,
            metadata: issuanceParams.metadata,

            tokens: issuanceParams.tokens,

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
        const coinbaseTx = this.generateTransaction(tokenId, 'Fs1KWJrpLdfucvmYwN2nWrwepLn8ercpMbzXshd1g8zyhKXLVLWj', issuanceParams.coinbaseTransactionAddress ? issuanceParams.coinbaseTransactionAddress : 'FA1y5ZGuHSLmf2TqNf6hVMkPiNGyQpQDTFJvDLRkKQaoPo4bmbgu', issuanceParams.coinbaseTransactionValue ? issuanceParams.coinbaseTransactionValue : []);

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
        const chains = await Promise.all([util.getFactomCli(factomParams).addChain(issuanceChain, ES), util.getFactomCli(factomParams).addChain(txChain, ES)]);

        //add entry hashes
        issuanceEntryContent.entryHash = chains[0].entryHash;
        coinbaseTx.entryHash = chains[1].entryHash;

        return {issuanceEntry: issuanceEntryContent, coinbaseTx: coinbaseTx}
    }

    async sendTransaction(fromPrivate, toPublic, tokenIds, ES) {
        return await FAT1.sendTransaction(this._assetId, fromPrivate, toPublic, tokenIds, ES, this._factomParams);
    };

    static async sendTransaction(tokenId, fromPrivate, toPublic, tokenIds, ES, factomParams) {
        const tx = FAT1.generateTransaction(tokenId, fromPrivate, toPublic, tokenIds);

        const transactionContentString = FAT.stringify(tx);

        const transactionEntry = Entry.builder()
            .chainId(util.getTransactionChainId(tokenId), 'hex')
            .extId(new Buffer(new Date().getTime() + ''))
            .content(transactionContentString, 'utf-8')
            .build();

        // console.log('Transfering ' + amount + ' tokens to ' + toPublic + '...');
        let txEntry = await util.getFactomCli(factomParams).addEntry(transactionEntry, ES);
        tx.entryHash = txEntry.entryHash.toString('hex');
        tx.timestamp = new Date().getTime() / 1000;
        return tx;
    }
}

module.exports.FAT1 = FAT1;
module.exports.FAT1.IssuanceBuilder = FAT1IssuanceBuilder;