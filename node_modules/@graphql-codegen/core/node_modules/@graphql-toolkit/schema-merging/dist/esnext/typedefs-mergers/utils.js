import { Source, GraphQLSchema, Kind, } from 'graphql';
export function isStringTypes(types) {
    return typeof types === 'string';
}
export function isSourceTypes(types) {
    return types instanceof Source;
}
export function isGraphQLType(definition) {
    return definition.kind === 'ObjectTypeDefinition';
}
export function isGraphQLTypeExtension(definition) {
    return definition.kind === 'ObjectTypeExtension';
}
export function isGraphQLEnum(definition) {
    return definition.kind === 'EnumTypeDefinition';
}
export function isGraphQLEnumExtension(definition) {
    return definition.kind === 'EnumTypeExtension';
}
export function isGraphQLUnion(definition) {
    return definition.kind === 'UnionTypeDefinition';
}
export function isGraphQLUnionExtension(definition) {
    return definition.kind === 'UnionTypeExtension';
}
export function isGraphQLScalar(definition) {
    return definition.kind === 'ScalarTypeDefinition';
}
export function isGraphQLScalarExtension(definition) {
    return definition.kind === 'ScalarTypeExtension';
}
export function isGraphQLInputType(definition) {
    return definition.kind === 'InputObjectTypeDefinition';
}
export function isGraphQLInputTypeExtension(definition) {
    return definition.kind === 'InputObjectTypeExtension';
}
export function isGraphQLInterface(definition) {
    return definition.kind === 'InterfaceTypeDefinition';
}
export function isGraphQLInterfaceExtension(definition) {
    return definition.kind === 'InterfaceTypeExtension';
}
export function isGraphQLDirective(definition) {
    return definition.kind === 'DirectiveDefinition';
}
export function isGraphQLSchema(obj) {
    return obj instanceof GraphQLSchema;
}
export function extractType(type) {
    let visitedType = type;
    while (visitedType.kind === 'ListType' || visitedType.kind === 'NonNullType') {
        visitedType = visitedType.type;
    }
    return visitedType;
}
export function isSchemaDefinition(node) {
    return node.kind === 'SchemaDefinition';
}
export function isWrappingTypeNode(type) {
    return type.kind !== Kind.NAMED_TYPE;
}
export function isListTypeNode(type) {
    return type.kind === Kind.LIST_TYPE;
}
export function isNonNullTypeNode(type) {
    return type.kind === Kind.NON_NULL_TYPE;
}
export function printTypeNode(type) {
    if (isListTypeNode(type)) {
        return `[${printTypeNode(type.type)}]`;
    }
    if (isNonNullTypeNode(type)) {
        return `${printTypeNode(type.type)}!`;
    }
    return type.name.value;
}
//# sourceMappingURL=utils.js.map