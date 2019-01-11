const {Entry} = require('factom/src/entry');
const {Chain} = require('factom/src/chain');

//See FATIP-100 Chain ID Derivation Standard
module.exports.getTokenChainId = function (tokenId, rootChainId) {
    return new Chain(Entry.builder()
        .extId(Buffer.from("token"))
        .extId(Buffer.from(tokenId))
        .extId(Buffer.from("issuer"))
        .extId(Buffer.from(rootChainId, 'hex'))
        .build()).idHex
};


