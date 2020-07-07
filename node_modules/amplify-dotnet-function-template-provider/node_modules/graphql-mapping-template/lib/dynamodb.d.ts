import { Expression, ReferenceNode, StringNode, ObjectNode, CompoundExpressionNode } from './ast';
export declare class DynamoDBMappingTemplate {
    /**
     * Create a put item resolver template.
     * @param keys A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    static putItem({ key, attributeValues, condition, }: {
        key: ObjectNode | Expression;
        attributeValues: Expression;
        condition?: ObjectNode | ReferenceNode;
    }, version?: string): ObjectNode;
    /**
     * Create a get item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    static getItem({ key, isSyncEnabled }: {
        key: ObjectNode | Expression;
        isSyncEnabled?: boolean;
    }): ObjectNode;
    /**
     * Create a query resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    static query({ query, scanIndexForward, filter, limit, nextToken, index, isSyncEnabled, }: {
        query: ObjectNode | Expression;
        scanIndexForward: Expression;
        filter: ObjectNode | Expression;
        limit: Expression;
        nextToken?: Expression;
        index?: StringNode;
        isSyncEnabled?: boolean;
    }): ObjectNode;
    /**
     * Create a list item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    static listItem({ filter, limit, nextToken, scanIndexForward, query, index, }: {
        filter: ObjectNode | Expression;
        limit: Expression;
        nextToken?: Expression;
        scanIndexForward?: Expression;
        query?: ObjectNode | Expression;
        index?: StringNode;
    }, version?: string): ObjectNode;
    /**
     * Creates a sync resolver template
     * @param param An object used when creating the operation request to appsync
     */
    static syncItem({ filter, limit, nextToken, lastSync, }: {
        filter?: ObjectNode | Expression;
        limit?: Expression;
        nextToken?: Expression;
        lastSync?: Expression;
    }): ObjectNode;
    /**
     * Create a delete item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    static deleteItem({ key, condition, isSyncEnabled, }: {
        key: ObjectNode | Expression;
        condition: ObjectNode | ReferenceNode;
        isSyncEnabled: boolean;
    }): ObjectNode;
    /**
     * Create an update item resolver template.
     * @param key
     */
    static updateItem({ key, condition, objectKeyVariable, nameOverrideMap, isSyncEnabled, }: {
        key: ObjectNode | Expression;
        condition: ObjectNode | ReferenceNode;
        objectKeyVariable: string;
        nameOverrideMap?: string;
        isSyncEnabled?: boolean;
    }): CompoundExpressionNode;
    static dynamoDBResponse(expression?: Expression): CompoundExpressionNode;
    static stringAttributeValue(value: Expression): ObjectNode;
    static numericAttributeValue(value: Expression): ObjectNode;
    static binaryAttributeValue(value: Expression): ObjectNode;
    static paginatedResponse(): ObjectNode;
}
