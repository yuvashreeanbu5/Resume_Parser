import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pipeline } from "node:stream/promises";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import multer from "multer";
import Analysis from "./models/Analysis.js";
import {
  MAX_RESUME_SIZE,
  RequestValidationError,
  validateAnalysisSubmission,
} from "./analysisValidation.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(currentDirectory, "../.env") });

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_SIZE,
    files: 1,
    fields: 1,
    parts: 2,
  },
});

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  }),
);

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.post("/api/analyses", upload.single("resume"), async (request, response, next) => {
  let bucket;
  let uploadedFileId;

  try {
    const jobDescription = validateAnalysisSubmission(request.file, request.body.jobDescription);
    const database = mongoose.connection.db;
    if (!database) {
      throw new Error("MongoDB is not connected.");
    }

    bucket = new GridFSBucket(database, { bucketName: "resumePdfs" });
    const originalName = request.file.originalname
      .replace(/[^\w.\-() ]/g, "_")
      .slice(0, 200);
    const filename = originalName || "resume.pdf";
    const fileStream = bucket.openUploadStream(filename, {
      contentType: "application/pdf",
    });

    uploadedFileId = fileStream.id;
    await pipeline(Readable.from([request.file.buffer]), fileStream);

    const analysis = await Analysis.create({
      resume: {
        fileId: uploadedFileId,
        filename,
        size: request.file.size,
        contentType: "application/pdf",
      },
      jobDescription,
    });

    response.status(201).json({
      analysisId: analysis.id,
      status: analysis.status,
      resume: {
        filename: analysis.resume.filename,
        size: analysis.resume.size,
      },
      createdAt: analysis.createdAt,
      message: "Submission saved. AI evaluation has not been added yet.",
    });
  } catch (error) {
    if (bucket && uploadedFileId) {
      try {
        await bucket.delete(uploadedFileId);
      } catch (cleanupError) {
        console.error("Could not remove an orphaned resume upload:", cleanupError);
      }
    }
    next(error);
  }
});

app.use((_request, response) => {
  response.status(404).json({ message: "Endpoint not found." });
});

app.use((error, _request, response, _next) => {
  if (error instanceof RequestValidationError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof multer.MulterError) {
    const statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "The PDF must be 10 MB or smaller."
        : "The upload must contain one PDF and one job description.";
    response.status(statusCode).json({ message });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ message: "The submission is not valid." });
    return;
  }

  console.error("Request failed:", error);
  response.status(500).json({ message: "The server could not save this submission." });
});

export async function startServer() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required. Configure it in backend/.env.");
  }

  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port number.");
  }
  const host = process.env.HOST || "127.0.0.1";

  await mongoose.connect(mongoUri);
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(port, host, () => resolve(listener));
    listener.once("error", reject);
  });
  console.info(`Resume evaluator API listening at http://${host}:${port}.`);

  async function shutdown(signal) {
    console.info(`${signal} received; shutting down.`);
    server.close(async (error) => {
      if (error) {
        console.error("HTTP server shutdown failed:", error);
        process.exitCode = 1;
      }
      await mongoose.disconnect();
    });
  }

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  startServer().catch(async (error) => {
    console.error("Could not start the API server:", error);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

export default app;
