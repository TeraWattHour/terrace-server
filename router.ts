import type { Express } from "express";
import AuthController from "./controllers/authController";
import ListController from "./controllers/listController";
import PlaceController from "./controllers/placeController";
import { prisma } from "./utils/prisma";
import redisClient from "./utils/redis";
import UserController from "./controllers/userController";

export const setupRouter = (app: Express) => {
  new AuthController(prisma, redisClient).mount(app);
  new ListController(prisma).mount(app);
  new PlaceController(prisma).mount(app);
  new UserController(prisma).mount(app);
};
