import {IApplicationContext, IConfig, IPlugin} from "@znetstar/attic-common/lib/Server";

import { IError } from "@znetstar/attic-common/lib/Error";
import {IEvent } from "@znetstar/attic-common";
import * as ejs from 'ejs';

export type AtticPushoverEventsApplicationContext = IApplicationContext&{
    config: AtticPushoverEventsConfig;
    pushover: (request: IPushoverRequest) => Promise<unknown>;
}

export type IPushoverRequest = {
    message: string,
    title?: string,
    sound?: string,
    device?: string,
    priority?: number,
    url?: string,
    url_title?: string
}

export type AtticPushoverEventConfigEntry = {
    event: string,
    messageTemplate: string,
    titleTemplate?: string,
    options?: Partial<IPushoverRequest>
};

export type AtticPushoverEventsConfig = IConfig&{
    sendEventsToPushover?: AtticPushoverEventConfigEntry[];
    pushoverUserToken?: string;
    pushoverAppToken?:  string;
};


export class MissingPushoverUserTokenError  extends Error implements IError {
    constructor() {
        super('Missing pushover application or user token');
    }
    code: number = 76001;
}

export class AtticServerPushoverEvents implements IPlugin {
    public pushoverUserToken: string;
    public pushoverAppToken: string;
    constructor(
      public applicationContext: AtticPushoverEventsApplicationContext,
      pushoverUserToken?: string,
      pushoverAppToken?: string
    ) {
        this.pushoverUserToken = pushoverUserToken || this.config.pushoverUserToken || process.env.PUSHOVER_USER as string;
        this.pushoverAppToken = pushoverAppToken || this.config.pushoverAppToken || process.env.PUSHOVER_TOKEN as string;
    }

    public get config(): AtticPushoverEventsConfig { return this.applicationContext.config as AtticPushoverEventsConfig; }

    public pushover =  async (request: IPushoverRequest): Promise<unknown> => {
        if (!this.pushoverAppToken || !this.pushoverUserToken) throw new  MissingPushoverUserTokenError();
        const p = new (require('pushover-notifications'))({ user: this.pushoverUserToken, token: this.pushoverAppToken });
        return new Promise<unknown>((resolve, reject) => {
            p.send(request, function (err: Error, result: unknown) {
             if (err) reject(err);
             else resolve(result);
            });
        });
    }

    public async init(): Promise<void> {
      const ctx = this.applicationContext;
      ctx.pushover = this.pushover;

      for (const eventEntry of this.config.sendEventsToPushover || []) {
        ctx.registerHook(`events.${eventEntry.event}`, async (event: IEvent<unknown>) => {
            const pushoverRequest: IPushoverRequest = {
                ...(eventEntry.options || {}),
                message: await ejs.render(eventEntry.messageTemplate, { event },{ async: true}),
                title: eventEntry.titleTemplate ? await ejs.render(eventEntry.titleTemplate, { event },{ async: true}) : (eventEntry.options?.title || void(0)),
            }

            await this.pushover(pushoverRequest);
        });
      }
    }

    public get name(): string {
        return '@znetstar/attic-server-pushover-events';
    }
}

export default AtticPushoverEventsApplicationContext;
