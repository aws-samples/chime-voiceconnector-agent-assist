"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function isStringTypes(types) {
    return typeof types === 'string';
}
exports.isStringTypes = isStringTypes;
function isSourceTypes(types) {
    return types instanceof graphql_1.Source;
}
exports.isSourceTypes = isSourceTypes;
function isGraphQLType(definition) {
    return definition.kind === 'ObjectTypeDefinition';
}
exports.isGraphQLType = isGraphQLType;
function isGraphQLTypeExtension(definition) {
    return definition.kind === 'ObjectTypeExtension';
}
exports.isGraphQLTypeExtension = isGraphQLTypeExtension;
function isGraphQLEnum(definition) {
    return definition.kind === 'EnumTypeDefinition';
}
exports.isGraphQLEnum = isGraphQLEnum;
function isGraphQLEnumExtension(definition) {
    return definition.kind === 'EnumTypeExtension';
}
exports.isGraphQLEnumExtension = isGraphQLEnumExtension;
function isGraphQLUnion(definition) {
    return definition.kind === 'UnionTypeDefinition';
}
exports.isGraphQLUnion = isGraphQLUnion;
function isGraphQLUnionExtension(definition) {
    return definition.kind === 'UnionTypeExtension';
}
exports.isGraphQLUnionExtension = isGraphQLUnionExtension;
function isGraphQLScalar(definition) {
    return definition.kind === 'ScalarTypeDefinition';
}
exports.isGraphQLScalar = isGraphQLScalar;
function isGraphQLScalarExtension(definition) {
    return definition.kind === 'ScalarTypeExtension';
}
exports.isGraphQLScalarExtension = isGraphQLScalarExtension;
function isGraphQLInputType(definition) {
    return definition.kind === 'InputObjectTypeDefinition';
}
exports.isGraphQLInputType = isGraphQLInputType;
function isGraphQLInputTypeExtension(definition) {
    return definition.kind === 'InputObjectTypeExtension';
}
exports.isGraphQLInputTypeExtension = isGraphQLInputTypeExtension;
function isGraphQLInterface(definition) {
    return definition.kind === 'InterfaceTypeDefinition';
}
exports.isGraphQLInterface = isGraphQLInterface;
function isGraphQLInterfaceExtension(definition) {
    return definition.kind === 'InterfaceTypeExtension';
}
exports.isGraphQLInterfaceExtension = isGraphQLInterfaceExtension;
function isGraphQLDirective(definition) {
    return definition.kind === 'DirectiveDefinition';
}
exports.isGraphQLDirective = isGraphQLDirective;
function isGraphQLSchema(obj) {
    return obj instanceof graphql_1.GraphQLSchema;
}
exports.isGraphQLSchema = isGraphQLSchema;
function extractType(type) {
    let visitedType = type;
    while (visitedType.kind === 'ListType' || visitedType.kind === 'NonNullType') {
        visitedType = visitedType.type;
    }
    return visitedType;
}
exports.extractType = extractType;
function isSchemaDefinition(node) {
    return node.kind === 'SchemaDefinition';
}
exports.isSchemaDefinition = isSchemaDefinition;
function isWrappingTypeNode(type) {
    return type.kind !== graphql_1.Kind.NAMED_TYPE;
}
exports.isWrappingTypeNode = isWrappingTypeNode;
function isListTypeNode(type) {
    return type.kind === graphql_1.Kind.LIST_TYPE;
}
exports.isListTypeNode = isListTypeNode;
function isNonNullTypeNode(type) {
    return type.kind === graphql_1.Kind.NON_NULL_TYPE;
}
exports.isNonNullTypeNode = isNonNullTypeNode;
function printTypeNode(type) {
    if (isListTypeNode(type)) {
        return `[${printTypeNode(type.type)}]`;
    }
    if (isNonNullTypeNode(type)) {
        return `${printTypeNode(type.type)}!`;
    }
    return type.name.value;
}
exports.printTypeNode = printTypeNode;
//# sourceMappingURL=utils.js.map