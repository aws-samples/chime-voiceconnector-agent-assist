import { DeploymentResources } from './DeploymentResources';
import { ITransformer } from './ITransformer';
import { TransformConfig } from './util';
/**
 * A generic transformation library that takes as input a graphql schema
 * written in SDL and a set of transformers that operate on it. At the
 * end of a transformation, a fully specified cloudformation template
 * is emitted.
 */
export interface GraphQLTransformOptions {
    transformers: ITransformer[];
    stackMapping?: StackMapping;
    transformConfig?: TransformConfig;
}
export declare type StackMapping = {
    [resourceId: string]: string;
};
export declare class GraphQLTransform {
    private transformers;
    private stackMappingOverrides;
    private transformConfig;
    private seenTransformations;
    constructor(options: GraphQLTransformOptions);
    /**
     * Reduces the final context by running the set of transformers on
     * the schema. Each transformer returns a new context that is passed
     * on to the next transformer. At the end of the transformation a
     * cloudformation template is returned.
     * @param schema The model schema.
     * @param references Any cloudformation references.
     */
    transform(schema: string): DeploymentResources;
    private updateContextForStackMappingOverrides;
    private createResourcesForSyncEnabledProject;
    private transformObject;
    private transformField;
    private transformArgument;
    private transformInterface;
    private transformScalar;
    private transformUnion;
    private transformEnum;
    private transformEnumValue;
    private transformInputObject;
    private transformInputField;
}
