import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");

// TRUSTED_ORIGINS env var: comma-separated list of extra allowed frontend URLs
// e.g. TRUSTED_ORIGINS=https://ai-site-builder-snowy.vercel.app
const extraOrigins = (process.env.TRUSTED_ORIGINS?.split(",")
  .map(normalizeOrigin)
  .filter(Boolean) || []);

// Better Auth trustedOrigins — list ALL known origins.
// Vercel creates a unique preview URL per deployment; we include the stable
// production URL here. All dynamic preview URLs are handled by the Express
// CORS middleware layer before this runs.
const trustedOrigins = [
  ...extraOrigins,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ai-site-builder-snowy.vercel.app",
].filter((o, i, a) => a.indexOf(o) === i);

// BETTER_AUTH_URL: full backend server URL, e.g.:
//   https://ai-site-builder-zegh.onrender.com
// Do NOT append /api/auth — Better Auth adds that itself.
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
