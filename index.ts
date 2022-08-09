import bodyParser from "body-parser";
import express from "express";
import cookieParser from "cookie-parser";
import { setupRouter } from "./router";
import cors from "cors";
import redisClient from "./utils/redis";
import env from "./utils/env";
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
      origin: [env("FRONTEND_URL")!],
      credentials: true,
    })
  );
  app.use("/temp", express.static("temp/"));
  app.use("/media", express.static("media/"));

  setupRouter(app);

  app.listen(PORT, () => {
    console.log("🚀 Server listening on http://localhost:" + PORT);
  });
})();
