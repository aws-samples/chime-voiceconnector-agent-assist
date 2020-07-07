"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getDefaultAdapter = function () {
    if (window.indexedDB) {
        return require('../indexeddb').default;
    }
    if (process && process.env) {
        throw new Error('Node is not supported');
    }
};
exports.default = getDefaultAdapter;
//# sourceMappingURL=index.js.map