import { Router } from "express";
import { createAnalysis } from "../controllers/analysisController.js";
import { uploadResume } from "../middleware/uploadMiddleware.js";

const analysisRouter = Router();

analysisRouter.post("/", uploadResume, createAnalysis);

export default analysisRouter;
