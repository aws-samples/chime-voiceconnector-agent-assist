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
/**
 * GraphQL Allows to show custom errors properties in errors using a property called extensions.
 * AppSync doesn't use extensions in error instead it puts the error at the objects root level.
 * For instance, UnAuthorized has errorType field with value Unauthorized.
 *
 * This utility method takes all the properties exposed through extensions and exposes them at root
 * level of the Error object
 * @param errors GraphQLError object
 *
 */
function exposeGraphQLErrors(errors) {
    if (errors === void 0) { errors = []; }
    return errors.map(function (e) {
        if (e.extensions) {
            var additionalProps = Object.entries(e.extensions).reduce(function (sum, _a) {
                var _b;
                var k = _a[0], v = _a[1];
                return __assign(__assign({}, sum), (_b = {}, _b[k] = { value: v, enumerable: true }, _b));
            }, {});
            return Object.defineProperties({}, additionalProps);
        }
        return e;
    });
}
exports.exposeGraphQLErrors = exposeGraphQLErrors;
//# sourceMappingURL=expose-graphql-errors.js.map