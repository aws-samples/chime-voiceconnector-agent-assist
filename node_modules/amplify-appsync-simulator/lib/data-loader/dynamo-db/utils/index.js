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
var dynamodb_1 = require("aws-sdk/clients/dynamodb");
function nullIfEmpty(obj) {
    return Object.keys(obj).length === 0 ? null : obj;
}
exports.nullIfEmpty = nullIfEmpty;
function unmarshall(raw, isRaw) {
    if (isRaw === void 0) { isRaw = true; }
    var content = isRaw ? dynamodb_1.Converter.unmarshall(raw) : raw;
    // Because of the funky set type used in the aws-sdk, we need to further unwrap
    // to find if there is a set that needs to be unpacked into an array.
    // Unwrap sets
    if (content && typeof content === 'object' && content.wrapperName === 'Set') {
        return content.values;
    }
    // Unwrap lists
    if (Array.isArray(content)) {
        return content.map(function (value) { return unmarshall(value, false); });
    }
    // Unwrap maps
    if (content && typeof content === 'object') {
        return Object.entries(content).reduce(function (sum, _a) {
            var _b;
            var key = _a[0], value = _a[1];
            return (__assign(__assign({}, sum), (_b = {}, _b[key] = unmarshall(value, false), _b)));
        }, {});
    }
    return content;
}
exports.unmarshall = unmarshall;
//# sourceMappingURL=index.js.map