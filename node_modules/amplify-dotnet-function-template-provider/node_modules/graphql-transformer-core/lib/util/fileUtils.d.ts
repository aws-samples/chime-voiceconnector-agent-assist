/// <reference types="node" />
/**
 * Helpers
 */
export declare function emptyDirectory(directory: string): Promise<void>;
export declare function writeToPath(directory: string, obj: any): Promise<void>;
/**
 * Recursively read the contents of a directory into an object.
 * @param directory The directory to read.
 */
export declare function readFromPath(directory: string): Promise<any>;
export declare type FileHandler = (file: {
    Key: string;
    Body: Buffer | string;
}) => Promise<string>;
/**
 * Uploads a file with exponential backoff up to a point.
 * @param opts The deployment options
 * @param key The bucket key
 * @param body The blob body as a buffer
 * @param backoffMS The time to wait this invocation
 * @param numTries The max number of tries
 */
export declare function handleFile(handler: FileHandler, key: string, body: Buffer, backoffMS?: number, numTries?: number): Promise<string>;
export declare function walkDirRec(dir: string, handler: FileHandler, relativePath: string, joinPath: (...paths: string[]) => string): Promise<void>;
export declare function walkDir(dir: string, handler: (file: {
    Key: string;
    Body: Buffer | string;
}) => Promise<string>): Promise<void>;
export declare function walkDirPosix(dir: string, handler: (file: {
    Key: string;
    Body: Buffer | string;
}) => Promise<string>): Promise<void>;
export declare function throwIfNotJSONExt(stackFile: string): void;
