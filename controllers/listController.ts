import { ErrorCode } from "@/consts/errorCodes";
import { create_list_dto, get_list_dto, search_list_dto } from "@/dtos/list";
import authMiddleware from "@/middleware/authMiddleware";
import Context from "@/utils/context";
import formatZodErrors from "@/utils/formatZodErrors";
import { ControllerClass } from "@/utils/types";
import { w } from "@/utils/wrappers";
import { PrismaClient } from "@prisma/client";
import { Express, Router } from "express";
import _ from "lodash";

export default class ListController implements ControllerClass {
  router: Router;
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.router = Router();
    this.prisma = prisma;
  }

  public async mount(app: Express) {
    this.router.get("/", w(this, this.search_lists));
    this.router.post("/", w(this, this.create_list));
    this.router.get("/:listId", w(this, this.get_list));
    // this.router.get("/me", authMiddleware, w(this, this.getMe));

    app.use("/api/v1/list", this.router);
  }

  private async search_lists(c: Context) {
    const validation = await search_list_dto.safeParseAsync({
      term: c.req.query["term"],
    });
    if (!validation.success) {
      return c.res
        .status(400)
        .json({ errors: formatZodErrors(validation.error) });
    }
    const { data } = validation;

    try {
      const lists = await this.prisma.list.findMany({
        where: {
          name: {
            search: data.term,
          },
          description: {
            search: data.term,
          },
        },
        select: {
          id: true,
          name: true,
          thumbnailUrl: true,
          places: {
            select: {
              id: true,
            },
          },
        },
        take: 16,
      });

      c.res.json({
        data: lists
          .filter((x) => x.places.length > 0)
          .map((x) => _.omit(x, "places")),
      });
    } catch (e) {
      c.raiseInternalServerError(e);
    }
  }

  private async get_list(c: Context) {
    const validation = await get_list_dto.safeParseAsync({
      listId: c.req.params["listId"],
    });
    if (!validation.success) {
      return c.res
        .status(400)
        .json({ errors: formatZodErrors(validation.error) });
    }
    const { data } = validation;

    try {
      const list = await this.prisma.list.findUnique({
        where: {
          id: data.listId,
        },
        select: {
          id: true,
          bannerUrl: true,
          description: true,
          name: true,
          thumbnailUrl: true,
          userId: true,
          places: {
            select: {
              id: true,
              lat: true,
              lon: true,
              description: true,
              thumbnailUrl: true,
              bannerUrl: true,
              name: true,
            },
          },
        },
      });
      if (!list) {
        return c.res
          .status(404)
          .json({ errors: [{ code: ErrorCode.NOT_FOUND }] });
      }

      c.res.json({
        data: list,
      });
    } catch (e) {
      c.raiseInternalServerError(e);
    }
  }

  private async create_list(c: Context) {
    const validation = await create_list_dto.safeParseAsync(c.req.body);
    if (!validation.success) {
      return c.res
        .status(400)
        .json({ errors: formatZodErrors(validation.error) });
    }
    const { data } = validation;
    try {
      const list = await this.prisma.list.create({
        data: {
          name: data.name,
          bannerUrl: data.bannerUrl,
          thumbnailUrl: data.thumbnailUrl,
          description: data.description,
          userId: "cl6ljmeco0009dn4t5chuq26p",
        },
      });

      c.res.json(list);
    } catch (e) {
      c.raiseInternalServerError(e);
    }
  }
}
