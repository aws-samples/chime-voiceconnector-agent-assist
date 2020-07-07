"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenArray = (arr) => arr.reduce((acc, next) => acc.concat(Array.isArray(next) ? exports.flattenArray(next) : next), []);
//# sourceMappingURL=flatten-array.js.map