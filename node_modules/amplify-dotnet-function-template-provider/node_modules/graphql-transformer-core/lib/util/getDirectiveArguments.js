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
var graphql_1 = require("graphql");
/**
 * Given a directive returns a plain JS map of its arguments
 * @param arguments The list of argument nodes to reduce.
 */
function getDirectiveArguments(directive) {
    return directive.arguments
        ? directive.arguments.reduce(function (acc, arg) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[arg.name.value] = graphql_1.valueFromASTUntyped(arg.value), _a)));
        }, {})
        : [];
}
exports.getDirectiveArguments = getDirectiveArguments;
//# sourceMappingURL=getDirectiveArguments.js.map