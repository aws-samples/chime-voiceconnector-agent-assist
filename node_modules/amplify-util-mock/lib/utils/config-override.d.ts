export declare class ConfigOverrideManager {
    private static instance;
    private overrides;
    constructor(context: any);
    addOverride(category: string, override: {}): void;
    generateOverriddenFrontendExports(context: any): Promise<void>;
    restoreFrontendExports(context: any): Promise<void>;
    static getInstance(context: any): ConfigOverrideManager;
}
