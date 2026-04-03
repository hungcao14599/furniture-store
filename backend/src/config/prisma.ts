import { Prisma, PrismaClient } from "@prisma/client";
import { env } from "./env.js";

declare global {
  var __prisma__: PrismaClient | undefined;
}

const logLevels: Prisma.LogLevel[] =
  env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"];

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: logLevels,
  });

if (env.NODE_ENV !== "production") {
  global.__prisma__ = prisma;
}
