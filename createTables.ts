import { config } from "./src/config";
import { db } from "./src/db";

const run = async () => {
    await db.createTable({
        TableName: config.dynamoDbTableNameAccounts,
        KeySchema: [
            { AttributeName: "externalUserId", KeyType: "HASH" },
            { AttributeName: "id", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "externalUserId", AttributeType: "S" },
            { AttributeName: "id", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        },
    }).promise();

    console.log(`Created table ${config.dynamoDbTableNameAccounts}`);
};

run();
