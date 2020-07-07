import { MESSAGE_TYPES } from './message-types';
export declare class GQLMessageExtractionError extends Error {
}
export declare type GQLMessageGeneric = {
    type: MESSAGE_TYPES;
};
export declare type GQLMessageConnectionInit = GQLMessageGeneric & {
    type: MESSAGE_TYPES.GQL_CONNECTION_INIT;
};
export declare type GQLMessageConnectionAck = GQLMessageGeneric & {
    type: MESSAGE_TYPES.GQL_CONNECTION_ACK;
    payload: {
        connectionTimeout: number;
    };
};
export declare type GQLMessageKeepAlive = GQLMessageGeneric & {
    type: MESSAGE_TYPES.GQL_CONNECTION_KEEP_ALIVE;
};
export declare type GQLMessageSubscriptionStart = GQLMessageGeneric & {
    type: MESSAGE_TYPES.GQL_START;
    id: string;
    payload: {
        data: string;
        extensions: {
            authorization: {
                Authorization: string;
                host: string;
            };
        };
    };
};
export declare type GQLMessageSubscriptionAck = GQLMessageGeneric & {
    type: MESSAGE_TYPES.GQL_START_ACK;
    id: string;
};
export declare type GQLMessageSubscriptionStop = GQLMessageGeneric & {
    type: MESSAGE_TYPES.GQL_STOP;
    id: string;
};
export declare type GQLMessageSubscriptionComplete = GQLMessageGeneric & {
    type: MESSAGE_TYPES.GQL_COMPLETE;
    id: string;
};
export declare type GQLMessageSubscriptionData = GQLMessageGeneric & {
    type: MESSAGE_TYPES.GQL_DATA;
    id: string;
    payload: {
        data: any;
    };
};
export declare type GQLMessageError = GQLMessageGeneric & {
    type: MESSAGE_TYPES.GQL_ERROR;
    id?: string;
    payload: {
        errors: [];
    };
};
export declare function isSubscriptionStartMessage(message: any): message is GQLMessageSubscriptionStart;
export declare function isSubscriptionStopMessage(message: any): message is GQLMessageSubscriptionStop;
export declare function isSubscriptionConnectionInitMessage(message: any): message is GQLMessageConnectionInit;
