"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const utils_1 = require("./utils");
const merge_nodes_1 = require("./merge-nodes");
const comments_1 = require("./comments");
function mergeGraphQLSchemas(types, config) {
    console.info(`
    GraphQL Toolkit/Epoxy 
    Deprecation Notice;
    'mergeGraphQLSchemas' is deprecated and will be removed in the next version.
    Please use 'mergeTypeDefs' instead!
  `);
    return mergeGraphQLTypes(types, config);
}
exports.mergeGraphQLSchemas = mergeGraphQLSchemas;
function mergeTypeDefs(types, config) {
    comments_1.resetComments();
    const doc = {
        kind: graphql_1.Kind.DOCUMENT,
        definitions: mergeGraphQLTypes(types, {
            useSchemaDefinition: true,
            forceSchemaDefinition: false,
            throwOnConflict: false,
            commentDescriptions: false,
            ...config,
        }),
    };
    let result;
    if (config && config.commentDescriptions) {
        result = comments_1.printWithComments(doc);
    }
    else {
        result = doc;
    }
    comments_1.resetComments();
    return result;
}
exports.mergeTypeDefs = mergeTypeDefs;
function fixSchemaAst(schema, config) {
    return graphql_1.buildASTSchema(graphql_1.parse(graphql_1.printSchema(schema, { commentDescriptions: config.commentDescriptions })));
}
function createSchemaDefinition(def, config) {
    const schemaRoot = {};
    if (def.query) {
        schemaRoot.query = def.query.toString();
    }
    if (def.mutation) {
        schemaRoot.mutation = def.mutation.toString();
    }
    if (def.subscription) {
        schemaRoot.subscription = def.subscription.toString();
    }
    const fields = Object.keys(schemaRoot)
        .map(rootType => (schemaRoot[rootType] ? `${rootType}: ${schemaRoot[rootType]}` : null))
        .filter(a => a);
    if (fields.length) {
        return `schema { ${fields.join('\n')} }`;
    }
    else if (config && config.force) {
        return ` schema { query: Query } `;
    }
    return undefined;
}
function mergeGraphQLTypes(types, config) {
    comments_1.resetComments();
    const allNodes = types
        .map(type => {
        if (utils_1.isGraphQLSchema(type)) {
            let schema = type;
            let typesMap = type.getTypeMap();
            const validAstNodes = Object.keys(typesMap).filter(key => typesMap[key].astNode);
            if (validAstNodes.length === 0 && Object.keys(typesMap).length > 0) {
                schema = fixSchemaAst(schema, config);
                typesMap = schema.getTypeMap();
            }
            const schemaDefinition = createSchemaDefinition({
                query: schema.getQueryType(),
                mutation: schema.getMutationType(),
                subscription: schema.getSubscriptionType(),
            });
            const allTypesPrinted = Object.keys(typesMap)
                .map(typeName => {
                const type = typesMap[typeName];
                const isPredefinedScalar = type instanceof graphql_1.GraphQLScalarType && graphql_1.isSpecifiedScalarType(type);
                const isIntrospection = graphql_1.isIntrospectionType(type);
                if (isPredefinedScalar || isIntrospection) {
                    return null;
                }
                if (type.astNode) {
                    return graphql_1.print(type.extensionASTNodes ? extendDefinition(type) : type.astNode);
                }
                else {
                    // KAMIL: we might want to turn on descriptions in future
                    return graphql_1.printType(correctType(typeName, typesMap), { commentDescriptions: config.commentDescriptions });
                }
            })
                .filter(e => e);
            const directivesDeclaration = schema
                .getDirectives()
                .map(directive => (directive.astNode ? graphql_1.print(directive.astNode) : null))
                .filter(e => e);
            const printedSchema = [...directivesDeclaration, ...allTypesPrinted, schemaDefinition].join('\n');
            return graphql_1.parse(printedSchema);
        }
        else if (utils_1.isStringTypes(type) || utils_1.isSourceTypes(type)) {
            return graphql_1.parse(type);
        }
        return type;
    })
        .map(ast => ast.definitions)
        .reduce((defs, newDef = []) => [...defs, ...newDef], []);
    // XXX: right now we don't handle multiple schema definitions
    let schemaDef = allNodes.filter(utils_1.isSchemaDefinition).reduce((def, node) => {
        node.operationTypes
            .filter(op => op.type.name.value)
            .forEach(op => {
            def[op.operation] = op.type.name.value;
        });
        return def;
    }, {
        query: null,
        mutation: null,
        subscription: null,
    });
    const mergedNodes = merge_nodes_1.mergeGraphQLNodes(allNodes, config);
    const allTypes = Object.keys(mergedNodes);
    if (config && config.useSchemaDefinition) {
        const queryType = schemaDef.query ? schemaDef.query : allTypes.find(t => t === 'Query');
        const mutationType = schemaDef.mutation ? schemaDef.mutation : allTypes.find(t => t === 'Mutation');
        const subscriptionType = schemaDef.subscription ? schemaDef.subscription : allTypes.find(t => t === 'Subscription');
        schemaDef = {
            query: queryType,
            mutation: mutationType,
            subscription: subscriptionType,
        };
    }
    const schemaDefinition = createSchemaDefinition(schemaDef, {
        force: config.forceSchemaDefinition,
    });
    if (!schemaDefinition) {
        return Object.values(mergedNodes);
    }
    return [...Object.values(mergedNodes), graphql_1.parse(schemaDefinition).definitions[0]];
}
exports.mergeGraphQLTypes = mergeGraphQLTypes;
function extendDefinition(type) {
    switch (type.astNode.kind) {
        case graphql_1.Kind.OBJECT_TYPE_DEFINITION:
            return {
                ...type.astNode,
                fields: type.astNode.fields.concat(type.extensionASTNodes.reduce((fields, node) => fields.concat(node.fields), [])),
            };
        case graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION:
            return {
                ...type.astNode,
                fields: type.astNode.fields.concat(type.extensionASTNodes.reduce((fields, node) => fields.concat(node.fields), [])),
            };
        default:
            return type.astNode;
    }
}
function correctType(typeName, typesMap) {
    const type = typesMap[typeName];
    type.name = typeName.toString();
    return type;
}
//# sourceMappingURL=merge-typedefs.js.map