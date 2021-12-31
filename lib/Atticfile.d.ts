import { IApplicationContext, IConfig, IPlugin } from "@znetstar/attic-common/lib/Server";
import { IError } from "@znetstar/attic-common/lib/Error";
import { IRPC } from "@znetstar/attic-common";
export declare type AtticPushoverRPCType = IRPC & {
    pushover: (request: IPushoverRequest) => Promise<unknown>;
};
export declare type AtticPushoverEventsApplicationContext = IApplicationContext & {
    config: AtticPushoverEventsConfig;
    pushover: (request: IPushoverRequest) => Promise<unknown>;
    rpcServer: {
        methods: AtticPushoverRPCType;
    };
};
export declare type IPushoverRequest = {
    message: string;
    title?: string;
    sound?: string;
    device?: string;
    priority?: number;
    url?: string;
    url_title?: string;
};
export declare type AtticPushoverEventConfigEntry = {
    event: string;
    messageTemplate: string;
    titleTemplate?: string;
    options?: Partial<IPushoverRequest>;
};
export declare type AtticPushoverEventsConfig = IConfig & {
    sendEventsToPushover?: AtticPushoverEventConfigEntry[];
    pushoverUserToken?: string;
    pushoverAppToken?: string;
};
export declare class MissingPushoverUserTokenError extends Error implements IError {
    constructor();
    code: number;
}
export declare class AtticServerPushoverEvents implements IPlugin {
    applicationContext: AtticPushoverEventsApplicationContext;
    pushoverUserToken: string;
    pushoverAppToken: string;
    constructor(applicationContext: AtticPushoverEventsApplicationContext, pushoverUserToken?: string, pushoverAppToken?: string);
    get config(): AtticPushoverEventsConfig;
    pushover: (request: IPushoverRequest) => Promise<unknown>;
    init(): Promise<void>;
    get name(): string;
}
export default AtticPushoverEventsApplicationContext;
