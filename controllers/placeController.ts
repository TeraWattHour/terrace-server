import { ErrorCode } from "@/consts/errorCodes";
import { create_list_dto, get_list_dto, search_list_dto } from "@/dtos/list";
import { get_place_dto } from "@/dtos/place";
import authMiddleware from "@/middleware/authMiddleware";
import Context from "@/utils/context";
import formatZodErrors from "@/utils/formatZodErrors";
import { ControllerClass } from "@/utils/types";
import { w } from "@/utils/wrappers";
import { PrismaClient } from "@prisma/client";
import { Express, Router } from "express";
import _ from "lodash";

export default class PlaceController implements ControllerClass {
  router: Router;
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.router = Router();
    this.prisma = prisma;
  }

  public async mount(app: Express) {
    this.router.get("/:placeId", w(this, this.get_place));

    app.use("/api/v1/place", this.router);
  }

  private async get_place(c: Context) {
    const validation = await get_place_dto.safeParseAsync({
      placeId: c.req.params["placeId"],
    });
    if (!validation.success) {
      return c.res
        .status(400)
        .json({ errors: formatZodErrors(validation.error) });
    }
    const { data } = validation;

    try {
      const place = await this.prisma.place.findUnique({
        where: {
          id: data.placeId,
        },
      });
      if (!place) {
        return c.res
          .status(404)
          .json({ errors: [{ code: ErrorCode.NOT_FOUND }] });
      }

      c.res.json({ data: place });
    } catch (e) {
      c.raiseInternalServerError(e);
    }
  }
}
