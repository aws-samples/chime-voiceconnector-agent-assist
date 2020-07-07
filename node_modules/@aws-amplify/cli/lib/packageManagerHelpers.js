"use strict";
const path = require('path');
const fs = require('fs');
const which = require('which');
async function getPackageManager() {
    const yarnLock = './yarn.lock';
    const yarnLockDir = path.join(process.cwd(), yarnLock);
    const packageJson = './package.json';
    const packageJsonDir = path.join(process.cwd(), packageJson);
    if (fs.existsSync(yarnLockDir)) {
        if (which.sync('yarn', { nothrow: true }) || which.sync('yarn.cmd', { nothrow: true })) {
            return 'yarn';
        }
        return 'npm';
    }
    else if (fs.existsSync(packageJsonDir)) {
        return 'npm';
    }
    return undefined;
}
async function normalizePackageManagerForOS(packageManager) {
    const isOnWindows = /^win/.test(process.platform);
    if (isOnWindows) {
        if (packageManager === 'yarn') {
            return 'yarn.cmd';
        }
        else if (!packageManager) {
            return undefined;
        }
        return 'npm.cmd';
    }
    return packageManager;
}
module.exports = {
    getPackageManager,
    normalizePackageManagerForOS,
};
//# sourceMappingURL=packageManagerHelpers.js.map