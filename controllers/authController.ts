import formatZodErrors from "../utils/formatZodErrors";
import { Router, Express } from "express";
import env from "../utils/env";
import jwt from "jsonwebtoken";
import requestIp from "request-ip";
import { add } from "date-fns";
import { Prisma, PrismaClient } from "@prisma/client";
import { ControllerClass } from "../utils/types";
import { w } from "../utils/wrappers";
import Context from "../utils/context";
import { RedisClientType } from "../utils/redis";
import { IS_DEV } from "../utils/consts";
import _ from "lodash";
import authMiddleware from "@/middleware/authMiddleware";
import { discord_response_dto, provider_callback_dto } from "common/dtos/auth";
import fetch from "node-fetch";
import { ErrorCode } from "@/consts/errorCodes";
import { getDiscordUserByCode } from "@/utils/getDiscordUserByCode";
import optionalAuthMiddleware from "@/middleware/optionalAuthMiddleware";

export default class AuthController implements ControllerClass {
  router: Router;
  prisma: PrismaClient;
  redis: RedisClientType;

  constructor(prisma: PrismaClient, redis: RedisClientType) {
    this.router = Router();
    this.prisma = prisma;
    this.redis = redis;
  }

  public async mount(app: Express) {
    this.router.get("/me", authMiddleware, w(this, this.get_me));
    this.router.get("/:provider/callback", optionalAuthMiddleware, w(this, this.provider_callback));

    app.use("/api/v1/auth", this.router);
  }

  private async get_me(c: Context) {
    const userId = c.req.locals!.userId!;

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      c.res.json({
        data: user,
      });
    } catch (e) {
      c.raiseInternalServerError(e);
    }
  }

  private async provider_callback(c: Context) {
    const validation = await provider_callback_dto.safeParseAsync({
      provider: c.req.params["provider"],
    });
    if (!validation.success) {
      return c.res.status(400).json({ errors: formatZodErrors(validation.error) });
    }

    try {
      if (validation.data.provider === "discord") {
        const me = await getDiscordUserByCode(c.req.query["code"] as string); // internal
        const validation = await discord_response_dto.safeParseAsync(me);
        if (!validation.success) {
          return c.res.status(400).json({ errors: formatZodErrors(validation.error) });
        }

        const dbProfile = await this.prisma.profile.findUnique({
          where: {
            providerId_providerName: {
              providerId: me.id,
              providerName: "discord",
            },
          },
        });
        if (dbProfile) {
          return await this.establishSession(c, dbProfile.userId);
        }

        const dbUser = await this.prisma.user.findUnique({
          where: {
            email: me.email,
          },
          select: {
            id: true,
          },
        });
        if (dbUser) {
          await this.prisma.profile.create({
            data: {
              providerId: me.id,
              providerName: "discord",
              userId: dbUser.id,
            },
          });

          return this.establishSession(c, dbUser.id);
        }

        const user = await this.prisma.user.create({
          data: {
            name: me.username,
            email: me.email,
            avatar: `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.webp`,
            profiles: {
              create: {
                providerId: me.id,
                providerName: "discord",
              },
            },
          },
        });
        if (!user) {
          return c.res.status(401).json({ errors: [{ code: ErrorCode.NOT_AUTHENTICATED }] });
        }

        return this.establishSession(c, user.id);
      }

      c.res.status(401).json({ errors: [{ code: ErrorCode.NOT_AUTHENTICATED }] });
    } catch (e) {
      c.raiseInternalServerError(e);
    }
  }

  private async establishSession(c: Context, userId: string) {
    const session = await this.prisma.session.create({
      data: {
        userId: userId!,
        ip: requestIp.getClientIp(c.req),
        userAgent: c.req.headers["user-agent"],
        expiresAt: add(new Date(), {
          years: 2,
        }),
      },
    });

    const sessionPayload = {
      token: session.id,
      sub: userId,
      iss: "terrace.com",
      aud: "terrace.com",
      iat: +new Date(),
      exp: +session.expiresAt,
    };

    const signedSession = jwt.sign(sessionPayload, env("SESSION_JWT_SECRET")!);

    await this.redis.set("auth:session:" + session.id, session.userId, {
      EX: Math.floor((+session.expiresAt - +new Date()) / 1000),
    });

    c.res.cookie("qid", signedSession, {
      domain: env("COOKIE_DOMAIN") || undefined,
      expires: session.expiresAt,
      httpOnly: true,
      sameSite: IS_DEV() ? "lax" : "strict",
      path: "/",
      secure: !IS_DEV(),
    });

    c.res.redirect(env("FRONTEND_DOMAIN")!);
  }
}
