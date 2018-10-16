module.exports = {
    RPCBuilder: require('./rpc/RPC').RPCBuilder,
    FAT0: {
        RPCBuilder: require('./0/RPC'), //FAT-0 specific type casting
        Transaction: require('./0/Transaction').Transaction,
        TransactionBuilder: require('./0/Transaction').TransactionBuilder,
        Issuance: require('./0/Issuance').Issuance,
        IssuanceBuilder: require('./0/Issuance').IssuanceBuilder,
    }
};