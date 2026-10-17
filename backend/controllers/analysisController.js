import { createAnalysisSubmission } from "../services/analysisService.js";

export async function createAnalysis(request, response, next) {
  try {
    const analysis = await createAnalysisSubmission(
      request.file,
      request.jobDescription,
    );

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
    next(error);
  }
}
