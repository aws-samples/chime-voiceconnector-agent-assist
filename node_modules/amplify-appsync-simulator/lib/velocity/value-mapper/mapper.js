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
var map_1 = require("./map");
var array_1 = require("./array");
var string_1 = require("./string");
var lodash_1 = require("lodash");
function map(value) {
    if (value instanceof map_1.JavaMap)
        return value;
    if (value instanceof array_1.JavaArray)
        return value;
    if (Array.isArray(value)) {
        return new array_1.JavaArray(value.map(function (x) { return map(x); }), map);
    }
    if (lodash_1.isPlainObject(value)) {
        return map_1.createMapProxy(new map_1.JavaMap(Object.entries(value).reduce(function (sum, _a) {
            var _b;
            var k = _a[0], v = _a[1];
            return __assign(__assign({}, sum), (_b = {}, _b[k] = map(v), _b));
        }, {}), map));
    }
    // eslint-disable-next-line
    if (typeof value === 'string' && !(value instanceof string_1.JavaString)) {
        // eslint-disable-next-line
        return new string_1.JavaString(value);
    }
    // for now we don't handle number.
    return value;
}
exports.map = map;
//# sourceMappingURL=mapper.js.map