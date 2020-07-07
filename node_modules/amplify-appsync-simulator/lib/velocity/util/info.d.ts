import { GraphQLResolveInfo } from 'graphql';
export declare function createInfo(info: GraphQLResolveInfo): {
    fieldName: string;
    variables: {
        [variableName: string]: any;
    };
    parentTypeName: import("graphql").GraphQLObjectType<any, any, {
        [key: string]: any;
    }>;
    selectionSetList: any[];
    selectionSetGraphQL: string;
};
