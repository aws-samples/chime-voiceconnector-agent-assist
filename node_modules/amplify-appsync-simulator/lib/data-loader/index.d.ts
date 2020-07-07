export interface AmplifyAppSyncSimulatorDataLoader {
    load(payload: any): Promise<object | null>;
}
export declare function getDataLoader(sourceType: any): any;
export declare function addDataLoader(sourceType: any, loader: any): void;
export declare function removeDataLoader(sourceType: string): any;
