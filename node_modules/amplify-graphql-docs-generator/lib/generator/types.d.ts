import { GraphQLEnumType, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLObjectType, GraphQLScalarType, GraphQLUnionType } from 'graphql';
export declare type GQLConcreteType = GraphQLScalarType | GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | GraphQLEnumType | GraphQLInputObjectType;
export declare type GQLTemplateFragment = {
    on: string;
    fields: Array<GQLTemplateField>;
    external: boolean;
    name: string;
};
export declare enum GQLOperationTypeEnum {
    QUERY = "query",
    MUTATION = "mutation",
    SUBSCRIPTION = "subscription"
}
export declare type GQLTemplateField = {
    name: string;
    fields: Array<GQLTemplateField>;
    fragments: Array<GQLTemplateFragment>;
    hasBody: boolean;
};
export declare type GQLTemplateArgDeclaration = {
    name: string;
    type: string;
    isRequired: boolean;
    isList: boolean;
    isListRequired: boolean;
    defaultValue: string | null;
};
export declare type GQLTemplateArgInvocation = {
    name: string;
    value: string;
};
export declare type GQLTemplateOpBody = GQLTemplateField & {
    args: Array<GQLTemplateArgInvocation>;
};
export declare type GQLTemplateGenericOp = {
    args: Array<GQLTemplateArgDeclaration>;
    body: GQLTemplateOpBody;
};
export declare type GQLTemplateOp = GQLTemplateGenericOp & {
    type: GQLOperationTypeEnum;
    name: string;
};
export declare type GQLAllOperations = {
    queries: Array<GQLTemplateOp>;
    mutations: Array<GQLTemplateOp>;
    subscriptions: Array<GQLTemplateOp>;
    fragments: Array<GQLTemplateFragment>;
};
export declare type GQLDocsGenOptions = {
    useExternalFragmentForS3Object: boolean;
};
