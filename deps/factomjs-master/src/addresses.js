const base58 = require('base-58'),
    {RCD_TYPE_1, sha256d} = require('./util');

const {
    FACTOID_PUBLIC_PREFIX,
    VALID_PREFIXES,
} = require('./constant');

function isValidAddress(address) {
    try {
        if (!VALID_PREFIXES.has(address.slice(0, 2))) {
            return false;
        }

        const bytes = Buffer.from(base58.decode(address));
        if (bytes.length !== 38) {
            return false;
        }

        const checksum = sha256d(bytes.slice(0, 34)).slice(0, 4);
        if (checksum.equals(bytes.slice(34, 38))) {
            return true;
        }

        return false;
    } catch (err) {
        return false;
    }
}


function isValidFctPublicAddress(address) {
    return isValidAddress(address) && address.substring(0, 2) === 'FA';
}

function keyToRCD1(key) {
    return sha256d(Buffer.concat([RCD_TYPE_1, key]));
}

function addressToRcd(address) {
    if (!isValidFctPublicAddress(address)) {
        throw new Error(`Address ${address} is not a valid public Factoid address`);
    }
    return Buffer.from(base58.decode(address).slice(2, 34));
}

function keyToAddress(key, prefix, computeRCD) {
    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== 32) {
        throw new Error(`Key ${keyBuffer} is not 32 bytes long.`);
    }

    const address = Buffer.concat([prefix, computeRCD ? keyToRCD1(keyBuffer) : keyBuffer]);
    const checksum = sha256d(address).slice(0, 4);
    return base58.encode(Buffer.concat([address, checksum]));
}

function keyToPublicFctAddress(key) {
    return keyToAddress(key, FACTOID_PUBLIC_PREFIX, true);
}

module.exports = {
    addressToRcd,
    keyToPublicFctAddress,
};