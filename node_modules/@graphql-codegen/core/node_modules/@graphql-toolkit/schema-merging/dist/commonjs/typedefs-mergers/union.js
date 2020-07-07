"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const directives_1 = require("./directives");
const merge_named_type_array_1 = require("./merge-named-type-array");
function mergeUnion(first, second, config) {
    if (second) {
        return {
            name: first.name,
            description: first['description'] || second['description'],
            directives: directives_1.mergeDirectives(first.directives, second.directives, config),
            kind: first.kind === 'UnionTypeDefinition' || second.kind === 'UnionTypeDefinition' ? 'UnionTypeDefinition' : 'UnionTypeExtension',
            loc: first.loc,
            types: merge_named_type_array_1.mergeNamedTypeArray(first.types, second.types),
        };
    }
    if (first.kind === 'UnionTypeExtension') {
        throw new Error(`Unable to extend undefined GraphQL union: ${first.name}`);
    }
    return first;
}
exports.mergeUnion = mergeUnion;
//# sourceMappingURL=union.js.map