const EdDSA = require('elliptic').eddsa,
    base58 = require('base-58'),
    {encodeVarInt, sha256d} = require('./util'),
    {addressToRcd} = require('./addresses');

const ec = new EdDSA('ed25519');

class TransactionAddress {
    constructor(address, amount) {
        this.address = address;
        this.amount = amount;
        Object.freeze(this);
    }

    marshalBinary() {
        return Buffer.concat([encodeVarInt(this.amount), Buffer.from(base58.decode(this.address).slice(2, 34))]);
    }
}

function marshalBinarySig(timestamp, inputs, factoidOutputs, entryCreditOutputs) {

    const header = Buffer.alloc(10);
    header.writeInt8(2);
    header.writeIntBE(timestamp, 1, 6);
    header.writeInt8(inputs.length, 7);
    header.writeInt8(factoidOutputs.length, 8);
    header.writeInt8(entryCreditOutputs.length, 9);

    const marshalledInput = inputs.map(address => address.marshalBinary());
    const marshalledFactoidOutputs = factoidOutputs.map(address => address.marshalBinary());
    const marshalledEntryCreditOutputs = entryCreditOutputs.map(address => address.marshalBinary());

    return Buffer.concat([
        header,
        ...marshalledInput,
        ...marshalledFactoidOutputs,
        ...marshalledEntryCreditOutputs
    ]);
}

function validateRcds(inputs, rcds) {
    if (rcds.length !== inputs.length) {
        throw new Error(`The number of RCDs (${rcds.length}) does not equal the number of inputs (${inputs.length})`);
    }
    for (let i = 0; i < rcds.length; ++i) {
        validateRcd(inputs[i], rcds[i]);
    }
}

function validateRcd(input, rcd) {
    if (!sha256d(rcd).equals(addressToRcd(input.address))) {
        throw new Error(`RCD does not match the RCD hash from input address ${input.address}`);
    }
}

function validateSignatures(data, rcds, signatures) {
    if (rcds.length !== signatures.length) {
        throw new Error(`The number of RCDs (${rcds.length}) does not equal the number of signatures (${signatures.length})`);
    }
    for (let i = 0; i < signatures.length; ++i) {
        validateSignature(data, rcds[i], signatures[i]);
    }
}

function validateSignature(data, rcd, signature) {
    if (rcd[0] !== 1) {
        throw new Error(`Only RCD type 1 is currently supported. Invalid RCD: ${rcd}`);
    }

    const publicKey = [...Buffer.from(rcd, 1)].slice(1);
    const key = ec.keyFromPublic(publicKey);

    if (!key.verify(data, [...signature])) {
        throw new Error('Signature of Transaction is invalid');
    }
}

module.exports = {
    validateRcd,
    validateRcds,
    validateSignature,
    validateSignatures,
    marshalBinarySig,
    TransactionAddress,
};