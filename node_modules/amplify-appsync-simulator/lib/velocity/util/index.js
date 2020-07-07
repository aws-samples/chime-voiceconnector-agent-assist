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
var errors_1 = require("./errors");
exports.TemplateSentError = errors_1.TemplateSentError;
exports.Unauthorized = errors_1.Unauthorized;
exports.ValidateError = errors_1.ValidateError;
var general_utils_1 = require("./general-utils");
var dynamodb_utils_1 = require("./dynamodb-utils");
var list_utils_1 = require("./list-utils");
var map_utils_1 = require("./map-utils");
var transform_1 = require("./transform");
var time_1 = require("./time");
function create(errors, now, info) {
    if (errors === void 0) { errors = []; }
    if (now === void 0) { now = new Date(); }
    return __assign(__assign({}, general_utils_1.generalUtils), { dynamodb: dynamodb_utils_1.dynamodbUtils, list: list_utils_1.listUtils, map: map_utils_1.mapUtils, transform: transform_1.transformUtils, now: now,
        errors: errors,
        info: info, time: time_1.time() });
}
exports.create = create;
//# sourceMappingURL=index.js.map