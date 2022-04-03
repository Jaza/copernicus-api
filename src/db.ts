import { config } from "./config";
import {
    config as AWSConfig,
    Credentials as AWSCredentials,
    Endpoint as AWSEndpoint,
    DynamoDB,
} from "aws-sdk";

let dbOptions = {};

if (config.dynamoDbLocalEndpoint) {
    const creds = new AWSCredentials("foo", "moo");
    AWSConfig.update({credentials: creds, region: "foo"});
    const ep = new AWSEndpoint(config.dynamoDbLocalEndpoint);
    dbOptions = {endpoint: ep};
}

export const db = new DynamoDB(dbOptions);
export const dc = new DynamoDB.DocumentClient(dbOptions);
