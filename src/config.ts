import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config({ path: ".env" }));

export interface Config {
    port: number;
    debugLogging: boolean;
    jwtSecret: string;
    dynamoDbLocalEndpoint: string;
    dynamoDbTableNameAccounts: string;
}

const defaultDynamoDbTableNamePrefix = "EnvfooCopernicus";

const config: Config = {
    port: +(process.env.PORT || 3000),
    debugLogging: (process.env.DEBUG_LOGGING === "1"),
    jwtSecret: process.env.JWT_SECRET || "your-secret-whatever",
    dynamoDbLocalEndpoint: process.env.DYNAMODB_LOCAL_ENDPOINT || "",
    dynamoDbTableNameAccounts: (
      process.env.DYNAMODB_TABLE_NAME_ACCOUNTS ||
      `${defaultDynamoDbTableNamePrefix}Accounts`
    )
};

export { config };
