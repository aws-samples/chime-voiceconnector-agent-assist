import Template from 'cloudform-types/types/template';
import Resource from 'cloudform-types/types/resource';
import Parameter from 'cloudform-types/types/parameter';
import { Condition } from 'cloudform-types/types/dataTypes';
import Output from 'cloudform-types/types/output';
import { TypeSystemDefinitionNode, ObjectTypeDefinitionNode, FieldDefinitionNode, InputObjectTypeDefinitionNode, SchemaDefinitionNode, ObjectTypeExtensionNode, DocumentNode, EnumTypeDefinitionNode, TypeDefinitionNode } from 'graphql';
import { InterfaceTypeExtensionNode, UnionTypeExtensionNode, EnumTypeExtensionNode, InputObjectTypeExtensionNode } from 'graphql/language/ast';
import { ResolverConfig } from './util';
export interface MappingParameters {
    [key: string]: {
        [key: string]: {
            [key: string]: string | number | string[];
        };
    };
}
export declare function blankObject(name: string): ObjectTypeDefinitionNode;
export declare function objectExtension(name: string, fields?: FieldDefinitionNode[]): ObjectTypeExtensionNode;
export declare class TransformerContextMetadata {
    /**
     * Used by transformers to pass information between one another.
     */
    private metadata;
    get(key: string): any;
    set(key: string, val: any): void;
    has(key: string): boolean;
}
/**
 * The stack mapping defines a full mapping from resource id
 * to the stack that it belongs to. When transformers add
 * resources to the context, they add an entry to the
 * stack mapping and that resource will be pulled into the related stack
 * automatically.
 */
export declare type StackMapping = Map<string, string>;
/**
 * The transformer context is responsible for accumulating the resources,
 * types, and parameters necessary to support an AppSync transform.
 */
export declare class TransformerContext {
    template: Template;
    nodeMap: {
        [name: string]: TypeSystemDefinitionNode;
    };
    inputDocument: DocumentNode;
    metadata: TransformerContextMetadata;
    private stackMapping;
    private resolverConfig;
    private transformerVersion;
    constructor(inputSDL: string);
    /**
     * Before running the transformers, first flush the input document
     * into the node map. If a schema definition node then leave everything
     * as is so customers can explicitly turn off mutations & subscriptions.
     * If a SDN is not provided then we add the default schema and empty
     * Query, Mutation, and Subscription
     */
    private fillNodeMapWithInput;
    /**
     * Scans through the context nodeMap and returns all type definition nodes
     * that are of the given kind.
     * @param kind Kind value of type definition nodes expected.
     */
    getTypeDefinitionsOfKind(kind: string): TypeDefinitionNode[];
    mergeResources(resources: {
        [key: string]: Resource;
    }): void;
    mergeParameters(params: {
        [key: string]: Parameter;
    }): void;
    mergeConditions(conditions: {
        [key: string]: Condition;
    }): void;
    getResource(resource: string): Resource;
    setResource(key: string, resource: Resource): void;
    setOutput(key: string, output: Output): void;
    getOutput(key: string): Output;
    mergeOutputs(outputs: {
        [key: string]: Output;
    }): void;
    mergeMappings(mapping: MappingParameters): void;
    /**
     * Add an object type definition node to the context. If the type already
     * exists an error will be thrown.
     * @param obj The object type definition node to add.
     */
    putSchema(obj: SchemaDefinitionNode): void;
    /**
     * Returns the schema definition record. If the user provides a schema
     * definition as part of the input document, that node is returned.
     * Otherwise a blank schema definition with default operation types
     * is returned.
     */
    getSchema(): SchemaDefinitionNode;
    getQueryTypeName(): string | undefined;
    getQuery(): ObjectTypeDefinitionNode | undefined;
    getMutationTypeName(): string | undefined;
    getMutation(): ObjectTypeDefinitionNode | undefined;
    getSubscriptionTypeName(): string | undefined;
    getSubscription(): ObjectTypeDefinitionNode | undefined;
    /**
     * Add a generic type.
     * @param obj The type to add
     */
    addType(obj: TypeDefinitionNode): void;
    putType(obj: TypeDefinitionNode): void;
    getType(name: string): TypeSystemDefinitionNode | undefined;
    /**
     * Add an object type definition node to the context. If the type already
     * exists an error will be thrown.
     * @param obj The object type definition node to add.
     */
    addObject(obj: ObjectTypeDefinitionNode): void;
    updateObject(obj: ObjectTypeDefinitionNode): void;
    getObject(name: string): ObjectTypeDefinitionNode | undefined;
    /**
     * Extends the context query object with additional fields.
     * If the customer uses a name other than 'Query' this will proxy to the
     * correct type.
     * @param fields The fields to add the query type.
     */
    addQueryFields(fields: FieldDefinitionNode[]): void;
    /**
     * Extends the context mutation object with additional fields.
     * If the customer uses a name other than 'Mutation' this will proxy to the
     * correct type.
     * @param fields The fields to add the mutation type.
     */
    addMutationFields(fields: FieldDefinitionNode[]): void;
    /**
     * Extends the context subscription object with additional fields.
     * If the customer uses a name other than 'Subscription' this will proxy to the
     * correct type.
     * @param fields The fields to add the subscription type.
     */
    addSubscriptionFields(fields: FieldDefinitionNode[]): void;
    /**
     * Add an object type extension definition node to the context. If a type with this
     * name does not already exist, an exception is thrown.
     * @param obj The object type definition node to add.
     */
    addObjectExtension(obj: ObjectTypeExtensionNode): void;
    /**
     * Add an input object type extension definition node to the context. If a type with this
     * name does not already exist, an exception is thrown.
     * @param obj The input object type definition node to add.
     */
    addInputExtension(obj: InputObjectTypeExtensionNode): void;
    /**
     * Add an interface extension definition node to the context. If a type with this
     * name does not already exist, an exception is thrown.
     * @param obj The interface type definition node to add.
     */
    addInterfaceExtension(obj: InterfaceTypeExtensionNode): void;
    /**
     * Add an union extension definition node to the context. If a type with this
     * name does not already exist, an exception is thrown.
     * @param obj The union type definition node to add.
     */
    addUnionExtension(obj: UnionTypeExtensionNode): void;
    /**
     * Add an enum extension definition node to the context. If a type with this
     * name does not already exist, an exception is thrown.
     * @param obj The enum type definition node to add.
     */
    addEnumExtension(obj: EnumTypeExtensionNode): void;
    /**
     * Add an input type definition node to the context.
     * @param inp The input type definition node to add.
     */
    addInput(inp: InputObjectTypeDefinitionNode): void;
    /**
     * Add an enum type definition node to the context.
     * @param en The enum type definition node to add.
     */
    addEnum(en: EnumTypeDefinitionNode): void;
    /**
     * Add an item to the stack mapping.
     * @param stackName The destination stack name.
     * @param resource The resource id that should be put into the stack.
     */
    mapResourceToStack(stackName: string, resource: string): void;
    getStackMapping(): StackMapping;
    /**
     * Setter and getter the sync config
     */
    setResolverConfig(resolverConfig: ResolverConfig): void;
    getResolverConfig(): ResolverConfig;
    setTransformerVersion(version: Number): void;
    getTransformerVersion(): Number;
}
