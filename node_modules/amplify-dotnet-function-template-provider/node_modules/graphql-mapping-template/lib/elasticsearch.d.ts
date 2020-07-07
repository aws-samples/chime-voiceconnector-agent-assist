import { Expression, ObjectNode, CompoundExpressionNode, ListNode } from './ast';
export declare class ElasticsearchMappingTemplate {
    /**
     * Create a mapping template for ES.
     */
    static genericTemplte({ operation, path, params, }: {
        operation: Expression;
        path: Expression;
        params: Expression | ObjectNode | CompoundExpressionNode;
    }): ObjectNode;
    /**
     * Create a search item resolver template.
     * @param size the size limit
     * @param from the next token
     * @param query the query
     */
    static searchItem({ query, size, search_after, path, sort, }: {
        path: Expression;
        sort?: Expression | ObjectNode;
        query?: ObjectNode | Expression;
        size?: Expression;
        search_after?: Expression | ListNode;
    }): ObjectNode;
}
