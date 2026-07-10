import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");

// NOTE: Vercel preview URL CORS is handled entirely in server.ts before this
// runs. Only static URLs need to be listed here.
const trustedOrigins: string[] = [
  ...(process.env.TRUSTED_ORIGINS?.split(",")
    .map(normalizeOrigin)
    .filter(Boolean) || []),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ai-site-builder-snowy.vercel.app",
].filter((o, i, a) => a.indexOf(o) === i);

// BETTER_AUTH_URL: your Render server URL only — no /api/auth suffix.
// e.g. https://ai-site-builder-zegh.onrender.com
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
  secret: process.env.BETTER_AUTH_SECRET!,
  advanced: {
    cookies: {
      session_token: {
        name: "auth_session",
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
        },
      },
    },
  },
});
