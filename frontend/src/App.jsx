import { useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
function BrandMark() {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="34" height="34" rx="11" fill="currentColor" />
      <path
        d="M10 22.5 16 16l4 4 6-8"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.5 12H26v4.5"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M14 32.5h-1.5a8.5 8.5 0 0 1-.8-17 12.5 12.5 0 0 1 24.4 2.7 7.2 7.2 0 0 1-.6 14.3H34"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M24 34V21m0 0-5 5m5-5 5 5m-5 8v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyIllustration() {
  return (
    <svg viewBox="0 0 120 112" fill="none" aria-hidden="true">
      <path
        d="M27 14.5A7.5 7.5 0 0 1 34.5 7h42L99 29.5v66a7.5 7.5 0 0 1-7.5 7.5h-57a7.5 7.5 0 0 1-7.5-7.5v-81Z"
        fill="#F3F1E9"
        stroke="#D9D7CC"
        strokeWidth="1.5"
      />
      <path d="M76 7v17a5.5 5.5 0 0 0 5.5 5.5H99" stroke="#D9D7CC" strokeWidth="1.5" />
      <path
        d="M43 48h39M43 59h27M43 70h19"
        stroke="#C8C6BB"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="83" cy="78" r="20" fill="#D9F27E" stroke="white" strokeWidth="4" />
      <path
        d="m75 78 5.5 5.5L92 71"
        stroke="#22352A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m25 34-2.5 5L17 41l5.5 2 2.5 5 2-5 5-2-5-2-2-5Z" fill="#A8BF69" />
    </svg>
  );
}

function StorageIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function ResultsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SubmissionStatus({ filename, submissionId }) {
  return (
    <div className="submission-content">
      <div className="resume-label">
        <span className="pdf-icon">PDF</span>
        <span className="resume-filename">{filename}</span>
      </div>
      <div className="submission-status">
        <span className="submission-status-icon" aria-hidden="true">✓</span>
        <h3>Resume and job description saved</h3>
        <p>
          Your submission is stored and ready for comparison. AI scoring will be added later; no
          score or skill matches are available yet.
        </p>
      </div>
      <div className="submission-id">
        <span>SUBMISSION ID</span>
        <code>{submissionId}</code>
      </div>
    </div>
  );
}

function UploadPanel({ onAnalyze }) {
  const fileInputRef = useRef(null);
  const dragDepthRef = useRef(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [fileMessage, setFileMessage] = useState("");
  const [fileError, setFileError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function processFile(file) {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(null);
      setFileError(true);
      setFileMessage("That file doesn’t look like a PDF. Choose a .pdf to continue.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFileError(true);
      setFileMessage("That PDF is over 10 MB. Choose a smaller file to continue.");
      return;
    }
    setSelectedFile(file);
    setFileError(false);
    setFileMessage("Ready when you are.");
  }

  function handleInputChange(event) {
    processFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit() {
    if (!selectedFile || !jobDescription.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setFileError(false);
    try {
      await onAnalyze(selectedFile, jobDescription.trim());
      setFileMessage("Submission saved. AI scoring is not connected yet.");
    } catch (error) {
      setFileError(true);
      setFileMessage(error instanceof Error ? error.message : "Unable to save your submission.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="upload-panel panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">THE STARTING LINE</p>
          <h2>Bring your resume</h2>
        </div>
        <span className="step-pill">
          STEP 01 <span>OF 02</span>
        </span>
      </div>

      <p className="panel-description">
        We’ll take a look at your skills and give you a simple, no-drama score.
      </p>

      <label
        className={`dropzone${isDragging ? " is-dragging" : ""}`}
        id="dropzone"
        htmlFor="resume-file"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepthRef.current += 1;
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
          if (dragDepthRef.current === 0) setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          id="resume-file"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
        />
        <span className="upload-icon">
          <UploadIcon />
        </span>
        <span className="dropzone-title">
          {selectedFile?.name || "Drop your PDF right here"}
        </span>
        <span className="dropzone-subtitle">
          {selectedFile ? (
            <>
              PDF selected <span>· Choose another</span>
            </>
          ) : (
            <>
              or <span>browse files</span> on your device
            </>
          )}
        </span>
        <span className="file-limit">
          PDF only <span>·</span> Max 10 MB
        </span>
      </label>

      <label className="job-description-label" htmlFor="job-description">
        Job description
        <span>Paste the role description you want to compare against.</span>
      </label>
      <textarea
        id="job-description"
        className="job-description-input"
        value={jobDescription}
        onChange={(event) => setJobDescription(event.target.value)}
        maxLength={50000}
        placeholder="Paste the job description here..."
        rows={4}
      />

      <p className={`file-message${fileError ? " is-error" : ""}`} role="status" aria-live="polite">
        {fileMessage}
      </p>

      <div className="upload-footer">
        <span className="privacy-note">
          <StorageIcon />
          Sent to server for storage
        </span>
        <button
          className="analyze-button"
          type="button"
          disabled={!selectedFile || !jobDescription.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : "Save for comparison"}
          <ArrowIcon />
        </button>
      </div>
      <p className="mock-disclaimer">
        Your PDF and job description are saved to MongoDB. AI comparison will be added later.
      </p>
    </div>
  );
}

function App() {
  const [submission, setSubmission] = useState(null);

  async function handleAnalyze(file, jobDescription) {
    const configuredApiUrl = import.meta.env.VITE_API_URL;
    if (import.meta.env.PROD && !configuredApiUrl) {
      throw new Error("Set VITE_API_URL to the deployed backend URL in the Vercel project settings.");
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    const apiBaseUrl = (configuredApiUrl || "").replace(/\/+$/, "");
    const response = await fetch(`${apiBaseUrl}/api/analyses`, {
      method: "POST",
      body: formData,
    });
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const result = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new Error(result?.message || "Unable to save your submission. Please try again.");
    }

    setSubmission({
      filename: result.resume.filename,
      id: result.analysisId,
    });
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="0 to shipped home">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span className="brand-name">0 to shipped</span>
        </a>

        <div className="topbar-note">
          <span className="status-dot" />
          A tiny tool for your next big move
        </div>
        <span className="prototype-tag">
          <span aria-hidden="true">✳</span> Mock prototype
        </span>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              YOUR CAREER, IN BETA
            </p>
            <h1 id="page-title">
              A little more signal.
              <br />
              <span>A lot less guessing.</span>
            </h1>
            <p className="intro-description">
              Submit your resume and a job description to prepare them for comparison.
            </p>
          </div>
          <div className="step-note" aria-label="Two steps">
            <span className="step-number">01</span>
            <span className="step-divider" />
            <span>Resume PDF</span>
            <span className="step-divider" />
            <span>Job description</span>
          </div>
        </section>

        <section className="workspace" aria-label="Resume parser">
          <UploadPanel onAnalyze={handleAnalyze} />

          <aside className="results-panel panel" aria-labelledby="results-heading" aria-live="polite">
            <div className="results-topline">
              <div>
                <p className="section-kicker">YOUR SUBMISSION</p>
                <h2 id="results-heading">{submission ? "Submission saved" : "Get started"}</h2>
              </div>
              <span className="result-icon">
                <ResultsIcon />
              </span>
            </div>

            {submission ? (
              <SubmissionStatus filename={submission.filename} submissionId={submission.id} />
            ) : (
              <div className="empty-state">
                <span className="empty-illustration">
                  <EmptyIllustration />
                </span>
                <h3>Your comparison starts here</h3>
                <p>
                  Submit a resume PDF and job description. They’ll be saved for AI comparison when
                  that feature is added.
                </p>
              </div>
            )}
          </aside>
        </section>

        <footer className="page-footer">
          <span>MADE FOR THE NEXT VERSION OF YOU</span>
          <span className="footer-spark" aria-hidden="true">
            ✳
          </span>
          <span>One step closer to shipped.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
