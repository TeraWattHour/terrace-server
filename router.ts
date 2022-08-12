import type { Express } from "express";
import AuthController from "./controllers/authController";
import ListController from "./controllers/listController";
import PlaceController from "./controllers/placeController";
import { prisma } from "./utils/prisma";
import redisClient from "./utils/redis";
import UserController from "./controllers/userController";
import rateLimit from "express-rate-limit";
import { IS_DEV } from "./utils/consts";

export const setupRouter = (app: Express): void => {
  if (!IS_DEV()) {
    app.use(
      rateLimit({
        windowMs: 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
  }

  new AuthController(prisma, redisClient).mount(app);
  new ListController(prisma).mount(app);
  new PlaceController(prisma).mount(app);
  new UserController(prisma).mount(app);
};
