export const MAX_RESUME_SIZE = 10 * 1024 * 1024;
export const MAX_JOB_DESCRIPTION_LENGTH = 50_000;

export class RequestValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "RequestValidationError";
    this.statusCode = 400;
  }
}

export function validateAnalysisSubmission(file, jobDescription) {
  if (!file) {
    throw new RequestValidationError("Attach a PDF resume to continue.");
  }

  if (file.size > MAX_RESUME_SIZE) {
    throw new RequestValidationError("The PDF must be 10 MB or smaller.");
  }

  const hasPdfName = file.originalname.toLowerCase().endsWith(".pdf");
  if (!hasPdfName && file.mimetype !== "application/pdf") {
    throw new RequestValidationError("The uploaded file must be a PDF.");
  }

  const pdfHeader = Buffer.from("%PDF-");
  const headerEnd = Math.min(file.buffer.length, 1024);
  if (file.buffer.subarray(0, headerEnd).indexOf(pdfHeader) === -1) {
    throw new RequestValidationError("The uploaded file does not contain a valid PDF header.");
  }

  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    throw new RequestValidationError("A job description is required.");
  }

  const normalizedJobDescription = jobDescription.trim();
  if (normalizedJobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
    throw new RequestValidationError(
      `The job description must be ${MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()} characters or fewer.`,
    );
  }

  return normalizedJobDescription;
}
