module.exports = Object.assign({},
    require('./cli/CLI'),
    {
        FAT0: {
            TransactionBuilder: require('./0/TransactionBuilder'),
            Transaction: require('./0/Transaction'),
            Issuance: require('./0/Issuance')
        },
        FAT1: {
            TransactionBuilder: require('./1/TransactionBuilder'),
            Transaction: require('./1/Transaction'),
            Issuance: require('./1/Issuance')
        }
    }
);