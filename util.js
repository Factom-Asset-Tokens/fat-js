const { Entry } = require('factom/src/entry');
const { Chain } = require('factom/src/chain');
const base58 = require('base-58');
const { sha256d } = require('factom-identity-lib/src/crypto');
const { IDENTITY_KEY_HEX_PREFIX_MAP } = require('factom-identity-lib/src/constant');
const fctIdentityCrypto = require('factom-identity-lib/src/crypto');

/**
 * @module util
 */

/**
 * Get token chain ID from token ID and issuer root chain ID. See FATIP-100 Chain ID Derivation Standard
 * @method
 * @static
 * @param {string} tokenId - The token ID string of the token
 * @param {string} rootChainId - The Factom chain ID of the token issuer's identity chain
 * @returns {string} - The calculated Factom chain ID of the token
 * @example
 * const chainId = util.getTokenChainId('mytoken', '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584').toString('hex')
 *
 * //=> 0dce2c10a51a7df92e2e9e4f848da054509ff9761311bd58ebcc55df656fb409
 */
module.exports.getTokenChainId = function (tokenId, rootChainId) {
    return new Chain(Entry.builder()
        .extId(Buffer.from("token"))
        .extId(Buffer.from(tokenId))
        .extId(Buffer.from("issuer"))
        .extId(Buffer.from(rootChainId, 'hex'))
        .build()).idHex
};

/**
 * Take an array of integers representing NF token IDs and group them into ID ranges
 * @method
 * @static
 * @param {string} ids - The Factom chain ID of the token issuer's identity chain
 * @returns {string} - The Factom chain ID of the token
 * @example
 * const ranges = util.reduceNFIds([0, 1, 2, 5, 99, 100, 101, 102])
 *
 *\/\*
 *[
 *{
 *  "min": 0,
 *  "max": 2
 *},
 *5,
 *{
 *  "min": 99,
 *  "max": 102
 *}
 *]
 \*\/
 */
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
        ranges.push(min === max ? min : { min, max });
    }
    return ranges;
};

/**
 * Take an array of ID ranges representing NF token IDs expand them into an array of integers
 * @method
 * @static
 * @param {string} ids - The Factom chain ID of the token issuer's identity chain
 * @returns {string} - The Factom chain ID of the token
 * @example
 * const numbers = util.expandNFIds([{min: 0, max: 3}, 5, 9])
 *
 *\/*
 *[
 *0,
 *1,
 *2,
 *3,
 *5,
 *9
 *]
 *\/
 *
 */
module.exports.expandNFIds = function (ids) {
    return ids.reduce(function (expanded, id) {
        if (typeof id === 'object') {
            expanded = expanded.concat(Array(id.max - id.min + 1).fill(id.min).map((element, index) => element + index))
        } else {
            expanded.push(id)
        }
        return expanded;
    }, []);
};

/**
 * Take an array of integers representing NF token IDs and group them into ID ranges
 * @method
 * @static
 * @param {string} ids - The Factom chain ID of the token issuer's identity chain
 * @returns {string} - The Factom chain ID of the token
 * @example
 * const numbers = util.expandNFIds([{min: 0, max: 3}, 5, 9])
 *
 *\/*
 *[
 *0,
 *1,
 *2,
 *3,
 *5,
 *9
 *]
 *\/
 *
 */
module.exports.countNFIds = function (ids) {
    return ids.reduce((count, id) =>
        typeof id === 'object' ? count + (id.max - id.min) + 1 : count + 1, 0);
};

/**
 * Take an array of integers representing NF token IDs and group them into ID ranges
 * @method
 * @static
 * @param {string} ids - The Factom chain ID of the token issuer's identity chain
 * @returns {string} - The Factom chain ID of the token
 * @example
 * let valid = util.validateNFIds([0, 1, 2, {min: 3, max: 3}, {min: 4, max: 100}]);
 *
 * \/\*
 * => true
 * \*\/
 *
 * valid = util.validateNFIds([0, 1, 2, -3]); //negative ID
 * valid = util.validateNFIds([0, 1, 2, {min: 3, max: 2}]); //min > max
 * valid = util.validateNFIds([0, 1, 2, {min: 3, abc: 4}]); //malformed range or int
 * valid = util.validateNFIds([0, 1, 2, {min: 3, max: 2}]); //min < max
 * valid = util.validateNFIds([0, 1, 2, {min: 3, max: 3}, {min: 3, max: 4}]); //overlapping range

 \/*
 => false
 *\/
 */
module.exports.validateNFIds = function (ids) {
    return Array.isArray(ids) && ids.length > 0 && ids.every(isValidNFIdRepresentation) && hasNoDuplicatedNFId(ids);
};


/**
 * @method Method to create the public identity address
 * @param {string} id1 - The 'idX' prefix to generate the address
 * @returns {string} encoded base58 identity address.
 */
module.exports.createPublicIdentityAddr = function (prefix, idpk)
{
    let addr = Buffer.concat([Buffer.from(IDENTITY_KEY_HEX_PREFIX_MAP[prefix],'hex'),Buffer.from(idpk,'hex')]);

    if (addr.length !== 35) {
        throw Error("Invalid public key provided");
    }

    return base58.encode(Buffer.concat([addr, fctIdentityCrypto.sha256d(addr).slice(0, 4)]));
}


/**
 * @method Method to extract the public key from a public identity address
 * @param {string} id1 - The ID1 public key string of the issuing identity
 * @returns {Buffer} The buffer of the raw public key
 */
module.exports.extractIdentityPublicKey = function (id1) {
    if (!isValidId1(id1)) {
        throw new Error("You must include a valid ID1 Key to map to an external signature");
    }

    //extract the identity public
    let hexKey;

    // Need to be decoded if human readable format
    if (id1.slice(0, 2) === 'id') {
        hexKey = Buffer.from(base58.decode(id1));
    } else {
        hexKey = Buffer.from(key, 'hex');
    }

    //return the public key
    return Buffer.from(hexKey.slice(3, 35));
}

/**
 * @method Method to verify the public identity address
 * @param {string} id1 - The ID1 public key string of the issuing identity
 * @returns {bool} returs true if key is a valid public key
 */
function isValidId1(key) {
    prefix = 'id1'
    if (typeof key !== 'string') {
        return false;
    }

    let bytes;
    if (key.slice(0, 3) === prefix) {
        bytes = Buffer.from(base58.decode(key));
    } else if (key.slice(0, 6) === IDENTITY_KEY_HEX_PREFIX_MAP[prefix]) {
        bytes = Buffer.from(key, 'hex');
    } else {
        return false;
    }

    if (bytes.length !== 39) {
        return false;
    }

    const checksum = sha256d(bytes.slice(0, 35)).slice(0, 4);
    if (checksum.equals(bytes.slice(35, 39))) {
        return true;
    }

    return false;
}

function isValidNFIdRepresentation(id) {
    return Number.isInteger(id) || (typeof id === 'object' && Number.isInteger(id.min) && Number.isInteger(id.max) && id.max >= id.min && Object.keys(id).length === 2)
}

function hasNoDuplicatedNFId(ids) {
    const expanded = module.exports.expandNFIds(ids);
    return new Set(expanded).size === expanded.length;
}

module.exports.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}