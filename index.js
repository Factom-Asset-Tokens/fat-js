module.exports = Object.assign({},
    require('./cli/CLI'),
    {
        FAT0: {
            Transaction: require('./0/Transaction'),
            Issuance: require('./0/Issuance')
        }
    }
);