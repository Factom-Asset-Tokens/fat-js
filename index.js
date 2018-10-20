module.exports = Object.assign({},
    require('./rpc/RPC'),
    {
        FAT0: {
            Transaction: require('./0/Transaction'),
            Issuance: require('./0/Issuance')
        }
    }
);