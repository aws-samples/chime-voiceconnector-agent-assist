import { CloudFormationParseContext } from '../types';
import { CloudFormationProcessedResourceResult } from '../stack/types';
export declare type LambdaFunctionConfig = CloudFormationProcessedResourceResult & {
    name: string;
    handler: string;
    basePath?: string;
    environment?: object;
};
export declare function lambdaFunctionHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext): LambdaFunctionConfig;
