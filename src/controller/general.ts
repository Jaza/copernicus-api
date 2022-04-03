import { BaseContext } from "koa";

export default class GeneralController {
    public static async helloWorld(ctx: BaseContext): Promise<void> {
        ctx.body =
          "Copernicus, like Galileo, had this crazy outlandish idea, back in the " +
          "day, that the Earth moves around the Sun, not vice versa. It'll catch on " +
          "one day.";
    }
}
