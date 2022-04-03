import { Context } from "koa";
import { validate, ValidationError } from "class-validator";
import { request, summary, path, body, responsesAll, tagsAll } from "koa-swagger-decorator";
import {
    accountUpdateSchema,
    createAccountInDb,
    deleteAccountFromDb,
    getAccountFromDb,
    getAccountsFromDb,
    getNewAccount,
    updateAccountInDb,
} from "../entity/account";

@responsesAll({
    200: { description: "success" },
    204: { description: "no content" },
    400: { description: "bad request" },
    401: { description: "unauthorized, missing/wrong jwt token" },
    404: { description: "not found" },
})
@tagsAll(["Accounts"])
export default class AccountController {
    @request("get", "/external-users/{externalUserId}/accounts/")
    @summary("Find all accounts")
    @path({
        externalUserId: { type: "string", required: true, description: "id of external user" }
    })
    public static async getAccounts(ctx: Context): Promise<void> {
        const accounts = await getAccountsFromDb(ctx.params.externalUserId);

        ctx.status = 200;
        ctx.body = accounts;
    }

    @request("get", "/external-users/{externalUserId}/accounts/{id}/")
    @summary("Find account by id")
    @path({
        externalUserId: { type: "string", required: true, description: "id of external user" },
        id: { type: "string", required: true, description: "id of account" }
    })
    public static async getAccount(ctx: Context): Promise<void> {
        const account = await getAccountFromDb(ctx.params.externalUserId, ctx.params.id);

        if (account) {
            ctx.status = 200;
            ctx.body = account;
        } else {
            ctx.status = 404;
            ctx.body = "The account you are trying to retrieve doesn't exist in the db";
        }
    }

    @request("post", "/external-users/{externalUserId}/accounts/")
    @summary("Create an account")
    @path({
        externalUserId: { type: "string", required: true, description: "id of external user" }
    })
    public static async createAccount(ctx: Context): Promise<void> {
        const account = getNewAccount(ctx.params.externalUserId);

        const errors: ValidationError[] = await validate(account);

        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = errors;
        } else {
            await createAccountInDb(account);

            ctx.status = 201;
            ctx.body = account;
        }
    }

    @request("patch", "/external-users/{externalUserId}/accounts/{id}/")
    @summary("Update an account")
    @path({
        externalUserId: { type: "string", required: true, description: "id of external user" },
        id: { type: "string", required: true, description: "id of account" }
    })
    @body(accountUpdateSchema)
    public static async updateAccount(ctx: Context): Promise<void> {
        try {
            await updateAccountInDb(
                ctx.params.externalUserId, ctx.params.id, ctx.request.body.status
            );
        } catch (err) {
            if (err.code === "ConditionalCheckFailedException") {
                ctx.status = 404;
                ctx.body = "The account you are trying to update doesn't exist in the db";
                return;
            } else {
                throw err;
            }
        }

        const account = await getAccountFromDb(ctx.params.externalUserId, ctx.params.id);
        ctx.status = 200;
        ctx.body = account;
    }

    @request("delete", "/external-users/{externalUserId}/accounts/{id}/")
    @summary("Delete account by id")
    @path({
        externalUserId: { type: "string", required: true, description: "id of external user" },
        id: { type: "string", required: true, description: "id of account" }
    })
    public static async deleteAccount(ctx: Context): Promise<void> {
        try {
            await deleteAccountFromDb(ctx.params.externalUserId, ctx.params.id);
            ctx.status = 204;
        } catch (err) {
            if (err.code === "ConditionalCheckFailedException") {
                ctx.status = 404;
                ctx.body = "The account you are trying to delete doesn't exist in the db";
            } else {
                throw err;
            }
        }
    }
}
