import { Template } from 'cloudform-types';
import { ProjectOptions } from './amplifyUtils';
export declare const TRANSFORM_CONFIG_FILE_NAME = "transform.conf.json";
export declare const TRANSFORM_BASE_VERSION = 4;
export declare const TRANSFORM_CURRENT_VERSION = 5;
export interface TransformMigrationConfig {
    V1?: {
        Resources: string[];
    };
}
export declare enum ConflictHandlerType {
    OPTIMISTIC = "OPTIMISTIC_CONCURRENCY",
    AUTOMERGE = "AUTOMERGE",
    LAMBDA = "LAMBDA"
}
export declare type ConflictDectionType = 'VERSION' | 'NONE';
export declare type SyncConfigOPTIMISTIC = {
    ConflictDetection: ConflictDectionType;
    ConflictHandler: ConflictHandlerType.OPTIMISTIC;
};
export declare type SyncConfigSERVER = {
    ConflictDetection: ConflictDectionType;
    ConflictHandler: ConflictHandlerType.AUTOMERGE;
};
export declare type SyncConfigLAMBDA = {
    ConflictDetection: ConflictDectionType;
    ConflictHandler: ConflictHandlerType.LAMBDA;
    LambdaConflictHandler: {
        name: string;
        region?: string;
        lambdaArn?: any;
    };
};
export declare type SyncConfig = SyncConfigOPTIMISTIC | SyncConfigSERVER | SyncConfigLAMBDA;
export declare type ResolverConfig = {
    project: SyncConfig;
    models: {
        [key: string]: SyncConfig;
    };
};
/**
 * The transform config is specified in transform.conf.json within an Amplify
 * API project directory.
 */
export interface TransformConfig {
    /**
     * The transform library uses a "StackMapping" to determine which stack
     * a particular resource belongs to. This "StackMapping" allows individual
     * transformer implementations to add resources to a single context and
     * reference resources as if they were all members of the same stack. The
     * transform formatter takes the single context and the stack mapping
     * and splits the context into a valid nested stack where any Fn::Ref or Fn::GetAtt
     * is replaced by a Import/Export or Parameter. Users may provide mapping
     * overrides to get specific behavior out of the transformer. Users may
     * override the default stack mapping to customize behavior.
     */
    StackMapping?: {
        [resourceId: string]: string;
    };
    /**
     * Provide build time options to GraphQL Transformer constructor functions.
     * Certain options cannot be configured via CloudFormation parameters and
     * need to be set at build time. E.G. DeletionPolicies cannot depend on parameters.
     */
    TransformerOptions?: {
        [transformer: string]: {
            [option: string]: any;
        };
    };
    /**
     * For backwards compatibility we store a set of resource logical ids that
     * should be preserved in the top level template to prevent deleting
     * resources that holds data and that were created before the new nested stack config.
     * This should not be used moving forwards. Moving forward, use the StackMapping instead which
     * generalizes this behavior.
     */
    Migration?: TransformMigrationConfig;
    /**
     * Keeping a track of transformer version changes
     */
    Version?: number;
    /**
     * Object which states info about a resolver's configuration
     * Such as sync configuration for appsync local support
     */
    ResolverConfig?: ResolverConfig;
}
/**
 * try to load transformer config from specified projectDir
 * if it does not exist then we return a blank object
 *  */
export declare function loadConfig(projectDir: string): Promise<TransformConfig>;
export declare function writeConfig(projectDir: string, config: TransformConfig): Promise<TransformConfig>;
/**
 * Given an absolute path to an amplify project directory, load the
 * user defined configuration.
 */
interface ProjectConfiguration {
    schema: string;
    resolvers: {
        [k: string]: string;
    };
    stacks: {
        [k: string]: Template;
    };
    config: TransformConfig;
}
export declare function loadProject(projectDirectory: string, opts?: ProjectOptions): Promise<ProjectConfiguration>;
/**
 * Given a project directory read the schema from disk. The schema may be a
 * single schema.graphql or a set of .graphql files in a directory named `schema`.
 * Preference is given to the `schema.graphql` if provided.
 * @param projectDirectory The project directory.
 */
export declare function readSchema(projectDirectory: string): Promise<string>;
export {};
