import { randomUUID } from "crypto";
import { Context } from "koa";
import Koa from "koa";
import { jest } from "@jest/globals";
import request from "supertest";
import { getConfiguredApp } from "../../src/app";
import { dc } from "../../src/db";
import { STATUS_SUSPENDED, Account, accountUpdateSchema } from "../../src/entity/account";
import AccountController from "../../src/controller/account";

const id = "01234567-89ab-cdef-0123-456789abcdef";
const externalUserId = "12345678-9abc-def0-1234-56789abcdef0";
const account: Account = new Account();
account.id = id;
account.externalUserId = externalUserId;
account.accountNumber = "111222333444";
account.routingNumber = "555666777";
account.status = "active";
account.currentBalance = "12.42";
account.availableBalance = "12.34";

jest.mock("../../src/db");
const mockedDc = ((jest.mocked(dc, true) as unknown) as any);

jest.mock("crypto");
const mockedRandomUUID = jest.mocked(randomUUID);

describe("Account controller", () => {
    it("getAccounts should return status 200 and found accounts", async () => {
        mockedDc.query = jest.fn().mockReturnValue({
            promise: jest.fn().mockReturnValue({ Items: [account] })
        });
        const context = {
            status: undefined, body: undefined, params: {externalUserId}
        } as unknown as Context;
        await AccountController.getAccounts(context);
        expect(mockedDc.query).toHaveBeenCalledTimes(1);
        expect(context.status).toBe(200);
        expect(context.body).toStrictEqual([account]);
    });

    it("getAccount should return status 200 and single account found by id", async () => {
        mockedDc.get = jest.fn().mockReturnValue({
            promise: jest.fn().mockReturnValue({ Item: account })
        });
        const context = {
            status: undefined, body: undefined, params: {externalUserId, id}
        } as unknown as Context;
        await AccountController.getAccount(context);
        expect(mockedDc.get).toHaveBeenCalledTimes(1);
        expect(context.status).toBe(200);
        expect(context.body).toStrictEqual(account);
    });

    it("getAccount should return status 404 if no account found and message", async () => {
        mockedDc.get = jest.fn().mockReturnValue({
            promise: jest.fn().mockReturnValue({})
        });
        const context = {
            status: undefined, body: undefined, params: {externalUserId, id}
        } as unknown as Context;
        await AccountController.getAccount(context);
        expect(mockedDc.get).toHaveBeenCalledTimes(1);
        expect(context.status).toBe(404);
        expect(context.body).toBe("The account you are trying to retrieve doesn't exist in the db");
    });

    it("createAccount should return status 201 if is created", async () => {
        mockedRandomUUID.mockImplementation(() => id);
        mockedDc.put = jest.fn().mockReturnValue({ promise: jest.fn() });
        const context = {
            status: undefined, body: undefined, params: {externalUserId}
        } as unknown as Context;
        await AccountController.createAccount(context);
        expect(mockedDc.put).toHaveBeenCalledTimes(1);
        expect(context.status).toBe(201);
        expect((context.body as Account).id).toBe(id);
    });

    it("createAccount should return status 400 if there are validation errors", async () => {
        mockedDc.put = jest.fn();
        const context = {
            status: undefined, body: undefined, params: {externalUserId: "x".repeat(256)}
        } as unknown as Context;
        await AccountController.createAccount(context);
        expect(mockedDc.put).toHaveBeenCalledTimes(0);
        expect(context.status).toBe(400);
        expect((context.body as any)[0].constraints.isLength).toBe(
            "externalUserId must be shorter than or equal to 255 characters"
        );
    });

    it("updateAccount should return 200 if account is updated", async () => {
        mockedDc.update = jest.fn().mockReturnValue({ promise: jest.fn() });
        mockedDc.get = jest.fn().mockReturnValue({
            promise: jest.fn().mockReturnValue({ Item: account })
        });
        const context = {
            status: undefined,
            body: undefined,
            params: {externalUserId, id},
            request: {body: {status: STATUS_SUSPENDED}},
        } as unknown as Context;
        await AccountController.updateAccount(context);
        expect(mockedDc.update).toHaveBeenCalledTimes(1);
        expect(context.status).toBe(200);
        expect(context.body).toStrictEqual(account);
    });

    it("updateAccount should return 400 if there are validation errors", async () => {
        mockedDc.update = jest.fn();

        // Seems that koa-swagger-decorator validation doesn't happen if we call the
        // controller directly, the middleware doesn't kick in unless we go through
        // the router. So, unfortunately, that pretty much forces this to use supertest,
        // and to therefore become an integration test more than a unit test.
        const res = await request(getConfiguredApp(new Koa(), false).callback())
            .patch("/external-users/foo/accounts/bar/")
            .send({status: "shermanated"})
            .set("Accept", "application/json");

        expect(mockedDc.update).toHaveBeenCalledTimes(0);
        expect(res.status).toBe(400);
        expect(res.text).toBe("incorrect field: 'status', please check again!");
    });

    it("updateAccount should return 404 if account does not exist", async () => {
        const err = (new Error("ouch") as unknown) as any;
        err.code = "ConditionalCheckFailedException";
        mockedDc.update = jest.fn().mockReturnValue({ promise: jest.fn().mockRejectedValue(err) });
        const context = {
            status: undefined,
            body: undefined,
            params: {externalUserId, id},
            request: {body: {status: STATUS_SUSPENDED}},
        } as unknown as Context;

        await AccountController.updateAccount(context);
        expect(mockedDc.update).toHaveBeenCalledTimes(1);
        expect(context.status).toBe(404);
        expect(context.body).toBe("The account you are trying to update doesn't exist in the db");
    });

    it("deleteAccount should return status 404 if account does not exist", async () => {
        const err = (new Error("ouch") as unknown) as any;
        err.code = "ConditionalCheckFailedException";
        mockedDc.update = jest.fn().mockReturnValue({ promise: jest.fn().mockRejectedValue(err) });
        const context = {
            status: undefined,
            body: undefined,
            params: {externalUserId, id},
        } as unknown as Context;

        await AccountController.deleteAccount(context);
        expect(mockedDc.update).toHaveBeenCalledTimes(1);
        expect(context.status).toBe(404);
        expect(context.body).toBe("The account you are trying to delete doesn't exist in the db");
    });

    it("deleteAccount should return status 204 if account has been removed", async () => {
        mockedDc.update = jest.fn().mockReturnValue({ promise: jest.fn() });
        const context = {
            status: undefined,
            body: undefined,
            params: {externalUserId, id},
        } as unknown as Context;
        await AccountController.deleteAccount(context);
        expect(mockedDc.update).toHaveBeenCalledTimes(1);
        expect(context.status).toBe(204);
    });
});
