describe('Constant', () => {
    require('./constant/constant');
});

describe('Util', () => {
    require('./util/util.unit.spec');
});

describe('CLI', () => {
    require('./cli/cli.unit.spec');
    require('./cli/cli.integration.spec');
});

describe('FAT-0', () => {
    require('./0/0.transaction.unit.spec');
    require('./0/0.issuance.unit.spec');
    require('./0/0.cli.integration.spec');
});

describe('FAT-1', () => {
    require('./1/1.transaction.unit.spec');
    require('./1/1.issuance.unit.spec');
    require('./1/1.cli.integration.spec');
});
