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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
exports.STANDARD_SCALARS = {
    String: 'String',
    Int: 'Int',
    Float: 'Float',
    Boolean: 'Boolean',
    ID: 'ID',
};
var OTHER_SCALARS = {
    BigInt: 'Int',
    Double: 'Float',
};
exports.APPSYNC_DEFINED_SCALARS = {
    AWSDate: 'String',
    AWSTime: 'String',
    AWSDateTime: 'String',
    AWSTimestamp: 'Int',
    AWSEmail: 'String',
    AWSJSON: 'String',
    AWSURL: 'String',
    AWSPhone: 'String',
    AWSIPAddress: 'String',
};
exports.DEFAULT_SCALARS = __assign(__assign(__assign({}, exports.STANDARD_SCALARS), OTHER_SCALARS), exports.APPSYNC_DEFINED_SCALARS);
exports.NUMERIC_SCALARS = {
    BigInt: true,
    Int: true,
    Float: true,
    Double: true,
    AWSTimestamp: true,
};
exports.MAP_SCALARS = {
    AWSJSON: true,
};
function attributeTypeFromScalar(scalar) {
    var baseType = getBaseType(scalar);
    var baseScalar = exports.DEFAULT_SCALARS[baseType];
    if (!baseScalar) {
        throw new Error("Expected scalar and got " + baseType);
    }
    switch (baseScalar) {
        case 'String':
        case 'ID':
            return 'S';
        case 'Int':
        case 'Float':
            return 'N';
        case 'Boolean':
            throw new Error("Boolean values cannot be used as sort keys.");
        default:
            throw new Error("There is no valid DynamoDB attribute type for scalar " + baseType);
    }
}
exports.attributeTypeFromScalar = attributeTypeFromScalar;
function isScalar(type) {
    if (type.kind === graphql_1.Kind.NON_NULL_TYPE) {
        return isScalar(type.type);
    }
    else if (type.kind === graphql_1.Kind.LIST_TYPE) {
        return isScalar(type.type);
    }
    else {
        return Boolean(exports.DEFAULT_SCALARS[type.name.value]);
    }
}
exports.isScalar = isScalar;
function isScalarOrEnum(type, enums) {
    if (type.kind === graphql_1.Kind.NON_NULL_TYPE) {
        return isScalarOrEnum(type.type, enums);
    }
    else if (type.kind === graphql_1.Kind.LIST_TYPE) {
        return isScalarOrEnum(type.type, enums);
    }
    else {
        for (var _i = 0, enums_1 = enums; _i < enums_1.length; _i++) {
            var e = enums_1[_i];
            if (e.name.value === type.name.value) {
                return true;
            }
        }
        return Boolean(exports.DEFAULT_SCALARS[type.name.value]);
    }
}
exports.isScalarOrEnum = isScalarOrEnum;
function getBaseType(type) {
    if (type.kind === graphql_1.Kind.NON_NULL_TYPE) {
        return getBaseType(type.type);
    }
    else if (type.kind === graphql_1.Kind.LIST_TYPE) {
        return getBaseType(type.type);
    }
    else {
        return type.name.value;
    }
}
exports.getBaseType = getBaseType;
function isListType(type) {
    if (type.kind === graphql_1.Kind.NON_NULL_TYPE) {
        return isListType(type.type);
    }
    else if (type.kind === graphql_1.Kind.LIST_TYPE) {
        return true;
    }
    else {
        return false;
    }
}
exports.isListType = isListType;
function isNonNullType(type) {
    return type.kind === graphql_1.Kind.NON_NULL_TYPE;
}
exports.isNonNullType = isNonNullType;
function getDirectiveArgument(directive, arg, dflt) {
    var argument = directive.arguments.find(function (a) { return a.name.value === arg; });
    return argument ? graphql_1.valueFromASTUntyped(argument.value) : dflt;
}
exports.getDirectiveArgument = getDirectiveArgument;
function unwrapNonNull(type) {
    if (type.kind === 'NonNullType') {
        return unwrapNonNull(type.type);
    }
    return type;
}
exports.unwrapNonNull = unwrapNonNull;
function wrapNonNull(type) {
    if (type.kind !== 'NonNullType') {
        return makeNonNullType(type);
    }
    return type;
}
exports.wrapNonNull = wrapNonNull;
function makeOperationType(operation, type) {
    return {
        kind: 'OperationTypeDefinition',
        operation: operation,
        type: {
            kind: 'NamedType',
            name: {
                kind: 'Name',
                value: type,
            },
        },
    };
}
exports.makeOperationType = makeOperationType;
function makeSchema(operationTypes) {
    return {
        kind: graphql_1.Kind.SCHEMA_DEFINITION,
        operationTypes: operationTypes,
        directives: [],
    };
}
exports.makeSchema = makeSchema;
function blankObject(name) {
    return {
        kind: 'ObjectTypeDefinition',
        name: {
            kind: 'Name',
            value: name,
        },
        fields: [],
        directives: [],
        interfaces: [],
    };
}
exports.blankObject = blankObject;
function blankObjectExtension(name) {
    return {
        kind: graphql_1.Kind.OBJECT_TYPE_EXTENSION,
        name: {
            kind: 'Name',
            value: name,
        },
        fields: [],
        directives: [],
        interfaces: [],
    };
}
exports.blankObjectExtension = blankObjectExtension;
function extensionWithFields(object, fields) {
    return __assign(__assign({}, object), { fields: __spreadArrays(object.fields, fields) });
}
exports.extensionWithFields = extensionWithFields;
function extensionWithDirectives(object, directives) {
    if (directives && directives.length > 0) {
        var newDirectives = [];
        var _loop_1 = function (directive) {
            if (!object.directives.find(function (d) { return d.name.value === directive.name.value; })) {
                newDirectives.push(directive);
            }
        };
        for (var _i = 0, directives_1 = directives; _i < directives_1.length; _i++) {
            var directive = directives_1[_i];
            _loop_1(directive);
        }
        if (newDirectives.length > 0) {
            return __assign(__assign({}, object), { directives: __spreadArrays(object.directives, newDirectives) });
        }
    }
    return object;
}
exports.extensionWithDirectives = extensionWithDirectives;
function extendFieldWithDirectives(field, directives) {
    if (directives && directives.length > 0) {
        var newDirectives = [];
        var _loop_2 = function (directive) {
            if (!field.directives.find(function (d) { return d.name.value === directive.name.value; })) {
                newDirectives.push(directive);
            }
        };
        for (var _i = 0, directives_2 = directives; _i < directives_2.length; _i++) {
            var directive = directives_2[_i];
            _loop_2(directive);
        }
        if (newDirectives.length > 0) {
            return __assign(__assign({}, field), { directives: __spreadArrays(field.directives, newDirectives) });
        }
    }
    return field;
}
exports.extendFieldWithDirectives = extendFieldWithDirectives;
function makeInputObjectDefinition(name, inputs) {
    return {
        kind: 'InputObjectTypeDefinition',
        name: {
            kind: 'Name',
            value: name,
        },
        fields: inputs,
        directives: [],
    };
}
exports.makeInputObjectDefinition = makeInputObjectDefinition;
function makeObjectDefinition(name, inputs) {
    return {
        kind: graphql_1.Kind.OBJECT_TYPE_DEFINITION,
        name: {
            kind: 'Name',
            value: name,
        },
        fields: inputs,
        directives: [],
    };
}
exports.makeObjectDefinition = makeObjectDefinition;
function makeField(name, args, type, directives) {
    if (directives === void 0) { directives = []; }
    return {
        kind: graphql_1.Kind.FIELD_DEFINITION,
        name: {
            kind: 'Name',
            value: name,
        },
        arguments: args,
        type: type,
        directives: directives,
    };
}
exports.makeField = makeField;
function makeDirective(name, args) {
    return {
        kind: graphql_1.Kind.DIRECTIVE,
        name: {
            kind: graphql_1.Kind.NAME,
            value: name,
        },
        arguments: args,
    };
}
exports.makeDirective = makeDirective;
function makeArgument(name, value) {
    return {
        kind: graphql_1.Kind.ARGUMENT,
        name: {
            kind: 'Name',
            value: name,
        },
        value: value,
    };
}
exports.makeArgument = makeArgument;
function makeValueNode(value) {
    if (typeof value === 'string') {
        return { kind: graphql_1.Kind.STRING, value: value };
    }
    else if (Number.isInteger(value)) {
        return { kind: graphql_1.Kind.INT, value: value };
    }
    else if (typeof value === 'number') {
        return { kind: graphql_1.Kind.FLOAT, value: String(value) };
    }
    else if (typeof value === 'boolean') {
        return { kind: graphql_1.Kind.BOOLEAN, value: value };
    }
    else if (value === null) {
        return { kind: graphql_1.Kind.NULL };
    }
    else if (Array.isArray(value)) {
        return {
            kind: graphql_1.Kind.LIST,
            values: value.map(function (v) { return makeValueNode(v); }),
        };
    }
    else if (typeof value === 'object') {
        return {
            kind: graphql_1.Kind.OBJECT,
            fields: Object.keys(value).map(function (key) {
                var keyValNode = makeValueNode(value[key]);
                return {
                    kind: graphql_1.Kind.OBJECT_FIELD,
                    name: { kind: graphql_1.Kind.NAME, value: key },
                    value: keyValNode,
                };
            }),
        };
    }
}
exports.makeValueNode = makeValueNode;
function makeInputValueDefinition(name, type) {
    return {
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: {
            kind: 'Name',
            value: name,
        },
        type: type,
        directives: [],
    };
}
exports.makeInputValueDefinition = makeInputValueDefinition;
function makeNamedType(name) {
    return {
        kind: 'NamedType',
        name: {
            kind: 'Name',
            value: name,
        },
    };
}
exports.makeNamedType = makeNamedType;
function makeNonNullType(type) {
    return {
        kind: graphql_1.Kind.NON_NULL_TYPE,
        type: type,
    };
}
exports.makeNonNullType = makeNonNullType;
function makeListType(type) {
    return {
        kind: 'ListType',
        type: type,
    };
}
exports.makeListType = makeListType;
//# sourceMappingURL=definition.js.map