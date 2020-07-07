export declare type CloudFormationParameter = {
    Type: string;
    Description?: string;
    Default?: String | Number;
};
export declare type CloudFormationFnIf = {
    'Fn::If': [string, CloudFormationIntrinsicFunction, CloudFormationIntrinsicFunction];
};
export declare type CloudFormationFnAnd = {
    'Fn::And': CloudFormationIntrinsicFunction[];
};
export declare type CloudFormationFnEqual = {
    'Fn::Equals': [CloudFormationIntrinsicFunction, CloudFormationIntrinsicFunction];
};
export declare type CloudFormationFnNot = {
    'Fn::Not': [CloudFormationIntrinsicFunction];
};
export declare type CloudFormationFnOr = {
    'Fn::Or': CloudFormationIntrinsicFunction[];
};
export declare type CloudFormationFnFindInMap = {
    'Fn::FindInMap': [string, CloudFormationIntrinsicFunction, CloudFormationIntrinsicFunction];
};
export declare type CloudFormationRef = {
    Ref: string;
};
export declare type CloudFormationFnGetAtt = {
    'Fn::GetAtt': [string, CloudFormationRef | string];
};
export declare type CloudFormationFnBase64 = {
    'Fn::Base64': string;
};
export declare type CloudFormationFnImportValue = {
    'Fn::ImportValue': CloudFormationIntrinsicFunction;
};
export declare type CloudFormationFnJoin = {
    'Fn::Join': [string, CloudFormationIntrinsicFunction[]];
};
export declare type CloudFormationFnSelect = {
    'Fn::Select': [number, ...CloudFormationIntrinsicFunction[]];
};
export declare type CloudFormationFnSplit = {
    'Fn::Split': [string, ...CloudFormationIntrinsicFunction[]];
};
export declare type CloudFormationFnSub = {
    'Fn::Sub': [string, ...CloudFormationIntrinsicFunction[]];
};
export declare type CloudFormationIntrinsicConditionFunction = CloudFormationFnIf | CloudFormationFnAnd | CloudFormationFnEqual | CloudFormationFnNot | CloudFormationFnOr;
export declare type CloudFormationIntrinsicFunction = String | CloudFormationIntrinsicConditionFunction | CloudFormationFnFindInMap | CloudFormationRef | CloudFormationFnGetAtt | CloudFormationFnImportValue | CloudFormationFnJoin | CloudFormationFnSelect | CloudFormationFnSplit | CloudFormationFnSub;
export declare type CloudFormationProperty = string | CloudFormationIntrinsicFunction;
export interface CloudFormationResourceProperty {
    [name: string]: CloudFormationIntrinsicFunction | CloudFormationResourceProperty;
}
export declare type CloudFormationResource = {
    Type: string;
    Properties: CloudFormationResourceProperty;
    DependsOn?: string[];
    Condition?: string;
};
export declare type CloudFormationResources = Record<string, CloudFormationResource>;
export declare type CloudFormationOutput = {
    Value: CloudFormationIntrinsicFunction;
    Description?: string;
    Export?: {
        Name: string | CloudFormationIntrinsicFunction;
    };
};
export declare type CloudFormationOutputs = Record<string, CloudFormationOutput>;
export declare type CloudFormationConditions = Record<string, CloudFormationIntrinsicConditionFunction>;
export declare type CloudFormationParameters = Record<string, CloudFormationParameter>;
export declare type CloudFormationTemplate = {
    Parameters?: CloudFormationParameters;
    Resources: CloudFormationResources;
    Conditions?: CloudFormationConditions;
    Outputs?: CloudFormationOutputs;
};
export declare type CloudFormationProcessedResourceResult = {
    cfnExposedAttributes: Record<string, string>;
    arn?: string;
    ref?: String;
};
export declare type CloudFormationProcessedResource = {
    Type: String;
    result: CloudFormationProcessedResourceResult;
};
export declare type CloudFormationTemplateFetcher = {
    getCloudFormationStackTemplate: (templateName: string) => CloudFormationTemplate;
};
