/*
*
*
*   Abstract Base FAT class
*
*   timestamp = djb2a(<tokenId>) + random int
*   Can be faked by chosing "random" int such that another tokenIds djb2a - "random int" = other tokenId
*
*
*
*/

const util = require('../util');
const crypto = require('crypto');
const aes256 = require('aes256');

const aesKey = 'ifjkwnfu487348fn3mu4f298m3fm23f923mfn23bf';

const BloomFilter = require('bloomfilter').BloomFilter;
const fctAddressUtils = require('factom/src/addresses');
const fctIdentityCrypto = require('factom-identity-lib/src/crypto');
const fctIdentityUtil = require('factom-identity-lib/src/validation');

const {FactomCli} = require('factom');
const async = require("async");

//TEMP CONFIG

class BaseFAT {
    constructor(tokenId, factomParams) {
        if (new.target === BaseFAT) throw new TypeError("Cannot construct Abstract Class BaseFAT directly");

        this._assetId = tokenId;

        //hack for private methods, sidesteppable :( Waiting for https://github.com/tc39/proposal-private-methods
        this._secret = {id: crypto.randomBytes(64).toString('hex')};

        //FATIP-100 Implementation
        this._issuanceChainId = util.getIssuanceChainId(tokenId);
        this._transactionChainId = util.getTransactionChainId(tokenId);

        //As per FATIP-0 Implementaion Guidelines
        this._signatureFilter = new BloomFilter(
            32 * 256, // number of bits to allocate.
            30        // number of hash functions.
        );

        //base info
        this._balances = {};
        this._circulatingSupply = 0;

        if (factomParams) {
            this._factomParams = factomParams;
            this._cli = new FactomCli(factomParams);
        }

        else this._cli = new FactomCli({
            factomd: {
                host: 'localhost',
                port: 8088
            }
        });

        return init(this); //initial async setup to run once
    }

    //core methods
    parseIssuance(issuanceEntry) {
        try {
            let issuance = parse(issuanceEntry);
            if (!this.validateIssuance(issuance)) return false;
            return issuance;
        } catch (e) {
            return false;
        }
    }

    parseTransaction(transactionEntry) {
        try {
            let tx = parse(transactionEntry);
            if (!this.validateTransaction(tx)) return false;
            return tx;
        } catch (e) {
            return false;
        }
    }

    validateIssuance(issuance) { //FATIP-101 Implementation
        if (!issuance.issuer || !fctIdentityUtil.isValidIdentityChainId(issuance.issuer)) return false;
        if (!issuance.salt || !issuance.idNonce || !issuance.idSignature) return false;

        // if (issuance.salt !== fctIdentityCrypto.sha256d(this._assetId + issuance.salt)) return false; //salt validation

        if (this._signatureFilter.test(issuance.idSignature) || !fctIdentityCrypto.verify(Buffer.from(this._idKey, 'hex'), Buffer.from(issuance.idNonce, 'hex'), Buffer.from(issuance.idSignature, 'hex'))) return false;

        return issuance;
    }

    //abstract methods
    validateTransaction(transaction) {
        throw new Error('Must implement abstract method validateTransaction');
    }

    applyTransaction(secret, transaction, simulate) {
        if (secret !== this._secret) throw new Error('applyTransaction is private');
        if (!this.validateTransaction(transaction)) throw new Error('transaction validation failed');
    }


    sendTransaction(fromPrivate, toPublic, amount, ES) {
        throw new Error('Must implement abstract method sendTransaction');
    }

    //getters
    getBalance(address, defaultValue) {
        if (defaultValue === undefined) throw new Error('Must define defaultValue for getBalance');
        return this._balances[address] ? this._balances[address] : defaultValue
    }

    getBalances() {
        return this._balances
    }

    getTransactions() {
        return Array.from(this._transactions);
    }

    getTransactionsOfAddress(address) {
        return this._transactions.filter(tx => tx.input.address === address || tx.output.address === address);
    }

    getTransaction(entryHash) {
        return this._transactions.reverse().find(tx => tx.entryHash === entryHash);
    }

    getIssuances() {
        return Array.from(this._issuances);
    }

