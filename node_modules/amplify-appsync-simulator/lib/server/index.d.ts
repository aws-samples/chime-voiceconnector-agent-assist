import { AmplifyAppSyncSimulator } from '..';
import { AppSyncSimulatorServerConfig } from '../type-definition';
export declare class AppSyncSimulatorServer {
    private config;
    private simulatorContext;
    private _operationServer;
    private _subscriptionServer;
    private _httpServer;
    private _realTimeSubscriptionServer;
    private _url;
    constructor(config: AppSyncSimulatorServerConfig, simulatorContext: AmplifyAppSyncSimulator);
    start(): Promise<void>;
    stop(): void;
    get url(): {
        graphql: string;
    };
}
