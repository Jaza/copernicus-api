import Koa from "koa";
import jwt from "koa-jwt";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import cors from "@koa/cors";
import winston from "winston";
import "reflect-metadata";

import { config } from "./config";
import { logger } from "./logger";
import { unprotectedRouter } from "./unprotectedRoutes";
import { protectedRouter } from "./protectedRoutes";

// More-or-less an app factory, so that we can instantiate an app object with JWT-based
// auth completely disabled, for unit tests
const getConfiguredApp = (appInstance: Koa, useJwt: boolean = true): Koa => {
    appInstance.use(helmet.contentSecurityPolicy({
        directives:{
          defaultSrc:["'self'"],
          scriptSrc:["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
          styleSrc:["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
          fontSrc:["'self'","fonts.gstatic.com"],
          imgSrc:["'self'", "data:", "online.swagger.io", "validator.swagger.io"]
        }
    }));

    appInstance.use(cors());

    appInstance.use(logger(winston));

    appInstance.use(bodyParser());

    // these routes are NOT protected by the JWT middleware,
    // also include middleware to respond with 405
    appInstance.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods());

    if (useJwt) {
        // JWT middleware -> below this line routes are only reached if JWT token is valid,
        // secret as env variable
        // do not protect swagger-json and swagger-html endpoints
        appInstance.use(jwt({ secret: config.jwtSecret }).unless({ path: [/^\/swagger-/] }));
    }

    // These routes are protected by the JWT middleware,
    // also include middleware to respond with 405
    appInstance.use(protectedRouter.routes()).use(protectedRouter.allowedMethods());

    return appInstance;
};

const app = getConfiguredApp(new Koa());

export { app, getConfiguredApp };
