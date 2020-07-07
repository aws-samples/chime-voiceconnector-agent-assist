/// <reference types="node" />
import { Template } from 'cloudform-types';
import { TransformConfig } from './transformConfig';
export interface ProjectOptions {
    projectDirectory?: string;
    transformersFactory: Function;
    transformersFactoryArgs: object[];
    currentCloudBackendDirectory: string;
    rootStackFileName?: string;
    dryRun?: boolean;
    disableResolverOverrides?: boolean;
    buildParameters?: Object;
}
export declare function buildProject(opts: ProjectOptions): Promise<{
    resolvers: import("../DeploymentResources").StringMap;
    stacks: {
        [name: string]: import("cloudform-types/types/template").default;
    };
    stackMapping: import("../DeploymentResources").StackMapping;
    pipelineFunctions: import("../DeploymentResources").StringMap;
    functions: {
        [path: string]: string;
    };
    schema: string;
    rootStack: import("cloudform-types/types/template").default;
}>;
export interface UploadOptions {
    directory: string;
    upload(blob: {
        Key: string;
        Body: Buffer | string;
    }): Promise<string>;
}
/**
 * Reads deployment assets from disk and uploads to the cloud via an uploader.
 * @param opts Deployment options.
 */
export declare function uploadDeployment(opts: UploadOptions): Promise<void>;
interface MigrationOptions {
    projectDirectory: string;
    cloudBackendDirectory?: string;
}
/**
 * Using the current cloudbackend as the source of truth of the current env,
 * move the deployment forward to the intermediate stage before allowing the
 * rest of the deployment to take place.
 * @param opts
 */
export declare function migrateAPIProject(opts: MigrationOptions): Promise<{
    project: any;
    cloudBackend: any;
}>;
export declare function revertAPIMigration(directory: string, oldProject: AmplifyApiV1Project): Promise<void>;
interface AmplifyApiV1Project {
    schema: string;
    parameters: any;
    template: Template;
}
/**
 * Read the configuration for the old version of amplify CLI.
 */
export declare function readV1ProjectConfiguration(projectDirectory: string): Promise<AmplifyApiV1Project>;
export declare function makeTransformConfigFromOldProject(project: AmplifyApiV1Project): TransformConfig;
export {};
