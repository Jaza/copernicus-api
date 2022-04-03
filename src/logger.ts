import { Context } from "koa";
import { config } from "./config";
import { transports, format } from "winston";
import * as path from "path";

const logger = (winstonInstance: any): any  => {
    winstonInstance.configure({
        level: config.debugLogging ? "debug" : "info",
        transports: [
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.simple()
                )
            })
        ]
    });

    return async (ctx: Context, next: () => Promise<any>): Promise<void> => {

        const start = new Date().getTime();
        try {
            await next();
          } catch (err) {
            ctx.status = err.status || 500;
            ctx.body = err.message;
            ctx.stack = err.stack;
          }
        const timestamp = new Date();
        const ms = timestamp.getTime() - start;

        let logLevel: string;
        if (ctx.status >= 500) {
            logLevel = "error";
        } else if (ctx.status >= 400) {
            logLevel = "warn";
        } else {
            logLevel = "info";
        }

        const stack = ctx.stack ? (ctx.status === 500 ? ` ${ctx.stack}` : "") : "";

        const msg = `${timestamp.toISOString()} ${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms${stack}`;

        winstonInstance.log(logLevel, msg);
    };
};

export { logger };
