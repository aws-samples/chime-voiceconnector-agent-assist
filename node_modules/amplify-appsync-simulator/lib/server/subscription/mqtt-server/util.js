"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function defer(done) {
    if (typeof done === 'function') {
        setImmediate(done);
    }
}
exports.defer = defer;
//# sourceMappingURL=util.js.map