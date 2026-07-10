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

const trustedOrigins = [
  ...(process.env.TRUSTED_ORIGINS?.split(",")
    .map(normalizeOrigin)
    .filter(Boolean) || []),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ai-site-builder-snowy.vercel.app",
].filter((origin, index, all) => all.indexOf(origin) === index);

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const normalized = normalizeOrigin(origin);
    if (trustedOrigins.includes(normalized)) {
      callback(null, true);
      return;
    }
    const isLocalhostOrigin =
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    callback(null, isLocalhostOrigin);
  },
  credentials: true,
};

// Apply CORS globally
app.use(cors(corsOptions));

// Better Auth's toNodeHandler handles requests at a low level and bypasses
// Express middleware for auth routes. We must explicitly handle OPTIONS preflight
// AND manually inject CORS headers before handing off to Better Auth.
app.options("/api/auth/*splat", cors(corsOptions));

app.use("/api/auth", (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;
  if (origin) {
    const normalized = normalizeOrigin(origin);
    if (
      trustedOrigins.includes(normalized) ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Cookie, Set-Cookie",
      );
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      );
    }
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json({ limit: "50mb" }));

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
