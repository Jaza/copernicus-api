import Router from "@koa/router";
import { general } from "./controller";

const unprotectedRouter: Router = new Router();

// Hello World route
unprotectedRouter.get("/", general.helloWorld);

export { unprotectedRouter };
