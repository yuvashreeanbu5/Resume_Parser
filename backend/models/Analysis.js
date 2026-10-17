import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    resume: {
      fileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      contentType: {
        type: String,
        default: "application/pdf",
      },
    },
    jobDescription: {
      type: String,
      required: true,
      maxlength: 50_000,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    matchedSkills: {
      type: [String],
      default: undefined,
    },
    missingSkills: {
      type: [String],
      default: undefined,
    },
    summary: {
      type: String,
      trim: true,
    },
    scoringMessage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Analysis", analysisSchema);
