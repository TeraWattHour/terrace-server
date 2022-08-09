import type { Express } from "express";
import AuthController from "./controllers/authController";
import ListController from "./controllers/listController";
import PlaceController from "./controllers/placeController";
import { prisma } from "./utils/prisma";
import redisClient from "./utils/redis";
import express from "express";
import path from "path";

export const setupRouter = (app: Express) => {
  app.use(express.static(path.join(__dirname, "dist")));

  app.get("*", async (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });

  new AuthController(prisma, redisClient).mount(app);
  new ListController(prisma).mount(app);
  new PlaceController(prisma).mount(app);
};
