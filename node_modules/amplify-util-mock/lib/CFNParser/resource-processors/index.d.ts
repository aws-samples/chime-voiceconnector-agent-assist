import { CloudFormationResource } from '../stack/types';
import { CloudFormationParseContext } from '../types';
export declare type CloudFormationResourceProcessorFn = (resourceName: string, resource: CloudFormationResource, cfnContext: CloudFormationParseContext) => any;
export declare function getResourceProcessorFor(resourceType: string): CloudFormationResourceProcessorFn;
export declare function registerResourceProcessors(resourceType: string, resourceProcessor: CloudFormationResourceProcessorFn): void;
export declare function registerAppSyncResourceProcessor(): void;
export declare function registerIAMResourceProcessor(): void;
export declare function registerLambdaResourceProcessor(): void;
