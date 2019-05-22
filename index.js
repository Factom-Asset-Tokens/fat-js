module.exports = Object.assign({},
    require('./cli/CLI'),
    {
        FAT0: {
            TransactionBuilder: require('./0/TransactionBuilder'),
            Transaction: require('./0/Transaction'),
            IssuanceBuilder: require('./0/IssuanceBuilder'),
            Issuance: require('./0/Issuance')
        },
        FAT1: {
            TransactionBuilder: require('./1/TransactionBuilder'),
            Transaction: require('./1/Transaction'),
            IssuanceBuilder: require('./1/IssuanceBuilder'),
            Issuance: require('./1/Issuance')
        }
    }
);