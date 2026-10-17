import mongoose from "mongoose";
import multer from "multer";
import { RequestValidationError } from "../utils.js";

export function errorHandler(error, _request, response, _next) {
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
}
