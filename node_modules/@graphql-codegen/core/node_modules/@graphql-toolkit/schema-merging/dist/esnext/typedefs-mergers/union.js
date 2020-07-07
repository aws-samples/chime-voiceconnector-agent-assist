import { mergeDirectives } from './directives';
import { mergeNamedTypeArray } from './merge-named-type-array';
export function mergeUnion(first, second, config) {
    if (second) {
        return {
            name: first.name,
            description: first['description'] || second['description'],
            directives: mergeDirectives(first.directives, second.directives, config),
            kind: first.kind === 'UnionTypeDefinition' || second.kind === 'UnionTypeDefinition' ? 'UnionTypeDefinition' : 'UnionTypeExtension',
            loc: first.loc,
            types: mergeNamedTypeArray(first.types, second.types),
        };
    }
    if (first.kind === 'UnionTypeExtension') {
        throw new Error(`Unable to extend undefined GraphQL union: ${first.name}`);
    }
    return first;
}
//# sourceMappingURL=union.js.map