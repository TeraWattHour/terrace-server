import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../utils/env";
import { prisma } from "../utils/prisma";
import redisClient from "../utils/redis";
import { isBefore } from "date-fns";
import { ErrorCode } from "common/errorCodes";
import { LocalRequest } from "@/utils/types";

export default async function authMiddleware(req: LocalRequest, res: Response, next: NextFunction) {
  const fail = () => {
    res.clearCookie("qid");
    res.status(401).json({
      errors: [{ code: ErrorCode.NOT_AUTHENTICATED }],
    });
  };

  const qid = req.cookies["qid"];
  if (!qid) {
    return fail();
  }

  let decoded: any;
  try {
    decoded = jwt.verify(qid, env("SESSION_JWT_SECRET")!);
  } catch (error) {
    return fail();
  }
  if (!decoded || !decoded.sub || !decoded.token || !decoded.exp || +new Date() > decoded.exp) {
    return fail();
  }

  const cached = await redisClient.get("auth:session:" + decoded.token);

  if (cached && cached === decoded.sub) {
    req.locals = {
      userId: cached,
    };
    return next();
  }

  const session = await prisma.session.findFirst({
    where: {
      id: decoded.token,
      userId: decoded.sub,
    },
  });
  if (!session || isBefore(session.expiresAt, new Date())) {
    return fail();
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
      bannedAt: null,
    },
    select: {
      id: true,
    },
  });
  if (!user) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return fail();
  }

  await redisClient.set("auth:session:" + session.id, session.userId, {
    EX: Math.floor((+session.expiresAt - +new Date()) / 1000),
  });

  req.locals = {
    userId: user.id,
  };

  next();
}
