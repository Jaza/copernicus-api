# Copernicus API

A fake banking API that's designed to be used in place of
the [Galileo API](https://docs.galileo-ft.com/) for testing
purposes.

Built with the [koa](https://github.com/koajs/koa) Node.js
framework. Based on the
[node-typescript-koa-rest](https://github.com/javieraviles/node-typescript-koa-rest)
boilerplate.

Can be deployed to AWS Lambda (plus DynamoDB and API Gateway) with
[copernicus-lambda-deployer](https://github.com/Jaza/copernicus-lambda-deployer).

## Getting started

To work locally with this project, follow the steps below:

1. Fork, clone or download this project
1. `npm install`
1. Copy `.example.env` to `.env` and set variables as required
1. `npm run create-tables`
1. Preview your project: `npm run watch-server`
1. Build and run the project in JS: `npm run build && npm run start`
1. Run unit tests: `npm run test`

Built by [Douugh](https://douugh.com/).
