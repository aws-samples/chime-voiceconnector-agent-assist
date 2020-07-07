"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function isRequired(typeObj) {
    if (graphql_1.isNonNullType(typeObj) && graphql_1.isListType(typeObj.ofType)) {
        // See if it's a Non-null List of Non-null Types
        return isRequired(typeObj.ofType.ofType);
    }
    if (graphql_1.isListType(typeObj)) {
        // See if it's a Nullable List of Non-null Types
        return graphql_1.isNonNullType(typeObj.ofType);
    }
    return graphql_1.isNonNullType(typeObj);
}
exports.default = isRequired;
//# sourceMappingURL=isRequired.js.map