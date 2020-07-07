import { Request } from 'express';
export declare type AppSyncMockFile = {
    path?: string;
    content: string;
};
export declare type AppSyncVTLTemplate = AppSyncMockFile;
export declare type AppSyncSimulatorFunctionsConfig = {
    name: string;
    dataSourceName: string;
    requestMappingTemplateLocation: string;
    responseMappingTemplateLocation: string;
};
export declare enum RESOLVER_KIND {
    UNIT = "UNIT",
    PIPELINE = "PIPELINE"
}
export interface AppSyncSimulatorBaseResolverConfig {
    requestMappingTemplateLocation?: string;
    responseMappingTemplateLocation?: string;
    requestMappingTemplate?: string;
    responseMappingTemplate?: string;
}
export interface AppSyncSimulatorUnitResolverConfig extends AppSyncSimulatorBaseResolverConfig {
    kind: RESOLVER_KIND.UNIT;
    fieldName: string;
    typeName: string;
    dataSourceName: string;
}
export interface AppSyncSimulatorPipelineResolverConfig extends AppSyncSimulatorBaseResolverConfig {
    kind: RESOLVER_KIND.PIPELINE;
    typeName: string;
    fieldName: string;
    functions: string[];
}
export interface AppSyncSimulatorFunctionResolverConfig extends AppSyncSimulatorBaseResolverConfig {
    dataSourceName: string;
}
export declare type AppSyncSimulatorMappingTemplate = AppSyncMockFile;
export declare type AppSyncSimulatorTable = string;
export interface AppSyncSimulatorUnitResolver extends AppSyncSimulatorUnitResolverConfig {
    datSourceName: string;
}
export interface AppSyncSimulatorPipelineResolver extends AppSyncSimulatorUnitResolverConfig {
    functions: string[];
}
export interface AppSyncSimulatorDataSourceBaseConfig {
    name: string;
    type: string;
}
export interface AppSyncSimulatorDataSourceDDBConfig extends AppSyncSimulatorDataSourceBaseConfig {
    type: 'AMAZON_DYNAMODB';
    config: {
        endpoint: string;
        region?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        tableName: string;
    };
}
export interface AppSyncSimulatorDataSourceNoneConfig extends AppSyncSimulatorDataSourceBaseConfig {
    type: 'None';
}
export interface AppSyncSimulatorDataSourceLambdaConfig extends AppSyncSimulatorDataSourceBaseConfig {
    type: 'AWS_LAMBDA';
    invoke: Function;
}
export declare type AppSyncSimulatorDataSourceConfig = AppSyncSimulatorDataSourceDDBConfig | AppSyncSimulatorDataSourceNoneConfig | AppSyncSimulatorDataSourceLambdaConfig;
export declare type AppSyncSimulatorSchemaConfig = AppSyncMockFile;
export declare enum AmplifyAppSyncSimulatorAuthenticationType {
    API_KEY = "API_KEY",
    AWS_IAM = "AWS_IAM",
    AMAZON_COGNITO_USER_POOLS = "AMAZON_COGNITO_USER_POOLS",
    OPENID_CONNECT = "OPENID_CONNECT"
}
export declare type AmplifyAppSyncAuthenticationProviderAPIConfig = {
    authenticationType: AmplifyAppSyncSimulatorAuthenticationType.API_KEY;
};
export declare type AmplifyAppSyncAuthenticationProviderIAMConfig = {
    authenticationType: AmplifyAppSyncSimulatorAuthenticationType.AWS_IAM;
};
export declare type AmplifyAppSyncAuthenticationProviderCognitoConfig = {
    authenticationType: AmplifyAppSyncSimulatorAuthenticationType.AMAZON_COGNITO_USER_POOLS;
    cognitoUserPoolConfig: {
        AppIdClientRegex?: string;
    };
};
export declare type AmplifyAppSyncAuthenticationProviderOIDCConfig = {
    authenticationType: AmplifyAppSyncSimulatorAuthenticationType.OPENID_CONNECT;
    openIDConnectConfig: {
        Issuer?: string;
        ClientId?: string;
    };
};
export declare type AmplifyAppSyncAuthenticationProviderConfig = AmplifyAppSyncAuthenticationProviderAPIConfig | AmplifyAppSyncAuthenticationProviderIAMConfig | AmplifyAppSyncAuthenticationProviderCognitoConfig | AmplifyAppSyncAuthenticationProviderOIDCConfig;
export declare type AmplifyAppSyncAPIConfig = {
    name: string;
    defaultAuthenticationType: AmplifyAppSyncAuthenticationProviderConfig;
    apiKey?: string;
    additionalAuthenticationProviders: AmplifyAppSyncAuthenticationProviderConfig[];
};
export declare type AmplifyAppSyncSimulatorConfig = {
    schema: AppSyncSimulatorSchemaConfig;
    resolvers?: (AppSyncSimulatorUnitResolverConfig | AppSyncSimulatorPipelineResolverConfig)[];
    functions?: AppSyncSimulatorFunctionsConfig[];
    dataSources?: AppSyncSimulatorDataSourceConfig[];
    mappingTemplates?: AppSyncSimulatorMappingTemplate[];
    tables?: AppSyncSimulatorTable[];
    appSync: AmplifyAppSyncAPIConfig;
};
export declare type AppSyncSimulatorServerConfig = {
    port?: number;
    wsPort?: number;
};
export declare type AmplifyAppSyncSimulatorRequestContext = {
    jwt?: object;
    requestAuthorizationMode: AmplifyAppSyncSimulatorAuthenticationType;
    request: Request;
    appsyncErrors: {};
};
