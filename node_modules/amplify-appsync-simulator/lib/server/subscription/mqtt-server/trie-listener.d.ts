import { AbstractListener, Settings } from './abstract-listener';
export declare class TrieListener extends AbstractListener {
    private matcher;
    constructor(settings?: Settings);
    subscribe(topic: any, callback: any, done: any): void;
    publish(topic: any, message: any, options: any, done?: () => void): void;
    unsubscribe(topic: any, callback: any, done?: () => void): void;
    close(done?: () => void): void;
}
