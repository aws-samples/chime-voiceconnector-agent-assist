import { ObjectNode } from './ast';
export declare class HttpMappingTemplate {
    static RESOLVER_VERSION_ID: string;
    /**
     * Create a mapping template for HTTP GET requests.
     */
    static getRequest({ resourcePath, params }: {
        resourcePath: string;
        params: ObjectNode;
    }): ObjectNode;
    /**
     * Create a mapping template for HTTP POST requests.
     */
    static postRequest({ resourcePath, params }: {
        resourcePath: string;
        params: ObjectNode;
    }): ObjectNode;
    /**
     * Create a mapping template for HTTP PUT requests.
     */
    static putRequest({ resourcePath, params }: {
        resourcePath: string;
        params: ObjectNode;
    }): ObjectNode;
    /**
     * Create a mapping template for HTTP DELETE requests.
     */
    static deleteRequest({ resourcePath, params }: {
        resourcePath: string;
        params: ObjectNode;
    }): ObjectNode;
    /**
     * Create a mapping template for HTTP PATCH requests.
     */
    static patchRequest({ resourcePath, params }: {
        resourcePath: string;
        params: ObjectNode;
    }): ObjectNode;
}
