"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
function collectDirectiveNames(sdl) {
    var dirs = collectDirectives(sdl);
    return dirs.map(function (d) { return d.name.value; });
}
exports.collectDirectiveNames = collectDirectiveNames;
function collectDirectives(sdl) {
    var doc = graphql_1.parse(sdl);
    var directives = [];
    for (var _i = 0, _a = doc.definitions; _i < _a.length; _i++) {
        var def = _a[_i];
        switch (def.kind) {
            case graphql_1.Kind.OBJECT_TYPE_DEFINITION:
                // Does def node have a @model and no @auth.
                directives = directives.concat(collectObjectDirectives(def));
                break;
            case graphql_1.Kind.INTERFACE_TYPE_DEFINITION:
                directives = directives.concat(collectInterfaceDirectives(def));
                break;
            case graphql_1.Kind.UNION_TYPE_DEFINITION:
                directives = directives.concat(collectUnionDirectives(def));
                break;
            case graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION:
                directives = directives.concat(collectInputObjectDirectives(def));
                break;
            case graphql_1.Kind.ENUM_TYPE_DEFINITION:
                directives = directives.concat(collectEnumDirectives(def));
                break;
            case graphql_1.Kind.SCALAR_TYPE_DEFINITION:
                directives = directives.concat(collectScalarDirectives(def));
                break;
        }
    }
    return directives;
}
exports.collectDirectives = collectDirectives;
function collectDirectivesByTypeNames(sdl) {
    var types = collectDirectivesByType(sdl);
    var directives = new Set();
    Object.keys(types).forEach(function (dir) {
        var set = new Set();
        types[dir].forEach(function (d) {
            set.add(d.name.value);
            directives.add(d.name.value);
        });
        types[dir] = Array.from(set);
    });
    return { types: types, directives: Array.from(directives) };
}
exports.collectDirectivesByTypeNames = collectDirectivesByTypeNames;
function collectDirectivesByType(sdl) {
    var doc = graphql_1.parse(sdl);
    // defined types with directives list
    var types = {};
    for (var _i = 0, _a = doc.definitions; _i < _a.length; _i++) {
        var def = _a[_i];
        switch (def.kind) {
            case graphql_1.Kind.OBJECT_TYPE_DEFINITION:
                types[def.name.value] = __spreadArrays((types[def.name.value] || []), collectObjectDirectives(def));
                break;
            case graphql_1.Kind.INTERFACE_TYPE_DEFINITION:
                types[def.name.value] = __spreadArrays((types[def.name.value] || []), collectInterfaceDirectives(def));
                break;
            case graphql_1.Kind.UNION_TYPE_DEFINITION:
                types[def.name.value] = __spreadArrays((types[def.name.value] || []), collectUnionDirectives(def));
                break;
            case graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION:
                types[def.name.value] = __spreadArrays((types[def.name.value] || []), collectInputObjectDirectives(def));
                break;
            case graphql_1.Kind.ENUM_TYPE_DEFINITION:
                types[def.name.value] = __spreadArrays((types[def.name.value] || []), collectEnumDirectives(def));
                break;
            case graphql_1.Kind.SCALAR_TYPE_DEFINITION:
                types[def.name.value] = __spreadArrays((types[def.name.value] || []), collectScalarDirectives(def));
                break;
        }
    }
    return types;
}
exports.collectDirectivesByType = collectDirectivesByType;
function collectObjectDirectives(node) {
    var dirs = [];
    for (var _i = 0, _a = node.fields; _i < _a.length; _i++) {
        var field = _a[_i];
        var fieldDirs = collectFieldDirectives(field);
        dirs = dirs.concat(fieldDirs);
    }
    return dirs.concat(node.directives);
}
exports.collectObjectDirectives = collectObjectDirectives;
function collectInterfaceDirectives(node) {
    var dirs = [];
    for (var _i = 0, _a = node.fields; _i < _a.length; _i++) {
        var field = _a[_i];
        var fieldDirs = collectFieldDirectives(field);
        dirs = dirs.concat(fieldDirs);
    }
    return dirs.concat(node.directives);
}
exports.collectInterfaceDirectives = collectInterfaceDirectives;
function collectFieldDirectives(node) {
    var dirs = [];
    for (var _i = 0, _a = node.arguments; _i < _a.length; _i++) {
        var arg = _a[_i];
        var argDirs = collectArgumentDirectives(arg);
        dirs = dirs.concat(argDirs);
    }
    return dirs.concat(node.directives);
}
exports.collectFieldDirectives = collectFieldDirectives;
function collectArgumentDirectives(node) {
    return __spreadArrays((node.directives || []));
}
exports.collectArgumentDirectives = collectArgumentDirectives;
function collectUnionDirectives(node) {
    return __spreadArrays((node.directives || []));
}
exports.collectUnionDirectives = collectUnionDirectives;
function collectScalarDirectives(node) {
    return __spreadArrays((node.directives || []));
}
exports.collectScalarDirectives = collectScalarDirectives;
function collectInputObjectDirectives(node) {
    var dirs = [];
    for (var _i = 0, _a = node.fields; _i < _a.length; _i++) {
        var field = _a[_i];
        var fieldDirs = collectArgumentDirectives(field);
        dirs = dirs.concat(fieldDirs);
    }
    return dirs.concat(node.directives);
}
exports.collectInputObjectDirectives = collectInputObjectDirectives;
function collectEnumDirectives(node) {
    var dirs = [];
    for (var _i = 0, _a = node.values; _i < _a.length; _i++) {
        var val = _a[_i];
        var valDirs = collectEnumValueDirectives(val);
        dirs = dirs.concat(valDirs);
    }
    return dirs.concat(node.directives);
}
exports.collectEnumDirectives = collectEnumDirectives;
function collectEnumValueDirectives(node) {
    return __spreadArrays((node.directives || []));
}
exports.collectEnumValueDirectives = collectEnumValueDirectives;
//# sourceMappingURL=collectDirectives.js.map