"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function isList(typeObj) {
    if (graphql_1.isNonNullType(typeObj)) {
        return isList(typeObj.ofType);
    }
    return graphql_1.isListType(typeObj);
}
exports.default = isList;
//# sourceMappingURL=isList.js.map