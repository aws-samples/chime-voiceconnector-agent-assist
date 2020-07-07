"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./types"));
const generate_1 = require("./generate");
var generateAllOperations_1 = require("./generateAllOperations");
exports.generateMutations = generateAllOperations_1.generateMutations;
exports.generateSubscriptions = generateAllOperations_1.generateSubscriptions;
exports.generateQueries = generateAllOperations_1.generateQueries;
exports.default = generate_1.default;
//# sourceMappingURL=index.js.map