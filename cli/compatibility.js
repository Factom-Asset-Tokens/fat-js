const semver = require('semver');

function checkVersionCompatibility(version) {

    //Check for very old versions of fatd, where version headers were not included yet
    if (!version) {
        console.warn('WARNING: You are using an old version of fatd that isn\'t fully compatible with this version of fat-js. Unexpected or inconsistent behavior may occur');
        return;
    }

    if (version.includes('!')) console.warn('WARNING: You are using a version of fatd with unofficial local code changes. Unexpected or inconsistent behavior may occur');

    version = semver.coerce(version);

    //Check Minimum Version Support
    // In the future the compare version should be altered to match the lowest supported fatd version if breaking API changes occur in fatd
    if (semver.lt(version, '0.4.2')) console.warn('WARNING: You are using a version of fatd(', version.version, ') with known RPC bugs. Unexpected or inconsistent behavior may occur');

    //Check supported versions for known version specific bugs
    if (semver.lte(version.toString(), '0.5.0')) console.warn('WARNING: You are using a version of fatd(', version.version, ') with known RPC bugs in the get-issuance method. Invalid entryhashes for issuances are returned from the API. Please upgrade fatd to version 0.5.1 or later');

    //Check Maximum Version Support
    // This line's compare version should match the current highest fat-js tested version of fatd (usually latest)
    if (semver.gt(version, '0.5.1')) console.warn('WARNING: You are using a newer version of fatd(', version.version, ') than this fat-js version was tested with. Some data structures and API behavior may not be forwards compatible');
}

module.exports.checkVersion = checkVersionCompatibility;