import bodyParser from "body-parser";
import express from "express";
import cookieParser from "cookie-parser";
import { setupRouter } from "./router";
import cors from "cors";
import redisClient from "./utils/redis";
require("dotenv").config();

(async () => {
  await redisClient.connect();

  const app = express();
  app.use(bodyParser.json({}));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    cors({
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
      origin: ["http://localhost:3000"],
      credentials: true,
    })
  );
  app.use("/temp", express.static("temp/"));
  app.use("/media", express.static("media/"));

  setupRouter(app);

  app.listen(8000, () => {
    console.log("🚀 Server listening on http://localhost:" + 8000);
  });
})();
