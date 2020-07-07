"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function extractFieldResolversFromObjectType(objectType, options) {
    const fieldResolvers = {};
    const fieldMap = objectType.getFields();
    let selectedFieldNames;
    if (options && options.selectedTypeDefs) {
        const invalidSchema = graphql_1.buildASTSchema(options.selectedTypeDefs);
        const typeMap = invalidSchema.getTypeMap();
        if (!(objectType.name in typeMap)) {
            return {};
        }
        else {
            const selectedObjectType = typeMap[objectType.name];
            selectedFieldNames = Object.keys(selectedObjectType.getFields());
        }
    }
    for (const fieldName in fieldMap) {
        if (selectedFieldNames && !selectedFieldNames.includes(fieldName)) {
            continue;
        }
        const fieldDefinition = fieldMap[fieldName];
        fieldResolvers[fieldName] = {
            subscribe: fieldDefinition.subscribe,
            resolve: fieldDefinition.resolve,
        };
    }
    if ('resolveType' in objectType) {
        fieldResolvers['__resolveType'] = objectType.resolveType;
    }
    if ('isTypeOf' in objectType) {
        fieldResolvers['__isTypeOf'] = objectType.isTypeOf;
    }
    return fieldResolvers;
}
exports.extractFieldResolversFromObjectType = extractFieldResolversFromObjectType;
//# sourceMappingURL=extract-field-resolvers-from-object-type.js.map