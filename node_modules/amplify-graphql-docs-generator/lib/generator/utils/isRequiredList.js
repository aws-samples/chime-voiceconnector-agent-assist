"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function isRequired(typeObj) {
    return graphql_1.isNonNullType(typeObj) && graphql_1.isListType(typeObj.ofType);
}
exports.default = isRequired;
//# sourceMappingURL=isRequiredList.js.map