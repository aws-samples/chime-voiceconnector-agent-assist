import { InputObjectTypeDefinitionNode, TypeNode, FieldDefinitionNode } from 'graphql';
export declare function makeModelScalarKeyConditionInputObject(type: string): InputObjectTypeDefinitionNode;
export declare function makeScalarKeyConditionInputs(): InputObjectTypeDefinitionNode[];
export declare function makeScalarKeyConditionForType(type: TypeNode, nonScalarTypeResolver?: (baseType: string) => string): InputObjectTypeDefinitionNode;
/**
 * Given a list of key fields, create a composite key input type for the sort key condition.
 * Given,
 * type User @model @key(fields: ["a", "b", "c"]) { a: String, b: String, c: String }
 * a composite key will be formed over "a" and "b". This will output:
 * input UserPrimaryCompositeKeyConditionInput {
 *   beginsWith: UserPrimaryCompositeKeyInput,
 *   between: [UserPrimaryCompositeKeyInput],
 *   eq, le, lt, gt, ge: UserPrimaryCompositeKeyInput
 * }
 * input UserPrimaryCompositeKeyInput {
 *   b: String
 *   c: String
 * }
 */
export declare function makeCompositeKeyConditionInputForKey(modelName: string, keyName: string, fields: FieldDefinitionNode[]): InputObjectTypeDefinitionNode;
export declare function makeCompositeKeyInputForKey(modelName: string, keyName: string, fields: FieldDefinitionNode[]): InputObjectTypeDefinitionNode;
/**
 * Key conditions materialize as instances of ModelXKeyConditionInput passed via $ctx.args.
 * If the arguments with the given sortKey name exists, create a DynamoDB expression that
 * implements its logic. Possible operators: eq, le, lt, ge, gt, beginsWith, and between.
 * @param argName The name of the argument containing the sort key condition object.
 * @param attributeType The type of the DynamoDB attribute in the table.
 * @param queryExprReference The name of the variable containing the query expression in the template.
 */
export declare function applyKeyConditionExpression(argName: string, attributeType?: 'S' | 'N' | 'B', queryExprReference?: string, sortKeyName?: string, prefixVariableName?: string): import("graphql-mapping-template").CompoundExpressionNode;
/**
 * Key conditions materialize as instances of ModelXKeyConditionInput passed via $ctx.args.
 * If the arguments with the given sortKey name exists, create a DynamoDB expression that
 * implements its logic. Possible operators: eq, le, lt, ge, gt, beginsWith, and between.
 * @param argName The name of the argument containing the sort key condition object.
 * @param attributeType The type of the DynamoDB attribute in the table.
 * @param queryExprReference The name of the variable containing the query expression in the template.
 */
export declare function applyCompositeKeyConditionExpression(keyNames: string[], queryExprReference: string, sortKeyArgumentName: string, sortKeyAttributeName: string): import("graphql-mapping-template").CompoundExpressionNode;
/**
 * Key conditions materialize as instances of ModelXKeyConditionInput passed via $ctx.args.
 * If the arguments with the given sortKey name exists, create a DynamoDB expression that
 * implements its logic. Possible operators: eq, le, lt, ge, gt, beginsWith, and between.
 * @param argName The name of the argument containing the sort key condition object.
 * @param attributeType The type of the DynamoDB attribute in the table.
 * @param queryExprReference The name of the variable containing the query expression in the template.
 * @param compositeKeyName When handling a managed composite key from @key the name of the arg and underlying fields are different.
 * @param compositeKeyValue When handling a managed composite key from @key the value of the composite key is made up of multiple parts known by the caller.
 */
export declare function applyKeyExpressionForCompositeKey(keys: string[], attributeTypes?: ('S' | 'N' | 'B')[], queryExprReference?: string): import("graphql-mapping-template").IfNode | import("graphql-mapping-template").CompoundExpressionNode;
