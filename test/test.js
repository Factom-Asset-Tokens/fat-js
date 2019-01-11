require('./util/util.unit.spec');

describe('FAT-0', () => {
    require('./0/0.transaction.unit.spec');
    require('./0/0.issuance.unit.spec');
    require('./0/0.cli.unit.spec');

    require('./0/0.cli.integration.spec');
});