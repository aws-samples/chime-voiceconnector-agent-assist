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
var graphql_transformer_common_1 = require("graphql-transformer-common");
/**
 * Given a Type returns a plain JS map of its arguments
 * @param arguments The list of argument nodes to reduce.
 */
function getFieldArguments(type) {
    return type.fields
        ? type.fields.reduce(function (acc, arg) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[arg.name.value] = graphql_transformer_common_1.getBaseType(arg.type), _a)));
        }, {})
        : [];
}
exports.getFieldArguments = getFieldArguments;
//# sourceMappingURL=getFieldArguments.js.map