"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var to_json_1 = require("./to-json");
var JavaArray = /** @class */ (function (_super) {
    __extends(JavaArray, _super);
    function JavaArray(values, mapper) {
        if (values === void 0) { values = []; }
        var _this = this;
        if (!Array.isArray(values)) {
            // splice sends a single object
            values = [values];
        }
        _this = _super.apply(this, values) || this;
        Object.setPrototypeOf(_this, Object.create(JavaArray.prototype));
        _this.mapper = mapper;
        return _this;
    }
    JavaArray.prototype.add = function (value) {
        this.push(this.mapper(value));
        return value;
    };
    JavaArray.prototype.addAll = function (value) {
        var _this = this;
        value.forEach(function (val) { return _this.push(_this.mapper(val)); });
    };
    JavaArray.prototype.clear = function () {
        this.length = 0;
    };
    JavaArray.prototype.contains = function (value) {
        value = value && value.toJSON ? value.toJSON() : value;
        return this.toJSON().indexOf(value) !== -1;
    };
    JavaArray.prototype.containsAll = function (value) {
        var _this = this;
        if (value === void 0) { value = []; }
        return value.every(function (v) { return _this.contains(v); });
    };
    JavaArray.prototype.isEmpty = function () {
        return this.length === 0;
    };
    JavaArray.prototype.remove = function (value) {
        var idx = this.indexOf(value);
        if (idx === -1)
            return;
        this.splice(idx, 1);
    };
    JavaArray.prototype.removeAll = function (value) {
        var self = this;
        value.forEach(function (val) { return self.remove(val); });
    };
    JavaArray.prototype.retainAll = function () {
        throw new Error('no support for retain all');
    };
    JavaArray.prototype.size = function () {
        return this.length;
    };
    JavaArray.prototype.toJSON = function () {
        return Array.from(this).map(to_json_1.toJSON);
    };
    return JavaArray;
}(Array));
exports.JavaArray = JavaArray;
//# sourceMappingURL=array.js.map