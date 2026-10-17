import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");

// NOTE: Vercel preview URL CORS is handled entirely in server.ts before this
// runs. Only static URLs need to be listed here.
const trustedOrigins: string[] = [
  "https://*.run.app",
  "https://*.vercel.app",
  "https://*",
  "http://*",
  "http://localhost:*",
  "http://127.0.0.1:*",
  "http://0.0.0.0:*",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://0.0.0.0:3000",
  ...(process.env.TRUSTED_ORIGINS?.split(",")
    .map(normalizeOrigin)
    .filter(Boolean) || []),
];

// BETTER_AUTH_URL: server URL only — no /api/auth suffix
const baseURL =
  process.env.BETTER_AUTH_URL?.replace(/\/api\/auth\/?$/, "") ||
  "http://localhost:3000";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: { enabled: true },
  },
  trustedOrigins,
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET || "ai_site_builder_dev_secret_key_8472910384729103",
  advanced: {
    disableCSRFCheck: true,
    disableOriginCheck: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
    cookies: {
      session_token: {
        name: "auth_session",
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
        },
      },
    },
  },
});
