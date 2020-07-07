"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const type_1 = require("./type");
const enum_1 = require("./enum");
const union_1 = require("./union");
const input_type_1 = require("./input-type");
const interface_1 = require("./interface");
const directives_1 = require("./directives");
const comments_1 = require("./comments");
function mergeGraphQLNodes(nodes, config) {
    return nodes.reduce((prev, nodeDefinition) => {
        const node = nodeDefinition;
        if (node && node.name && node.name.value) {
            const name = node.name.value;
            if (config && config.commentDescriptions) {
                comments_1.collectComment(node);
            }
            if (config && config.exclusions && (config.exclusions.includes(name + '.*') || config.exclusions.includes(name))) {
                delete prev[name];
            }
            else if (utils_1.isGraphQLType(nodeDefinition) || utils_1.isGraphQLTypeExtension(nodeDefinition)) {
                prev[name] = type_1.mergeType(nodeDefinition, prev[name], config);
            }
            else if (utils_1.isGraphQLEnum(nodeDefinition) || utils_1.isGraphQLEnumExtension(nodeDefinition)) {
                prev[name] = enum_1.mergeEnum(nodeDefinition, prev[name], config);
            }
            else if (utils_1.isGraphQLUnion(nodeDefinition) || utils_1.isGraphQLUnionExtension(nodeDefinition)) {
                prev[name] = union_1.mergeUnion(nodeDefinition, prev[name], config);
            }
            else if (utils_1.isGraphQLScalar(nodeDefinition) || utils_1.isGraphQLScalarExtension(nodeDefinition)) {
                prev[name] = nodeDefinition;
            }
            else if (utils_1.isGraphQLInputType(nodeDefinition) || utils_1.isGraphQLInputTypeExtension(nodeDefinition)) {
                prev[name] = input_type_1.mergeInputType(nodeDefinition, prev[name], config);
            }
            else if (utils_1.isGraphQLInterface(nodeDefinition) || utils_1.isGraphQLInterfaceExtension(nodeDefinition)) {
                prev[name] = interface_1.mergeInterface(nodeDefinition, prev[name], config);
            }
            else if (utils_1.isGraphQLDirective(nodeDefinition)) {
                prev[name] = directives_1.mergeDirective(nodeDefinition, prev[name]);
            }
        }
        return prev;
    }, {});
}
exports.mergeGraphQLNodes = mergeGraphQLNodes;
//# sourceMappingURL=merge-nodes.js.map