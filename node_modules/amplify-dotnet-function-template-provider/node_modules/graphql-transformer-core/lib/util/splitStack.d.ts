import Template from 'cloudform-types/types/template';
/**
 * Stack resources
 */
export interface NestedStacks {
    rootStack: Template;
    stacks: {
        [name: string]: Template;
    };
    stackMapping: {
        [resourceId: string]: string;
    };
}
export declare type StackRules = Map<string, string>;
export interface SplitStackOptions {
    stack: Template;
    stackRules: StackRules;
    rootStackName?: string;
    defaultParameterValues?: {
        [k: string]: any;
    };
    defaultParameterDefinitions?: {
        [k: string]: any;
    };
    defaultDependencies?: string[];
    importExportPrefix: any;
    deployment: {
        deploymentBucketParameterName: string;
        deploymentKeyParameterName: string;
    };
}
export default function splitStack(opts: SplitStackOptions): NestedStacks;
