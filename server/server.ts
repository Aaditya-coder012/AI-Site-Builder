import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");

// Statically trusted origins (exact string match)
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

// Dynamic patterns — covers ALL Vercel preview deployments for this project
const trustedOriginPatterns: RegExp[] = [
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  /^https:\/\/ai-site-builder[a-z0-9-]*\.vercel\.app$/,
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (staticTrustedOrigins.includes(normalized)) return true;
  return trustedOriginPatterns.some((p) => p.test(normalized));
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    isAllowedOrigin(origin)
      ? callback(null, true)
      : callback(new Error(`CORS not allowed: ${origin}`));
  },
  credentials: true,
};

// Global CORS for non-auth routes
app.use(cors(corsOptions));

// ─── Auth CORS + Better Auth 403 fix ─────────────────────────────────────────
//
// Problem: Better Auth's toNodeHandler does TWO things that break cross-origin:
//   1. It spreads trustedOrigins ([...options.trustedOrigins]) losing any Proxy
//   2. It calls trustedOrigins.includes(origin) — Vercel preview URLs fail this
//   3. It overwrites our pre-set CORS headers with its own (wrong) values
//
// Solution:
//   A. Intercept OPTIONS preflight before Better Auth sees it → respond 204
//   B. Pre-set Access-Control-Allow-Origin to the REAL origin
//   C. Lock CORS headers so Better Auth cannot overwrite them
//   D. Spoof req.headers.origin to a known-trusted value so Better Auth's
//      internal includes() check passes without returning 403
//
app.use("/api/auth", (req: Request, res: Response, next: NextFunction) => {
  const realOrigin = req.headers.origin as string | undefined;

  if (realOrigin && isAllowedOrigin(realOrigin)) {
    // ── A: Set correct CORS headers for the real browser origin ──────────────
    res.setHeader("Access-Control-Allow-Origin", realOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cookie, Set-Cookie, X-Requested-With",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    res.setHeader("Access-Control-Max-Age", "86400");

    // ── B: Lock CORS headers — prevent Better Auth from overwriting them ──────
    const _setHeader = res.setHeader.bind(res);
    const LOCKED = new Set([
      "access-control-allow-origin",
      "access-control-allow-credentials",
      "access-control-allow-headers",
      "access-control-allow-methods",
    ]);
    // @ts-ignore — intentional override to protect headers
    res.setHeader = function (name: string, value: string | number | string[]) {
      if (LOCKED.has(name.toLowerCase())) return res; // blocked
      return _setHeader(name, value);
    };

    // ── C: Spoof origin to a static trusted value for Better Auth's check ─────
    // Better Auth does: if (!trustedOrigins.includes(origin)) → 403
    // We swap the origin to one we know is in the list.
    req.headers["origin"] = "https://ai-site-builder-snowy.vercel.app";
  }

  // ── D: Answer OPTIONS immediately, do NOT let Better Auth handle preflight ──
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

// Hand everything else off to Better Auth
app.all("/api/auth/{*any}", toNodeHandler(auth));
// ─────────────────────────────────────────────────────────────────────────────

app.use(express.json({ limit: "50mb" }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
