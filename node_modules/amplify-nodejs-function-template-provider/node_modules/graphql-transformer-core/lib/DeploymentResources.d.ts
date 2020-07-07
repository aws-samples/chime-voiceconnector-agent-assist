import { NestedStacks } from './util/splitStack';
export declare type StringMap = {
    [path: string]: string;
};
export declare type ResolverMap = StringMap;
export declare type PipelineFunctionMap = StringMap;
export interface ResolversFunctionsAndSchema {
    resolvers: ResolverMap;
    pipelineFunctions: PipelineFunctionMap;
    functions: {
        [path: string]: string;
    };
    schema: string;
}
export interface StackMapping {
    [resourceId: string]: string;
}
/**
 * The full set of resources needed for the deployment.
 */
export interface DeploymentResources extends ResolversFunctionsAndSchema, NestedStacks {
    stackMapping: StackMapping;
}
export default DeploymentResources;
