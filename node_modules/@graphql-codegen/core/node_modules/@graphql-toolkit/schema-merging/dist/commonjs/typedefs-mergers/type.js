"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fields_1 = require("./fields");
const directives_1 = require("./directives");
const merge_named_type_array_1 = require("./merge-named-type-array");
function mergeType(node, existingNode, config) {
    if (existingNode) {
        try {
            return {
                name: node.name,
                description: node['description'] || existingNode['description'],
                kind: node.kind === 'ObjectTypeDefinition' || existingNode.kind === 'ObjectTypeDefinition' ? 'ObjectTypeDefinition' : 'ObjectTypeExtension',
                loc: node.loc,
                fields: fields_1.mergeFields(node, node.fields, existingNode.fields, config),
                directives: directives_1.mergeDirectives(node.directives, existingNode.directives, config),
                interfaces: merge_named_type_array_1.mergeNamedTypeArray(node.interfaces, existingNode.interfaces),
            };
        }
        catch (e) {
            throw new Error(`Unable to merge GraphQL type "${node.name.value}": ${e.message}`);
        }
    }
    return node;
}
exports.mergeType = mergeType;
//# sourceMappingURL=type.js.map