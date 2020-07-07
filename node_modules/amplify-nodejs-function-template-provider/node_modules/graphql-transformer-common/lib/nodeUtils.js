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
function withNamedNodeNamed(t, n) {
    switch (t.kind) {
        case graphql_1.Kind.NON_NULL_TYPE:
            return __assign(__assign({}, t), { type: withNamedNodeNamed(t.type, n) });
        case graphql_1.Kind.LIST_TYPE:
            return __assign(__assign({}, t), { type: withNamedNodeNamed(t.type, n) });
        case graphql_1.Kind.NAMED_TYPE:
            return __assign(__assign({}, t), { name: {
                    kind: graphql_1.Kind.NAME,
                    value: n,
                } });
    }
}
exports.withNamedNodeNamed = withNamedNodeNamed;
//# sourceMappingURL=nodeUtils.js.map