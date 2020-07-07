import { GraphQLObjectType } from 'graphql';
import { AmplifyAppSyncSimulator } from '../..';
import { AppSyncSimulatorDirectiveBase } from './directive-base';
export declare class AwsAuth extends AppSyncSimulatorDirectiveBase {
    private authMapping;
    static typeDefinitions: string;
    visitFieldDefinition(): void;
    visitObject(object: GraphQLObjectType): void;
}
export declare function protectResolversWithAuthRules(typeDef: any, existingResolvers: any, simulator: AmplifyAppSyncSimulator): {};
