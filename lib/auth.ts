import { betterAuth } from "better-auth";
import { prisma } from "./db";

// Initialize Better-Auth instance with Prisma

export const auth = betterAuth({
  database: {
    provider: "prisma",
    client: prisma,
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  advanced: {
    cookieName: "amd_auth",
    generateId: () => crypto.randomUUID(),
  },

  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;
