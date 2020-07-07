import { AppSyncSimulatorDirectiveBase } from './directive-base';
export declare class AwsSubscribe extends AppSyncSimulatorDirectiveBase {
    static typeDefinitions: string;
    name: string;
    visitFieldDefinition(field: any): void;
}
