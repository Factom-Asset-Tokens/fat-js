
const {Entry} = require('factom/src/entry');
const {Chain} = require('factom/src/chain');


const factomCrypto = require('factom-identity-lib/src/crypto');

//See FATIP-100 Chain ID Derivation Standard
module.exports.getIssuanceChainId = function (tokenId, issuerId) {
    return new Chain(Entry.builder()
        .extId(new Buffer("token"))
        .extId(new Buffer(tokenId))
        .extId(new Buffer("issuer"))
        .extId(new Buffer(issuerId))
        .build()).id.toString('hex')
};

module.exports.getTransactionChainId = function (tokenId, issuerId) {
    return new Chain(Entry.builder()
        .extId(new Buffer("token"))
        .extId(new Buffer(tokenId))
        .extId(new Buffer("issuer"))
        .extId(new Buffer(issuerId))
        .extId(new Buffer("transactions"))
        .build()).id.toString('hex')
};

module.exports.getIdentityKeyFromSK1 = function (sk1) {
    return factomCrypto.sha256d(Buffer.concat([Buffer.from('01', 'hex'), factomCrypto.privateKeyToPublicKey(factomCrypto.extractSecretFromIdentityKey(sk1))]))
};



