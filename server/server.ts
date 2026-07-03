import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";

const app = express();

const port = process.env.PORT || 3000;

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");

const trustedOrigins = [
  ...(process.env.TRUSTED_ORIGINS?.split(",").map(normalizeOrigin).filter(Boolean) || []),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter((origin, index, all) => all.indexOf(origin) === index);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (trustedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    const isLocalhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    callback(null, isLocalhostOrigin);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json({ limit: "50mb" }));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
