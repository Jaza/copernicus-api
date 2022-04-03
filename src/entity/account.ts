import { randomUUID } from "crypto";
import {
    IsDecimal,
    IsIn,
    IsNumberString,
    IsUUID,
    Length,
} from "class-validator";
import { config } from "../config";
import { dc } from "../db";

export const STATUS_ACTIVE = "active";
export const STATUS_DELETED = "deleted";
export const STATUS_SUSPENDED = "suspended";

export const VALID_STATUSES = [STATUS_ACTIVE, STATUS_DELETED, STATUS_SUSPENDED];
export const VALID_UPDATE_STATUSES = [STATUS_ACTIVE, STATUS_SUSPENDED];

const ACCOUNT_NUMBER_MIN_VALUE = 100000000000;
const ACCOUNT_NUMBER_MAX_VALUE = 999999999999;
const ROUTING_NUMBER_MIN_VALUE = 100000000;
const ROUTING_NUMBER_MAX_VALUE = 999999999;

export class Account {
    @IsUUID()
    id: string;

    @Length(1, 255)
    externalUserId: string;

    @IsNumberString()
    accountNumber: string;

    @IsNumberString()
    routingNumber: string;

    @IsIn(VALID_STATUSES)
    status: string;

    @IsDecimal()
    currentBalance: string;

    @IsDecimal()
    availableBalance: string;
}

export const accountUpdateSchema = {
    status: { type: "string", required: true, example: STATUS_ACTIVE, enum: VALID_UPDATE_STATUSES }
};

export const getNewAccount = (externalUserId: string): Account => {
    const account: Account = new Account();

    account.id = randomUUID();
    account.externalUserId = externalUserId;
    const accountNumber = Math.floor(
      Math.random() *
      (ACCOUNT_NUMBER_MAX_VALUE - ACCOUNT_NUMBER_MIN_VALUE) +
      ACCOUNT_NUMBER_MAX_VALUE
    );
    account.accountNumber = `${accountNumber}`;
    const routingNumber = Math.floor(
      Math.random() *
      (ROUTING_NUMBER_MAX_VALUE - ROUTING_NUMBER_MIN_VALUE) +
      ROUTING_NUMBER_MAX_VALUE
    );
    account.routingNumber = `${routingNumber}`;
    account.status = STATUS_ACTIVE;
    account.currentBalance = "0";
    account.availableBalance = "0";

    return account;
};

export const getAccountsFromDb = async (externalUserId: string) => {
    const params = {
        TableName: config.dynamoDbTableNameAccounts,
        KeyConditionExpression: "externalUserId = :externalUserId",
        FilterExpression: "#accountStatus <> :status",
        ExpressionAttributeValues: {
            ":externalUserId": externalUserId,
            ":status": STATUS_DELETED
        },
        ExpressionAttributeNames: {
            "#accountStatus": "status"
        }
    };

    const res = await dc.query(params).promise();
    return res.Items;
};

export const getAccountFromDb = async (externalUserId: string, id: string) => {
    const params = {
        TableName: config.dynamoDbTableNameAccounts,
        Key: {
            externalUserId,
            id
        }
    };

    const res = await dc.get(params).promise();
    return (res.Item && res.Item.status !== STATUS_DELETED) ? res.Item : null;
};

export const createAccountInDb = async (account: Account) => {
    const params = {
        TableName: config.dynamoDbTableNameAccounts,
        Item: account,
        ConditionExpression: "attribute_not_exists(id)"
    };

    return await dc.put(params).promise();
};

export const updateAccountInDb = async (externalUserId: string, id: string, status: string) => {
    const params = {
        TableName: config.dynamoDbTableNameAccounts,
        Key: {
            externalUserId,
            id
        },
        ConditionExpression: (
            "attribute_exists(externalUserId) and " +
            "attribute_exists(id) and " +
            "#accountStatus <> :statusDeleted"
        ),
        UpdateExpression: "set #accountStatus = :status",
        ExpressionAttributeValues: {
            ":status": status,
            ":statusDeleted": STATUS_DELETED
        },
        ExpressionAttributeNames: {
            "#accountStatus": "status"
        }
    };

    return await dc.update(params).promise();
};

export const deleteAccountFromDb = async (externalUserId: string, id: string) => {
    const params = {
        TableName: config.dynamoDbTableNameAccounts,
        Key: {
            externalUserId,
            id
        },
        ConditionExpression: (
            "attribute_exists(externalUserId) and " +
            "attribute_exists(id) and " +
            "#accountStatus <> :status"
        ),
        UpdateExpression: "set #accountStatus = :status",
        ExpressionAttributeValues: {
            ":status": STATUS_DELETED
        },
        ExpressionAttributeNames: {
            "#accountStatus": "status"
        }
    };

    return await dc.update(params).promise();
};
