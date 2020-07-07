import { RawDocumentsConfig } from '@graphql-codegen/visitor-plugin-common';
export interface AppSyncModelPluginConfig extends RawDocumentsConfig {
    directives?: string;
}
export * from './plugin';
export * from './preset';
export declare const addToSchema: (config: AppSyncModelPluginConfig) => string;
//# sourceMappingURL=index.d.ts.map