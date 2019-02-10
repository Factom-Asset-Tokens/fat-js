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

module.exports.reduceNFIds = function (ids) {
    const ranges = [];
    let min, max;
    for (let i = 0; i < ids.length; i++) {
        min = ids[i];
        max = min;
        while (ids[i + 1] - ids[i] === 1) {
            max = ids[i + 1]; // increment the index if sequential
            i++;
        }
        ranges.push(min === max ? min : {min, max});
    }
    return ranges;
};

module.exports.expandNFIds = function (ids) {
    let expanded = [];
    ids.forEach((id) =>
        typeof id === 'object' ? expanded = expanded.concat(Array(id.max - id.min + 1).fill().map((element, index) => id.min + index)) : expanded.push(id));
    return expanded;
};

module.exports.countNFIds = function (ids) {
    let count = 0;
    ids.forEach((id) =>
        typeof id === 'object' ? count += (id.max - id.min) + 1 : count += 1);
    return count;
};


