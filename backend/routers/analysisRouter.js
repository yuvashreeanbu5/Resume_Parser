import { Router } from "express";
import { createAnalysis } from "../controllers/analysisController.js";
import { ensureDatabaseConnection } from "../middleware/ensureDatabaseConnection.js";
import { uploadResume } from "../middleware/uploadMiddleware.js";
import { validateAnalysisRequest } from "../middleware/validateAnalysisRequest.js";

const analysisRouter = Router();

analysisRouter.post(
  "/",
  uploadResume,
  validateAnalysisRequest,
  ensureDatabaseConnection,
  createAnalysis,
);

export default analysisRouter;
