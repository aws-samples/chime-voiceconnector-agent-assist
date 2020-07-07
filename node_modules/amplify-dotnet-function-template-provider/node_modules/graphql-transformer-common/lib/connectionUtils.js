"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var definition_1 = require("./definition");
var ModelResourceIDs_1 = require("./ModelResourceIDs");
function makeConnectionField(fieldName, returnTypeName, args) {
    if (args === void 0) { args = []; }
    return definition_1.makeField(fieldName, __spreadArrays(args, [
        definition_1.makeInputValueDefinition('filter', definition_1.makeNamedType(ModelResourceIDs_1.ModelResourceIDs.ModelFilterInputTypeName(returnTypeName))),
        definition_1.makeInputValueDefinition('limit', definition_1.makeNamedType('Int')),
        definition_1.makeInputValueDefinition('nextToken', definition_1.makeNamedType('String')),
    ]), definition_1.makeNamedType(ModelResourceIDs_1.ModelResourceIDs.ModelConnectionTypeName(returnTypeName)));
}
exports.makeConnectionField = makeConnectionField;
//# sourceMappingURL=connectionUtils.js.map