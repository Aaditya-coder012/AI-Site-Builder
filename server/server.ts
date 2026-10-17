import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import prisma from "./lib/prisma.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import { connectMongoDB } from "./lib/mongodb.js";

// Initialize MongoDB connection non-blockingly
connectMongoDB().catch(() => {});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const clientDir = path.resolve(rootDir, "client");

const app = express();
const port = 3000;

// Enable CORS for all local and preview origins
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Quick Demo Login endpoint for one-click access
app.post("/api/auth/demo-login", async (_req: Request, res: Response) => {
  try {
    const demoUserId = "demo-user-1";
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        token,
        userId: demoUserId,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    res.cookie("auth_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: expiresAt,
    });
    const user = await prisma.user.findUnique({ where: { id: demoUserId } });
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Intercept Auth CORS and preflight
app.use("/api/auth", (req: Request, res: Response, next: any) => {
  const clientOrigin = (req.headers.origin as string) || "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", clientOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie, Set-Cookie, X-Requested-With",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  const _setHeader = res.setHeader.bind(res);
  const LOCKED = new Set([
    "access-control-allow-origin",
    "access-control-allow-credentials",
    "access-control-allow-headers",
    "access-control-allow-methods",
  ]);
  res.setHeader = function (name: string, value: any) {
    if (LOCKED.has(name.toLowerCase())) return res;
    return _setHeader(name, value);
  };

  req.headers["origin"] = "http://localhost:3000";
  next();
});

// Better Auth routes
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json({ limit: "50mb" }));

// Application API routes
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

// Database offline graceful middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  if (
    err?.name === "MongooseError" ||
    err?.name === "MongoNetworkError" ||
    err?.message?.includes("buffering timed out")
  ) {
    console.warn("[AI Studio] Database offline — returning mock response");
    if (req.method === "GET") {
      return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
    }
    return res.status(503).json({ error: "Service temporarily unavailable (database offline)" });
  }
  next(err);
});

// Frontend Vite integration
if (process.env.NODE_ENV === "production") {
  const distDir = path.resolve(clientDir, "dist");
  app.use(express.static(distDir));
  app.get("/{*any}", (_req: Request, res: Response) => {
    res.sendFile(path.resolve(distDir, "index.html"));
  });
} else {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "spa",
    root: clientDir,
  });
  app.use(vite.middlewares);
}

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
