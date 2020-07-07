import Template from 'cloudform-types/types/template';
import Resource from 'cloudform-types/types/resource';
export declare class SchemaResourceUtil {
    makeResolverS3RootParams(): Template;
    makeEnvironmentConditions(): {
        [x: string]: import("cloudform-types").ConditionIntrinsicFunction;
    };
    updateResolverResource(resource: Resource): Resource;
    updateFunctionConfigurationResource(resource: Resource): Resource;
    makeAppSyncSchema(schema?: string): import("cloudform-types/types/appSync/graphQlSchema").default;
}
