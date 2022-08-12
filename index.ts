import bodyParser from "body-parser";
import express from "express";
import cookieParser from "cookie-parser";
import { setupRouter } from "./router";
import cors from "cors";
import redisClient from "./utils/redis";
import env from "./utils/env";
import path from "path";
import { IS_DEV } from "./utils/consts";

require("dotenv").config();

const PORT = process.env.PORT || 8000;
(async () => {
  await redisClient.connect();

  const app = express();
  app.use(bodyParser.json({}));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    cors({
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
      origin: [env("FRONTEND_DOMAIN")!],
      credentials: true,
    })
  );

  if (!IS_DEV()) {
    app.use(express.static(path.join(__dirname, "client")));

    app.use(async (req, res, next) => {
      if (req.url.includes("/api/v1")) return next();
      res.sendFile(path.join(__dirname, "client", "index.html"));
    });
  }

  const api = express();
  setupRouter(api);

  app.use(api);

  app.listen(PORT, () => {
    console.log("🚀 Server listening on http://localhost:" + PORT);
  });
})();
