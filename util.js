const aes256 = require('aes256');
const aesKey = 'ifjkwnfu487348fn3mu4f298m3fm23f923mfn23bf';

const fctIdentityUtils = require('factom-identity-lib/src/crypto');

const {FactomCli} = require('factom');

const {Entry} = require('factom/src/entry');
const {Chain} = require('factom/src/chain');

const {FactomIdentityManager} = require('factom-identity-lib');

const {FactomdCache} = require('factomd-cache');

const factomCrypto = require('factom-identity-lib/src/crypto');

module.exports.getIssuanceChainId = function (tokenId) {
    return new Chain(Entry.builder()
        .extId(new Buffer(tokenId))
        .build()).id.toString('hex')
};

module.exports.getIssuanceChainExtId = function (tokenId) {
    return new Buffer(tokenId)
};

module.exports.getTransactionChainId = function (tokenId) {
    return new Chain(Entry.builder()
        .extId(new Buffer(tokenId + ':transactions'))
        .build()).id.toString('hex')
};

module.exports.getTransactionChainExtId = function (tokenId) {
    return new Buffer(tokenId + ':transactions')
};

module.exports.getIdentityKeyFromSK1 = function (sk1) {
    return factomCrypto.sha256d(Buffer.concat([Buffer.from('01', 'hex'), factomCrypto.privateKeyToPublicKey(factomCrypto.extractSecretFromIdentityKey(sk1))]))
};

module.exports.getFactomCli = function (factomParams) {
    if (factomParams) return new FactomCli(factomParams);
    else return new FactomCli();
};

module.exports.getFactomIdentityManager = function (factomParams) {
    if (factomParams) return new FactomIdentityManager(factomParams);
    else return new FactomIdentityManager();
};


module.exports.getFactomdCache = function (factomParams) {
    if (factomParams) return new FactomdCache({factomdParams: factomParams});
    else return new FactomdCache();
};


const min = 10000000000000;
const max = 99999999999999;
module.exports.getNonceInt = function getNonceInt() {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.getTokenType = async function (tokenId, factomParams) {
    let issuanceEntry = await module.exports.getFactomCli(factomParams).getFirstEntry(module.exports.getIssuanceChainId(tokenId));

    issuanceEntry = JSON.parse(aes256.decrypt(aesKey, issuanceEntry.content.toString()));

    if (!validateFATIssuanceFields(issuanceEntry)) throw new Error('Issuance entry was invalid!(this is not a FAT token)')

    let identity = await module.exports.getFactomIdentityManager(factomParams).getIdentityInformation(issuanceEntry.issuer);

    if (!identity) throw new Error('Identity not found by root chiain ID');

    return issuanceEntry.type;
};

//basic validation to enforce field inclusion
function validateFATIssuanceFields(issuance) {
    return issuance.issuer !== undefined &&
        issuance.type !== undefined
}


