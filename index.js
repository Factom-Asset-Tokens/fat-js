module.exports = Object.assign({},
    require('./cli/CLI'),
    {
        FAT0: {
            Transaction: require('./0/Transaction'),
            Issuance: require('./0/Issuance')
        },
        FAT1: {
            Transaction: require('./1/Transaction'),
            Issuance: require('./1/Issuance')
        }
    }
);