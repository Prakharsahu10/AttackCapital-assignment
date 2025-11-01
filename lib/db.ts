import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
