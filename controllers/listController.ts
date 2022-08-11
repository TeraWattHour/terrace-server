import { ErrorCode } from "@/consts/errorCodes";
import { create_list_dto, get_list_by_user_dto, get_list_dto, search_list_dto } from "common/dtos/list";
import authMiddleware from "@/middleware/authMiddleware";
import Context from "@/utils/context";
import formatZodErrors from "@/utils/formatZodErrors";
import { ControllerClass } from "@/utils/types";
import { w } from "@/utils/wrappers";
import { PrismaClient } from "@prisma/client";
import { Express, Router } from "express";
import _ from "lodash";
import { create_list_dto_server } from "@/dtos/list";

export default class ListController implements ControllerClass {
  router: Router;
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.router = Router();
    this.prisma = prisma;
  }

  public async mount(app: Express) {
    this.router.get("/", w(this, this.search_lists));
    this.router.post("/", authMiddleware, w(this, this.create_list));
    this.router.get("/:listId", w(this, this.get_list));
    this.router.get("/user/:userId", w(this, this.get_lists_by_user));

    app.use("/api/v1/list", this.router);
  }

  private async get_lists_by_user(c: Context) {
    const validation = await get_list_by_user_dto.safeParseAsync({
      userId: c.req.params["userId"],
      take: c.req.query["take"],
      cursor: c.req.query["cursor"],
    });
    if (!validation.success) {
      return c.res.status(400).json({ errors: formatZodErrors(validation.error) });
    }
    const { data } = validation;

    try {
      const { _count: listCount } = await this.prisma.list.aggregate({
        where: {
          userId: data.userId,
        },
        _count: true,
      });
      if (listCount === 0) {
        return c.res.json({
          pagination: {
            cursor: data.cursor || null,
            nextCursor: null,
            total: 0,
            take: data.take,
          },
          data: [],
        });
      }
      const pagination = data.cursor ? { cursor: { id: data.cursor } } : null;
      const lists = await this.prisma.list.findMany({
        where: {
          userId: data.userId,
        },
        ...pagination,
        take: data.take,
        select: {
          id: true,
          name: true,
          thumbnail: true,
        },
      });

      c.res.json({
        pagination: {
          cursor: data.cursor || null,
          nextCursor: null,
          total: listCount,
          take: data.take,
        },
        data: lists,
      });
    } catch (e) {
      c.raiseInternalServerError(e);
    }
  }

  private async search_lists(c: Context) {
    const validation = await search_list_dto.safeParseAsync({
      term: c.req.query["term"],
    });
    if (!validation.success) {
      return c.res.status(400).json({ errors: formatZodErrors(validation.error) });
    }
    const { data } = validation;

    try {
      const lists = await this.prisma.list.findMany({
        where: {
          name: {
            search: escape(data.term),
          },
          description: {
            search: escape(data.term),
          },
        },
        select: {
          id: true,
          name: true,
          thumbnail: true,
          places: {
            select: {
              id: true,
            },
          },
        },
        take: 16,
      });

      c.res.json({
        data: lists.filter((x) => x.places.length > 0).map((x) => _.omit(x, "places")),
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
      return c.res.status(400).json({ errors: formatZodErrors(validation.error) });
    }
    const { data } = validation;

    try {
      const list = await this.prisma.list.findUnique({
        where: {
          id: data.listId,
        },
        select: {
          id: true,
          description: true,
          name: true,
          thumbnail: true,
          userId: true,
          places: {
            select: {
              id: true,
              lat: true,
              lon: true,
              description: true,
              thumbnail: true,
              banner: true,
              name: true,
            },
          },
        },
      });
      if (!list) {
        return c.res.status(404).json({ errors: [{ code: ErrorCode.NOT_FOUND }] });
      }

      c.res.json({
        data: list,
      });
    } catch (e) {
      c.raiseInternalServerError(e);
    }
  }

  private async create_list(c: Context) {
    const userId = c.req.locals!.userId!;

    const validation = await create_list_dto_server.safeParseAsync(c.req.body);
    if (!validation.success) {
      return c.res.status(400).json({ errors: [{ code: ErrorCode.VALIDATION, data: validation.error }] });
    }
    const { data } = validation;
    try {
      const list = await this.prisma.list.create({
        data: {
          name: data.name,
          thumbnail: data.thumbnail,
          description: data.description,
          userId,
          places: {
            createMany: {
              data: data.places.map((x) => ({
                name: x.name,
                lat: x.lat,
                lon: x.lon,
                description: x.description,
                banner: x.banner,
                thumbnail: x.thumbnail,
                userId,
              })),
            },
          },
        },
      });

      c.res.status(201).json({ data: list });
    } catch (e) {
      c.raiseInternalServerError(e);
    }
  }
}
