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

Can be installed [from npm](https://www.npmjs.com/package/copernicus-api) with
`npm install copernicus-api`.

Requires either a real AWS DynamoDB back-end, or
[dynamodb-local](https://hub.docker.com/r/amazon/dynamodb-local).

## Getting started

To work locally with this project, follow the steps below:

1. Fork, clone or download this project
1. `npm install`
1. Copy `.example.env` to `.env` and set variables as required
1. `npm run create-tables`
1. Preview your project: `npm run watch-server`
1. Go to `http://localhost:3000/swagger-html/` to CRUD away at the API

## Building

To build and run the project in JS: `npm run build && npm run start`

## Testing

To run unit tests: `npm run test`

## Publishing new releases

1. Bump the version number in `package.json`
1. `npm run build`
1. `npm publish`

Built by [Douugh](https://douugh.com/).
