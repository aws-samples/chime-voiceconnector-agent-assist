import { GraphQLScalarType } from 'graphql';
declare class AWSPhone extends GraphQLScalarType {
    constructor(options?: {
        name: any;
        description: any;
    });
}
export declare const scalars: {
    AWSJSON: any;
    AWSDate: GraphQLScalarType;
    AWSTime: GraphQLScalarType;
    AWSDateTime: GraphQLScalarType;
    AWSPhone: typeof AWSPhone;
    AWSEmail: GraphQLScalarType;
    AWSURL: GraphQLScalarType;
    AWSTimestamp: GraphQLScalarType;
    AWSIPAddress: GraphQLScalarType;
};
export declare function wrapSchema(schemaString: any): string;
export {};
