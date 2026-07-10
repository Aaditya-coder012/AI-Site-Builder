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

// Statically trusted origins (exact match)
const staticTrustedOrigins = [
  ...(process.env.TRUSTED_ORIGINS?.split(",")
    .map(normalizeOrigin)
    .filter(Boolean) || []),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ai-site-builder-snowy.vercel.app",
].filter((o, i, a) => a.indexOf(o) === i);

// Dynamic patterns — allows ALL Vercel preview deployments for this project
const trustedOriginPatterns: RegExp[] = [
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  /^https:\/\/ai-site-builder[a-z0-9-]*\.vercel\.app$/,
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (staticTrustedOrigins.includes(normalized)) return true;
  return trustedOriginPatterns.some((pattern) => pattern.test(normalized));
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    }
  },
  credentials: true,
};

// Global CORS for all non-auth routes
app.use(cors(corsOptions));

// ─── Auth CORS fix ────────────────────────────────────────────────────────────
// Better Auth's toNodeHandler handles requests at the raw Node level and
// bypasses Express middleware. We intercept EVERY /api/auth request first,
// manually inject CORS headers, and immediately answer OPTIONS preflight
// so the browser's cross-origin check succeeds before Better Auth runs.
app.use("/api/auth", (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
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
  }

  // Answer OPTIONS preflight immediately — do NOT forward to Better Auth
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

// Hand off all auth requests to Better Auth after CORS headers are set
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
