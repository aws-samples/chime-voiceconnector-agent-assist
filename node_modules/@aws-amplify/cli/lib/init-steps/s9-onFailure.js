"use strict";
const print = require('../extensions/amplify-helpers/print');
const util = require('util');
function run(e) {
    print.error('init failed');
    print.info(util.inspect(e));
    process.exit(1);
}
module.exports = {
    run,
};
//# sourceMappingURL=s9-onFailure.js.map