import express from "express";
import { protect } from "../middlewares/auth.js";
import { createUserProject, getUserProject, getUserProjects, togglePublish, } from "../controllers/userControler.js";
const userRouter = express.Router();
// Define user routes with authentication protection middleware
userRouter.post("/project", protect, createUserProject);
userRouter.get("/project/:projectId", protect, getUserProject);
userRouter.get("/projects", protect, getUserProjects);
userRouter.get("/publish-toggle/:projectId", protect, togglePublish);
export default userRouter;
