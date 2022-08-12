import type { Express } from "express";
import { ControllerClass } from "@/utils/types";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { w } from "@/utils/wrappers";
import Context from "@/utils/context";
import { get_user_dto } from "common/dtos/user";
import formatZodErrors from "@/utils/formatZodErrors";
import { checkImageLink } from "@/utils/checkImageLink";

export default class UserController implements ControllerClass {
  router: Router;
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.router = Router();
    this.prisma = prisma;
  }

  public async mount(app: Express) {
    this.router.get("/:userId", w(this, this.get_user));

    app.use("/api/v1/user", this.router);
  }

  private async get_user(c: Context) {
    const validation = await get_user_dto.safeParseAsync({ userId: c.req.params["userId"] });
    if (!validation.success) {
      return c.res.status(400).json({ errors: [formatZodErrors(validation.error)] });
    }
    const { data } = validation;

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: data.userId,
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      c.res.json({ data: user });
    } catch (e) {
      c.raiseInternalServerError(e);
    }
  }
}
