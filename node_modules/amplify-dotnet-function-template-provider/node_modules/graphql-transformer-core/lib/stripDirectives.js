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
function stripDirectives(doc, except) {
    if (except === void 0) { except = []; }
    var definitions = [];
    for (var _i = 0, _a = doc.definitions; _i < _a.length; _i++) {
        var def = _a[_i];
        switch (def.kind) {
            case graphql_1.Kind.OBJECT_TYPE_DEFINITION:
                definitions.push(stripObjectDirectives(def));
                break;
            case graphql_1.Kind.INTERFACE_TYPE_DEFINITION:
                definitions.push(stripInterfaceDirectives(def));
                break;
            case graphql_1.Kind.UNION_TYPE_DEFINITION:
                definitions.push(stripUnionDirectives(def));
                break;
            case graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION:
                definitions.push(stripInputObjectDirectives(def));
                break;
            case graphql_1.Kind.ENUM_TYPE_DEFINITION:
                definitions.push(stripEnumDirectives(def));
                break;
            case graphql_1.Kind.SCALAR_TYPE_DEFINITION:
                definitions.push(stripScalarDirectives(def));
                break;
        }
    }
    function excepted(dir) {
        return Boolean(except.find(function (f) { return dir.name.value === f; }));
    }
    function stripObjectDirectives(node) {
        var fields = node.fields ? node.fields.map(stripFieldDirectives) : node.fields;
        return __assign(__assign({}, node), { fields: fields, directives: node.directives.filter(excepted) });
    }
    function stripInterfaceDirectives(node) {
        var fields = node.fields ? node.fields.map(stripFieldDirectives) : node.fields;
        return __assign(__assign({}, node), { fields: fields, directives: node.directives.filter(excepted) });
    }
    function stripFieldDirectives(node) {
        var args = node.arguments ? node.arguments.map(stripArgumentDirectives) : node.arguments;
        return __assign(__assign({}, node), { arguments: args, directives: node.directives.filter(excepted) });
    }
    function stripArgumentDirectives(node) {
        return __assign(__assign({}, node), { directives: node.directives.filter(excepted) });
    }
    function stripUnionDirectives(node) {
        return __assign(__assign({}, node), { directives: node.directives.filter(excepted) });
    }
    function stripScalarDirectives(node) {
        return __assign(__assign({}, node), { directives: node.directives.filter(excepted) });
    }
    function stripInputObjectDirectives(node) {
        var fields = node.fields ? node.fields.map(stripArgumentDirectives) : node.fields;
        return __assign(__assign({}, node), { fields: fields, directives: node.directives.filter(excepted) });
    }
    function stripEnumDirectives(node) {
        var values = node.values ? node.values.map(stripEnumValueDirectives) : node.values;
        return __assign(__assign({}, node), { values: values, directives: node.directives.filter(excepted) });
    }
    function stripEnumValueDirectives(node) {
        return __assign(__assign({}, node), { directives: node.directives.filter(excepted) });
    }
    return {
        kind: graphql_1.Kind.DOCUMENT,
        definitions: definitions,
    };
}
exports.stripDirectives = stripDirectives;
//# sourceMappingURL=stripDirectives.js.map