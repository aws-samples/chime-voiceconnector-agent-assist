import { AmplifyAppSyncAPIConfig, AmplifyAppSyncAuthenticationProviderConfig, AmplifyAppSyncSimulatorAuthenticationType } from '../../type-definition';
export declare type JWTToken = {
    iss: string;
    sub: string;
    exp: number;
    aud: string;
    iat: number;
    nbf: number;
    username?: string;
    'cognito:username'?: string;
};
export declare function extractJwtToken(authorization: string): JWTToken;
export declare function isValidOIDCToken(token: JWTToken, configuredAuthTypes: AmplifyAppSyncAuthenticationProviderConfig[]): boolean;
export declare function extractHeader(headers: Record<string, string | string[]>, name: string): string;
export declare function getAllowedAuthTypes(config: AmplifyAppSyncAPIConfig): AmplifyAppSyncSimulatorAuthenticationType[];
