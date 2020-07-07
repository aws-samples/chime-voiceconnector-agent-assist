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
var set_1 = require("aws-sdk/lib/dynamodb/set");
var to_json_1 = require("../value-mapper/to-json");
exports.dynamodbUtils = {
    toDynamoDB: function (value) {
        return dynamodb_1.Converter.input(to_json_1.toJSON(value));
    },
    $toSet: function (values, fn) {
        if (fn === void 0) { fn = function (value) { return value; }; }
        return this.toDynamoDB(new set_1.DynamoDBSet([].concat(values).map(function (value) { return fn(value); })));
    },
    toDynamoDBJson: function (value) {
        return JSON.stringify(this.toDynamoDB(value));
    },
    toString: function (value) {
        return this.toDynamoDB(String(value));
    },
    toStringJson: function (value) {
        return this.toDynamoDBJson(value);
    },
    toStringSet: function (value) {
        return this.$toSet(value, String);
    },
    toStringSetJson: function (value) {
        return JSON.stringify(this.toStringSet(value));
    },
    toNumber: function (value) {
        return this.toDynamoDB(Number(value));
    },
    toNumberJson: function (value) {
        return JSON.stringify(this.toNumber(value));
    },
    toNumberSet: function (value) {
        return this.$toSet(value, Number);
    },
    toNumberSetJson: function (value) {
        return JSON.stringify(this.toNumberSet(value));
    },
    toBinary: function (value) {
        return { B: to_json_1.toJSON(value) };
    },
    toBinaryJson: function (value) {
        // this is probably wrong.
        return JSON.stringify(this.toBinary(value));
    },
    toBinarySet: function (value) {
        return { BS: [].concat(value) };
    },
    toBinarySetJson: function (value) {
        return JSON.stringify(this.toBinarySet(value));
    },
    toBoolean: function (value) {
        return { BOOL: value };
    },
    toBooleanJson: function (value) {
        return JSON.stringify(this.toBoolean(value));
    },
    toNull: function () {
        return { NULL: null };
    },
    toNullJson: function () {
        return JSON.stringify(this.toNull());
    },
    toList: function (value) {
        return this.toDynamoDB(value);
    },
    toListJson: function (value) {
        return JSON.stringify(this.toList(value));
    },
    toMap: function (value) {
        // this should probably do some kind of conversion.
        return this.toDynamoDB(to_json_1.toJSON(value));
    },
    toMapJson: function (value) {
        return JSON.stringify(this.toMap(value));
    },
    toMapValues: function (values) {
        var _this = this;
        return Object.entries(to_json_1.toJSON(values)).reduce(function (sum, _a) {
            var _b;
            var key = _a[0], value = _a[1];
            return (__assign(__assign({}, sum), (_b = {}, _b[key] = _this.toDynamoDB(value), _b)));
        }, {});
    },
    toMapValuesJson: function (values) {
        return JSON.stringify(this.toMapValues(values));
    },
    toS3ObjectJson: function () {
        throw new Error('not implemented');
    },
    toS3Object: function () {
        throw new Error('not implemented');
    },
    fromS3ObjectJson: function () {
        throw new Error('not implemented');
    },
};
//# sourceMappingURL=dynamodb-utils.js.map