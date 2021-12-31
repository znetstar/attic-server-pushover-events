"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtticServerPushoverEvents = exports.MissingPushoverUserTokenError = void 0;
const ejs = require("ejs");
class MissingPushoverUserTokenError extends Error {
    constructor() {
        super('Missing pushover application or user token');
        this.code = 76001;
    }
}
exports.MissingPushoverUserTokenError = MissingPushoverUserTokenError;
class AtticServerPushoverEvents {
    constructor(applicationContext, pushoverUserToken, pushoverAppToken) {
        this.applicationContext = applicationContext;
        this.pushover = async (request) => {
            if (!this.pushoverAppToken || !this.pushoverUserToken)
                throw new MissingPushoverUserTokenError();
            const p = new (require('pushover-notifications'))({ user: this.pushoverUserToken, token: this.pushoverAppToken });
            return new Promise((resolve, reject) => {
                p.send(request, function (err, result) {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            });
        };
        this.pushoverUserToken = pushoverUserToken || this.config.pushoverUserToken || process.env.PUSHOVER_USER;
        this.pushoverAppToken = pushoverAppToken || this.config.pushoverAppToken || process.env.PUSHOVER_TOKEN;
    }
    get config() { return this.applicationContext.config; }
    async init() {
        const ctx = this.applicationContext;
        ctx.pushover = ctx.rpcServer.methods.pushover = this.pushover;
        for (const eventEntry of this.config.sendEventsToPushover || []) {
            ctx.registerHook(`events.${eventEntry.event}`, async (event) => {
                var _a;
                const pushoverRequest = {
                    ...(eventEntry.options || {}),
                    message: await ejs.render(eventEntry.messageTemplate, { event }, { async: true }),
                    title: eventEntry.titleTemplate ? await ejs.render(eventEntry.titleTemplate, { event }, { async: true }) : (((_a = eventEntry.options) === null || _a === void 0 ? void 0 : _a.title) || void (0)),
                };
                await this.pushover(pushoverRequest);
            });
        }
    }
    get name() {
        return '@znetstar/attic-server-pushover-events';
    }
}
exports.AtticServerPushoverEvents = AtticServerPushoverEvents;
//# sourceMappingURL=Atticfile.js.map