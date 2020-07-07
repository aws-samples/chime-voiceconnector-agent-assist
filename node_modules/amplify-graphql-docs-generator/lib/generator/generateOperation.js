"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getArgs_1 = require("./getArgs");
const getBody_1 = require("./getBody");
function generateOperation(operation, schema, maxDepth = 3, options) {
    const args = getArgs_1.default(operation.args);
    const body = getBody_1.default(operation, schema, maxDepth, options);
    return {
        args,
        body,
    };
}
exports.default = generateOperation;
//# sourceMappingURL=generateOperation.js.map