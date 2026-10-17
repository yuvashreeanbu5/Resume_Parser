import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import Analysis from "../models/Analysis.js";
import { validateAnalysisSubmission, sanitizeResumeFilename } from "../utils.js";

export async function createAnalysisSubmission(file, rawJobDescription) {
  const jobDescription = validateAnalysisSubmission(file, rawJobDescription);
  const database = mongoose.connection.db;
  if (!database) {
    throw new Error("MongoDB is not connected.");
  }

  const bucket = new GridFSBucket(database, { bucketName: "resumePdfs" });
  const filename = sanitizeResumeFilename(file.originalname);
  const fileStream = bucket.openUploadStream(filename, {
    contentType: "application/pdf",
  });

  try {
    await pipeline(Readable.from([file.buffer]), fileStream);
    const analysis = await Analysis.create({
      resume: {
        fileId: fileStream.id,
        filename,
        size: file.size,
        contentType: "application/pdf",
      },
      jobDescription,
    });

    return analysis;
  } catch (error) {
    try {
      await bucket.delete(fileStream.id);
    } catch (cleanupError) {
      if (cleanupError.code !== "ENOENT") {
        console.error("Could not remove an orphaned resume upload:", cleanupError);
      }
    }
    throw error;
  }
}
