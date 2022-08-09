import formatZodErrors from "../utils/formatZodErrors";
import { Router, Express } from "express";
import bcrypt from "bcryptjs";
import env from "../utils/env";
import jwt from "jsonwebtoken";
import requestIp from "request-ip";
import { add } from "date-fns";
import { Prisma, PrismaClient } from "@prisma/client";
import { ControllerClass } from "../utils/types";
import { w } from "../utils/wrappers";
import Context from "../utils/context";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { RedisClientType } from "../utils/redis";
import { IS_DEV } from "../utils/consts";
import _ from "lodash";
import authMiddleware from "@/middleware/authMiddleware";

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
    // this.router.get("/me", authMiddleware, w(this, this.getMe));

    // this.router.post("/sign-in", w(this, this.signIn));
    // this.router.post("/sign-up", w(this, this.signUp));

    // this.router.post("/verify-account", w(this, this.verifyAccount));
    // this.router.post("/resend-verification-email", w(this, this.resendVerificationEmail));

    app.use("/api/v1/auth", this.router);
  }
}
