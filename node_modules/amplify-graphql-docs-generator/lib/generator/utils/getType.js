"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function getType(typeObj) {
    if (typeObj instanceof graphql_1.GraphQLList || typeObj instanceof graphql_1.GraphQLNonNull) {
        return getType(typeObj.ofType);
    }
    return typeObj;
}
exports.default = getType;
//# sourceMappingURL=getType.js.map