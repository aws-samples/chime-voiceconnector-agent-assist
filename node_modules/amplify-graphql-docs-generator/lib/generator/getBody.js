"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFields_1 = require("./getFields");
function getBody(op, schema, maxDepth = 3, options) {
    const args = op.args.map(arg => ({
        name: arg.name,
        value: `\$${arg.name}`,
    }));
    const fields = getFields_1.default(op, schema, maxDepth, options);
    return Object.assign({ args }, fields);
}
exports.default = getBody;
//# sourceMappingURL=getBody.js.map