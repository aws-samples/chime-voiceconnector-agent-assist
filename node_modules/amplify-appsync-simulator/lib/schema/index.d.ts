import { Source } from 'graphql';
import { AmplifyAppSyncSimulator } from '..';
import { AppSyncSimulatorPipelineResolverConfig, AppSyncSimulatorUnitResolverConfig } from '../type-definition';
import { AppSyncSimulatorDirectiveBase } from './directives/directive-base';
export declare function generateResolvers(schema: Source, resolversConfig: (AppSyncSimulatorUnitResolverConfig | AppSyncSimulatorPipelineResolverConfig)[], simulatorContext: AmplifyAppSyncSimulator): import("graphql").GraphQLSchema;
export declare function addDirective(name: string, visitor: typeof AppSyncSimulatorDirectiveBase): void;
