import { createAnalysisSubmission } from "../services/analysisService.js";
import { scoreResume } from "../scoreResume.js";

export async function createAnalysis(request, response, next) {
  try {
    const analysis = await createAnalysisSubmission(
      request.file,
      request.jobDescription,
    );

    let scoringResult;
    try {
      scoringResult = await scoreResume(request.file.buffer, analysis.jobDescription);
    } catch (scoringError) {
      console.error(
        `Resume scoring failed for submission ${analysis.id} (${scoringError.name || "Error"}).`,
      );
      analysis.status = "failed";
      analysis.scoringMessage =
        "Your resume and job description were saved, but scoring is temporarily unavailable. Please try again later.";
      try {
        await analysis.save();
      } catch (persistenceError) {
        console.error(
          `Could not save scoring failure status for submission ${analysis.id} (${persistenceError.name || "Error"}).`,
        );
      }
    }

    if (scoringResult) {
      const result = scoringResult;
      analysis.score = result.score;
      analysis.matchedSkills = result.matchedSkills;
      analysis.missingSkills = result.missingSkills;
      analysis.summary = result.summary;
      analysis.status = "completed";
      analysis.scoringMessage = undefined;
      await analysis.save();
    }

    response.status(201).json({
      analysisId: analysis.id,
      status: analysis.status,
      resume: {
        filename: analysis.resume.filename,
        size: analysis.resume.size,
      },
      createdAt: analysis.createdAt,
      ...(analysis.status === "completed"
        ? {
            score: analysis.score,
            matchedSkills: analysis.matchedSkills,
            missingSkills: analysis.missingSkills,
            summary: analysis.summary,
          }
        : { message: analysis.scoringMessage }),
    });
  } catch (error) {
    next(error);
  }
}
