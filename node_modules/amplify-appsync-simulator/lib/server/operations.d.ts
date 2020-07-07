import express from 'express';
import { AmplifyAppSyncSimulator } from '..';
import { AppSyncSimulatorServerConfig } from '../type-definition';
import { SubscriptionServer } from './subscription';
export declare class OperationServer {
    private config;
    private simulatorContext;
    private subscriptionServer;
    private _app;
    constructor(config: AppSyncSimulatorServerConfig, simulatorContext: AmplifyAppSyncSimulator, subscriptionServer: SubscriptionServer);
    private handleAPIInfoRequest;
    private handleRequest;
    get app(): express.Application;
}
