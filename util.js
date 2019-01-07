
const {Entry} = require('factom/src/entry');
const {Chain} = require('factom/src/chain');


const factomCrypto = require('factom-identity-lib/src/crypto');

//See FATIP-100 Chain ID Derivation Standard
module.exports.getIssuanceChainId = function (tokenId, rootChainId) {
    return new Chain(Entry.builder()
        .extId(Buffer.from("token"))
        .extId(Buffer.from(tokenId))
        .extId(Buffer.from("issuer"))
        .extId(Buffer.from(rootChainId, 'hex'))
        .build()).idHex
};

module.exports.getIdentityKeyFromSK1 = function (sk1) {
    return factomCrypto.sha256d(Buffer.concat([Buffer.from('01', 'hex'), factomCrypto.privateKeyToPublicKey(factomCrypto.extractSecretFromIdentityKey(sk1))]))
};



