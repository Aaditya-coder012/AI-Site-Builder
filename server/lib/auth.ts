import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");

// TRUSTED_ORIGINS env var should be a comma-separated list of allowed frontend URLs
// e.g. TRUSTED_ORIGINS=https://ai-site-builder-snowy.vercel.app
const trustedOrigins = [
  ...(process.env.TRUSTED_ORIGINS?.split(",").map(normalizeOrigin).filter(Boolean) || []),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ai-site-builder-snowy.vercel.app",
].filter((origin, index, all) => all.indexOf(origin) === index);

// BETTER_AUTH_URL must be the full backend server URL, e.g.:
// https://ai-site-builder-zegh.onrender.com
// Do NOT include /api/auth in this value
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
