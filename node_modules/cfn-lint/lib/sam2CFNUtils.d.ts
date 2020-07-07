import * as awsData from './awsData';
export declare function toAWSPrimitiveTypes(x: string): string[];
export declare function buildResourceProperty(propertyTypes: string[], isRequired?: boolean): awsData.Property;
export declare function resolveTypeProperties(typeDef: any): {};
export declare function processDefinition(type: string, typeDef: any, awsResourcesSpec: any): void;
export declare function samResourcesSpecification(samSchema: any, customSpecification: any): awsData.AWSResourcesSpecification;
