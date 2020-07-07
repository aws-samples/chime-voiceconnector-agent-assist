"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var mapper_1 = require("../value-mapper/mapper");
exports.mapUtils = {
    copyAndRetainAllKeys: function (map, keys) {
        var keyStr = keys.toJSON();
        return mapper_1.map(map
            .keySet()
            .toJSON()
            .reduce(function (sum, _a) {
            var _b;
            var key = _a[0], val = _a[1];
            if (keyStr.indexOf(key.toString()) === -1)
                return sum;
            var valJSON = val && val.toJSON ? val.toJSON() : val;
            return __assign(__assign({}, sum), (_b = {}, _b[key] = valJSON, _b));
        }, {}));
    },
    copyAndRemoveAllKeys: function (map, keys) {
        var keysStr = keys.toJSON();
        var result = map
            .keySet()
            .toJSON()
            .reduce(function (acc, key) {
            var _a;
            key = key && key.toString && key.toString();
            if (!keysStr.includes(key)) {
                var val = map.get(key);
                var valJSON = val && val.toJSON ? val.toJSON() : val;
                return __assign(__assign({}, acc), (_a = {}, _a[key] = valJSON, _a));
            }
            return acc;
        }, {});
        return mapper_1.map(result);
    },
};
//# sourceMappingURL=map-utils.js.map