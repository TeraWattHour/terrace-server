import type { Response } from "express";
import fs from "fs";
import path from "path";
import { LocalRequest } from "./types";

export default class Context {
  public req: LocalRequest;
  public res: Response;

  constructor(req: LocalRequest, res: Response) {
    this.req = req;
    this.res = res;
  }

  public raiseInternalServerError(error: unknown) {
    const writer = fs.createWriteStream(path.resolve(__dirname, "..", "logs", "errors.log"), { flags: "a", encoding: "utf-8" });

    let stringified: string;
    try {
      stringified = JSON.stringify(error);
    } catch (error) {
      stringified = "unknown error";
    }

    console.log(error);

    writer.write(`[ERROR] (${new Date().toISOString()}): ` + stringified + "\r\n");

    this.res.status(500).json({
      errors: [{ code: "" }],
    });
  }
}
