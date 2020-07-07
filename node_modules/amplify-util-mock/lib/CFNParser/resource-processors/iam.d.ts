import { CloudFormationParseContext } from '../types';
export declare function iamPolicyResourceHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext): {
    cfnExposedAttributes: {};
    ref: string;
};
export declare function iamRoleResourceHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext): {
    cfnExposedAttributes: {
        Arn: string;
        RoleId: string;
    };
    ref: string;
    Arn: string;
    RoleId: string;
};
