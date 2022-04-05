import { SwaggerRouter } from "koa-swagger-decorator";
import { config } from "./config";

const protectedRouter = new SwaggerRouter();

// Swagger endpoint
protectedRouter.swagger({
    title: "Copernicus",
    description: (
      "A fake banking API that's designed to be used in place of the Galileo API for " +
      "testing purposes."
    ),
    version: "0.1.0",
    swaggerHtmlEndpoint: "/swagger-html/",
    swaggerJsonEndpoint: config.swaggerJsonEndpoint
});

// mapDir will scan the input dir, and automatically call router.map to all Router Class
protectedRouter.mapDir(__dirname, {
    recursive: true,
    doValidation: true,
    ignore: ["**.test.ts", "server.ts", "server.js"],
});

export { protectedRouter };
