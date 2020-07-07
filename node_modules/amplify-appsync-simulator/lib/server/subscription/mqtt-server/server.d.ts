/// <reference types="node" />
import pino from 'pino';
import { EventEmitter } from 'events';
import { Server } from 'http';
export declare type MQTTServerOptions = {
    id?: string;
    maxConnections?: number;
    backend?: {
        wildcardOne: string;
        wildcardSome: string;
    };
    stats?: boolean;
    publishNewClient?: boolean;
    publishClientDisconnect?: boolean;
    publishSubscriptions?: boolean;
    maxInflightMessages?: number;
    onQoS2publish?: string;
    logger?: {
        name?: string;
        level?: string;
    };
};
/**
 * The Amplify MQTT Server is a very simple MQTT server that
 * provides a simple event-based API to craft your own MQTT logic
 * It supports QoS 0 & 1, without external storage.
 *
 *
 * Options:
 *  - `host`, the IP address of the server (see http://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback).
 *    that will power this server.
 *  - `maxInflightMessages`, the maximum number of inflight messages per client.
 *  - `logger`, the options for Pino.
 *     A sub-key `factory` is used to specify what persistence
 *     to use.
 *  - `stats`, publish the stats every 10s (default false).
 *  - `publishNewClient`, publish message to topic "$SYS/{broker-id}/new/clients" when new client connects.
 *  - `publishClientDisconnect`, publish message to topic "$SYS/{broker-id}/disconnect/clients" when a client disconnects.
 *  - `publishSubscriptions`, publish message to topic "$SYS/{broker-id}/new/(un)subscribes" when a client subscribes/unsubscribes.
 *
 * Events:
 *  - `clientConnected`, when a client is connected;
 *    the client is passed as a parameter.
 *  - `clientDisconnecting`, when a client is being disconnected;
 *    the client is passed as a parameter.
 *  - `clientDisconnected`, when a client is disconnected;
 *    the client is passed as a parameter.
 *  - `clientError`, when the server identifies a client connection error;
 *    the error and the client are passed as parameters.
 *  - `published`, when a new message is published;
 *    the packet and the client are passed as parameters.
 *  - `subscribed`, when a client is subscribed to a topic;
 *    the topic and the client are passed as parameters.
 *  - `unsubscribed`, when a client is unsubscribed to a topic;
 *    the topic and the client are passed as parameters.
 *
 * @param {Object} opts The option object
 * @param {Function} callback The ready callback
 * @api public
 */
export declare class MQTTServer extends EventEmitter {
    private callback;
    options: MQTTServerOptions;
    clients: {};
    private _dedupId;
    private closed;
    logger: pino.Logger;
    onQoS2publish: any;
    id: string;
    listener: any;
    constructor(options?: MQTTServerOptions, callback?: (err: any, data?: any) => void);
    private init;
    toString(): string;
    subscribe(topic: any, callback: any, done: any): void;
    publish(packet: any, client?: any, callback?: any): void;
    close(callback?: () => void): void;
    updateOfflinePacket(client: any, originMessageId: any, packet: any, callback: any): void;
    attachHttpServer(server: Server, path?: string): void;
    nextDedupId(): number;
}
