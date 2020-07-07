"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NoneDataLoader = /** @class */ (function () {
    function NoneDataLoader() {
    }
    NoneDataLoader.prototype.load = function (request) {
        return request.payload || null;
    };
    return NoneDataLoader;
}());
exports.NoneDataLoader = NoneDataLoader;
//# sourceMappingURL=index.js.map