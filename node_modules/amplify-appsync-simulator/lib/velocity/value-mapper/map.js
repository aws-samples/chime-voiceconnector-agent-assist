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
var array_1 = require("./array");
var to_json_1 = require("./to-json");
var JavaMap = /** @class */ (function () {
    function JavaMap(obj, mapper) {
        var _this = this;
        this.mapper = mapper;
        this.map = new Map();
        Object.entries(obj).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            _this.map.set(key, value);
        });
    }
    JavaMap.prototype.clear = function () {
        this.map.clear();
    };
    JavaMap.prototype.containsKey = function (key) {
        return this.map.has(key);
    };
    JavaMap.prototype.containsValue = function (value) {
        return Array.from(this.map.values()).indexOf(value) !== -1;
    };
    JavaMap.prototype.entrySet = function () {
        var _this = this;
        var entries = Array.from(this.map.entries()).map(function (_a) {
            var key = _a[0], value = _a[1];
            return createMapProxy(new JavaMap({
                key: key,
                value: value,
            }, _this.mapper));
        });
        return new array_1.JavaArray(entries, this.mapper);
    };
    JavaMap.prototype.equals = function (value) {
        return Array.from(this.map.entries()).every(function (_a) {
            var key = _a[0], v = _a[1];
            return value.get(key) === v;
        });
    };
    JavaMap.prototype.get = function (key) {
        if (this.map.has(key.toString())) {
            return this.map.get(key);
        }
        return null;
    };
    JavaMap.prototype.isEmpty = function () {
        return this.map.size === 0;
    };
    JavaMap.prototype.keySet = function () {
        return new array_1.JavaArray(Array.from(this.map.keys()), this.mapper);
    };
    JavaMap.prototype.put = function (key, value) {
        var saveValue = this.mapper(value);
        this.map.set(key, saveValue);
        return saveValue;
    };
    JavaMap.prototype.putAll = function (map) {
        var _this = this;
        map = to_json_1.toJSON(map);
        Object.entries(map).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            _this.put(key, value);
        });
    };
    JavaMap.prototype.remove = function (key) {
        if (!this.map.has(key)) {
            return null;
        }
        var value = this.map.get(key);
        this.map.delete(key);
        return value;
    };
    JavaMap.prototype.size = function () {
        return this.map.size;
    };
    JavaMap.prototype.values = function () {
        return new array_1.JavaArray(Array.from(this.map.values()), this.mapper);
    };
    JavaMap.prototype.toJSON = function () {
        return Array.from(this.map.entries()).reduce(function (sum, _a) {
            var _b;
            var key = _a[0], value = _a[1];
            return (__assign(__assign({}, sum), (_b = {}, _b[key] = to_json_1.toJSON(value), _b)));
        }, {});
    };
    return JavaMap;
}());
exports.JavaMap = JavaMap;
function createMapProxy(map) {
    return new Proxy(map, {
        get: function (obj, prop) {
            if (map.map.has(prop)) {
                return map.get(prop);
            }
            return map[prop];
        },
        set: function (obj, prop, val) {
            if (typeof val !== 'function') {
                map.map.set(prop, val);
            }
            return true;
        },
    });
}
exports.createMapProxy = createMapProxy;
//# sourceMappingURL=map.js.map