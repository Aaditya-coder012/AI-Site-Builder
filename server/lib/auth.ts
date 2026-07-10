import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");

// Patterns that are always trusted regardless of the static list
const TRUSTED_PATTERNS: RegExp[] = [
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  // All Vercel preview deployments for this project
  /^https:\/\/ai-site-builder[a-z0-9-]*\.vercel\.app$/,
];

function matchesTrustedPattern(origin: string): boolean {
  const normalized = normalizeOrigin(origin);
  return TRUSTED_PATTERNS.some((p) => p.test(normalized));
}

const staticTrustedOrigins: string[] = [
  ...(process.env.TRUSTED_ORIGINS?.split(",")
    .map(normalizeOrigin)
    .filter(Boolean) || []),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ai-site-builder-snowy.vercel.app",
].filter((o, i, a) => a.indexOf(o) === i);

// Better Auth calls `trustedOrigins.includes(origin)` internally.
// Proxy the array so that call also checks our regex patterns, allowing
// Vercel preview URLs (which change every deployment) to pass through.
const trustedOrigins = new Proxy(staticTrustedOrigins, {
  get(target, prop, receiver) {
    if (prop === "includes") {
      return (searchElement: string) =>
        target.includes(searchElement) || matchesTrustedPattern(searchElement);
    }
    return Reflect.get(target, prop, receiver);
  },
}) as string[];

// BETTER_AUTH_URL: full backend server URL only, e.g.:
//   https://ai-site-builder-zegh.onrender.com
// Do NOT append /api/auth.
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
