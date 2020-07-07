import { isGraphQLEnum, isGraphQLInputType, isGraphQLInterface, isGraphQLScalar, isGraphQLType, isGraphQLUnion, isGraphQLDirective, isGraphQLTypeExtension, isGraphQLInputTypeExtension, isGraphQLEnumExtension, isGraphQLUnionExtension, isGraphQLScalarExtension, isGraphQLInterfaceExtension, } from './utils';
import { mergeType } from './type';
import { mergeEnum } from './enum';
import { mergeUnion } from './union';
import { mergeInputType } from './input-type';
import { mergeInterface } from './interface';
import { mergeDirective } from './directives';
import { collectComment } from './comments';
export function mergeGraphQLNodes(nodes, config) {
    return nodes.reduce((prev, nodeDefinition) => {
        const node = nodeDefinition;
        if (node && node.name && node.name.value) {
            const name = node.name.value;
            if (config && config.commentDescriptions) {
                collectComment(node);
            }
            if (config && config.exclusions && (config.exclusions.includes(name + '.*') || config.exclusions.includes(name))) {
                delete prev[name];
            }
            else if (isGraphQLType(nodeDefinition) || isGraphQLTypeExtension(nodeDefinition)) {
                prev[name] = mergeType(nodeDefinition, prev[name], config);
            }
            else if (isGraphQLEnum(nodeDefinition) || isGraphQLEnumExtension(nodeDefinition)) {
                prev[name] = mergeEnum(nodeDefinition, prev[name], config);
            }
            else if (isGraphQLUnion(nodeDefinition) || isGraphQLUnionExtension(nodeDefinition)) {
                prev[name] = mergeUnion(nodeDefinition, prev[name], config);
            }
            else if (isGraphQLScalar(nodeDefinition) || isGraphQLScalarExtension(nodeDefinition)) {
                prev[name] = nodeDefinition;
            }
            else if (isGraphQLInputType(nodeDefinition) || isGraphQLInputTypeExtension(nodeDefinition)) {
                prev[name] = mergeInputType(nodeDefinition, prev[name], config);
            }
            else if (isGraphQLInterface(nodeDefinition) || isGraphQLInterfaceExtension(nodeDefinition)) {
                prev[name] = mergeInterface(nodeDefinition, prev[name], config);
            }
            else if (isGraphQLDirective(nodeDefinition)) {
                prev[name] = mergeDirective(nodeDefinition, prev[name]);
            }
        }
        return prev;
    }, {});
}
//# sourceMappingURL=merge-nodes.js.map