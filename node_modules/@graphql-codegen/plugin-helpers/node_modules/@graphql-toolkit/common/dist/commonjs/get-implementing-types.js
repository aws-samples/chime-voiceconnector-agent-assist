"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function getImplementingTypes(interfaceName, schema) {
    const allTypesMap = schema.getTypeMap();
    const result = [];
    for (const graphqlType of Object.values(allTypesMap)) {
        if (graphqlType instanceof graphql_1.GraphQLObjectType) {
            const allInterfaces = graphqlType.getInterfaces();
            if (allInterfaces.find(int => int.name === interfaceName)) {
                result.push(graphqlType.name);
            }
        }
    }
    return result;
}
exports.getImplementingTypes = getImplementingTypes;
//# sourceMappingURL=get-implementing-types.js.map