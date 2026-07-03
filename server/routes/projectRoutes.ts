import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  deleteProject,
  getProjectById,
  getProjectPreview,
  getPublishedProjects,
  makeRevision,
  rebuildProject,
  rollbackToVersion,
  saveProjectCode,
} from "../controllers/projectController.js";

const projectRouter = express.Router();

projectRouter.post("/revision/:projectId", protect, makeRevision);
projectRouter.post("/rebuild/:projectId", protect, rebuildProject);
projectRouter.post("/save/:projectId", protect, saveProjectCode);
projectRouter.post(
  "/rollback/:projectId/:versionId",
  protect,
  rollbackToVersion,
);
projectRouter.post("/preview/:projectId", protect, getProjectPreview);
projectRouter.post("/published", getPublishedProjects);
projectRouter.post("/published/:projectId", getProjectById);
projectRouter.post("/:projectId", protect, deleteProject);

export default projectRouter;
