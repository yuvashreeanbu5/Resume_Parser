import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_JOB_DESCRIPTION_LENGTH,
  MAX_RESUME_SIZE,
  RequestValidationError,
  sanitizeResumeFilename,
  validateAnalysisSubmission,
} from "../utils.js";

const validFile = {
  originalname: "resume.pdf",
  mimetype: "application/pdf",
  size: 12,
  buffer: Buffer.from("%PDF-1.7 test"),
};

test("accepts a PDF and trims the job description", () => {
  assert.equal(validateAnalysisSubmission(validFile, "  Engineer role  "), "Engineer role");
});

test("sanitizes unsafe characters in an uploaded resume filename", () => {
  assert.equal(sanitizeResumeFilename("../résumé.pdf"), ".._r_sum_.pdf");
  assert.equal(sanitizeResumeFilename(""), "resume.pdf");
});

test("requires a resume", () => {
  assert.throws(
    () => validateAnalysisSubmission(undefined, "Engineer role"),
    RequestValidationError,
  );
});

test("rejects files without a PDF header", () => {
  assert.throws(
    () =>
      validateAnalysisSubmission(
        { ...validFile, buffer: Buffer.from("not a PDF") },
        "Engineer role",
      ),
    /valid PDF header/,
  );
});

test("rejects a resume that exceeds the upload size limit", () => {
  assert.throws(
    () => validateAnalysisSubmission({ ...validFile, size: MAX_RESUME_SIZE + 1 }, "Engineer role"),
    /10 MB or smaller/,
  );
});

test("requires a non-empty job description", () => {
  assert.throws(() => validateAnalysisSubmission(validFile, "  "), /job description is required/i);
});

test("limits the job description size", () => {
  assert.throws(
    () =>
      validateAnalysisSubmission(
        validFile,
        "x".repeat(MAX_JOB_DESCRIPTION_LENGTH + 1),
      ),
    /characters or fewer/,
  );
});
