import { PrismaClient } from "@prisma/client";
import { IS_DEV } from "./consts";

let prisma: PrismaClient;

if (IS_DEV()) {
  globalThis.prisma = globalThis.prisma || new PrismaClient();

  prisma = globalThis.prisma;
} else {
  prisma = new PrismaClient();
}

export { prisma };