    getIssuance() {
        return Object.freeze(Object.assign({}, this._issuance));
    }

    getStats() {
        let issuance = this.getIssuance();
        return {
            supply: issuance.supply,
            circulatingSupply: this._circulatingSupply,
            transactionCount: this._transactions.length,
            issuanceTimestamp: issuance.timestamp
        }
    }

    sendTransaction(fromPrivate, toPublic, amount, ES) {
        throw new Error('Must implement abstract method sendTransaction');
    }

    //event listeners
    on(event, callback) {
        switch (event) {
            case 'transactions': {
                if (callback) transactionCallbacks.add(callback);
                break;
            }
        }
    };

    //cleanup/other
    close() {
        util.getFactomdCache().close();
    }

    static generateTransaction() {
        throw new Error('Must implement private abstract method generateTransaction');
    }

    static sendTransaction(tokenId, fromPrivate, toPublic, amount, ES) {
        throw new Error('Must implement abstract static method sendTransaction');
    }

    static async issue(issuanceParams) {

    }

    //utilities
    static stringify(data) { //reciprocal of parse()
        return aes256.encrypt(aesKey, JSON.stringify(data))
    }
}


function parse(entry) {
    try {
        let entryHash = entry.hash().toString('hex');
        let timestamp = entry.blockContext.entryTimestamp;
        let data = JSON.parse(aes256.decrypt(aesKey, entry.content.toString()));
        data.entryHash = entryHash;
        data.timestamp = timestamp;
        return data
    } catch (e) {
        return false;
    }
}

let transactionCallbacks = new Set();

function emitEvent(event, data) {
    transactionCallbacks.forEach(function (callback) {
        switch (event) {
            case 'transactions': {
                callback(data);
                break;
            }
        }
    });

}

//private token initialization function
async function init(self) {
    let issuanceEntries = await self._cli.getAllEntriesOfChain(self._issuanceChainId);
    let issuanceEntry = parse(issuanceEntries[0]);

    //get the issuer's digital identity rootId from issuance entry
    self._identity = await util.getFactomIdentityManager().getIdentityInformation(issuanceEntry.issuer);

    //check preimage is found and correct
    let identityEntries = await self._cli.getAllEntriesOfChain(issuanceEntry.issuer);
    self._idKey = identityEntries[1].extIdsHex[3];

    //issuance validation
    if (!self.validateIssuance(issuanceEntry)) throw new Error('Token Issuance was invalid!');
    self._issuance = issuanceEntry;

    issuanceEntries.shift();

    //get all issuance entries and validate them cryptographically
    self._issuances = await new Promise((resolve, reject) => {
        async.reduce(issuanceEntries, [], function (results, issuanceEntry, callback) {
            const issuance = self.parseIssuance(issuanceEntry);
            if (issuance) results.push(issuance);
            callback(null, results)
        }, function (err, results) {
            if (err) {
                reject(err);
                return;
            }
            resolve(results)
        });
    });
    self._issuances.unshift(issuanceEntry);

    let transactions = await util.getFactomdCache().cacheChain(self._transactionChainId);
    self._transactions = await new Promise((resolve, reject) => {
        async.reduce(transactions, [], function (results, tx, callback) {
            tx = self.parseTransaction(tx);
            if (tx && self.applyTransaction(this._secret, tx)) results.push(tx);
            callback(null, results)
        }, function (err, results) {
            if (err) {
                reject(err);
                return;
            }
            resolve(results)
        });
    });

    //listen for new transactions, fire events
    util.getFactomdCache().on('new-entries', self._transactionChainId, function (transactionEntries) {

        transactionEntries = transactionEntries.filter(function (tx) {
            tx = parse(tx);
            tx.timetamp = Math.floor(new Date().getTime() / 1000);
            if (!tx) return false;
            return self.applyTransaction(self._secret, tx);
        });

        transactionEntries = transactionEntries.map(transactionEntry => parse(transactionEntry));

        if (transactionEntries.length > 0) {
            self._transactions = self._transactions.concat(transactionEntries);
            emitEvent('transactions', transactionEntries);
        }
    });

    return self;
}


module.exports.FAT = BaseFAT;