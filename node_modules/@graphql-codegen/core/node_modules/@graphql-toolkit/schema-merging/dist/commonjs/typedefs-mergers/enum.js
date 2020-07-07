"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const directives_1 = require("./directives");
const enum_values_1 = require("./enum-values");
function mergeEnum(e1, e2, config) {
    if (e2) {
        return {
            name: e1.name,
            description: e1['description'] || e2['description'],
            kind: e1.kind === 'EnumTypeDefinition' || e2.kind === 'EnumTypeDefinition' ? 'EnumTypeDefinition' : 'EnumTypeExtension',
            loc: e1.loc,
            directives: directives_1.mergeDirectives(e1.directives, e2.directives, config),
            values: enum_values_1.mergeEnumValues(e1.values, e2.values),
        };
    }
    return e1;
}
exports.mergeEnum = mergeEnum;
//# sourceMappingURL=enum.js.map