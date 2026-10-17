import { validateAnalysisSubmission } from "../utils.js";

export function validateAnalysisRequest(request, _response, next) {
  try {
    request.jobDescription = validateAnalysisSubmission(
      request.file,
      request.body.jobDescription,
    );
    next();
  } catch (error) {
    next(error);
  }
}
