import { useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const presentSkills = ["JavaScript", "React", "HTML & CSS", "Git", "Communication"];
const missingSkills = ["TypeScript", "Testing", "Accessibility"];

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

function PrivacyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5.5 7V4.8a2.5 2.5 0 0 1 5 0V7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
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

function ScoreResults({ filename }) {
  return (
    <div className="score-content">
      <div className="resume-label">
        <span className="pdf-icon">PDF</span>
        <span className="resume-filename">{filename}</span>
        <span className="sample-label">SAMPLE</span>
      </div>
      <div className="score-summary">
        <div className="score-ring" aria-label="Resume score: 82 out of 100">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="score-track" cx="60" cy="60" r="50" />
            <circle className="score-progress" cx="60" cy="60" r="50" />
          </svg>
          <div className="score-number">
            <strong>82</strong>
            <span>out of 100</span>
          </div>
        </div>
        <div className="score-copy">
          <span className="score-badge">
            <span />
            STRONG START
          </span>
          <h3>Looking good!</h3>
          <p>Your resume lines up with a lot of the skills for this role.</p>
        </div>
      </div>
      <div className="score-divider" />
      <SkillSection
        title="Skills you have"
        count={`${String(presentSkills.length).padStart(2, "0")} FOUND`}
        skills={presentSkills}
        kind="present"
      />
      <SkillSection
        title="Skills to build"
        count={`${String(missingSkills.length).padStart(2, "0")} TO EXPLORE`}
        skills={missingSkills}
        kind="missing"
      />
      <p className="result-footnote">A little direction, not the whole story. Keep going.</p>
    </div>
  );
}

function SkillSection({ title, count, skills, kind }) {
  const marker = kind === "present" ? "✓" : "+";

  return (
    <div className={`skill-section ${kind === "missing" ? "missing-section" : ""}`}>
      <div className="skill-heading">
        <h3>{title}</h3>
        <span className={`skill-count ${kind}-count`}>{count}</span>
      </div>
      <div className="skill-list">
        {skills.map((skill) => (
          <span className={`skill-chip ${kind}`} key={skill}>
            <span>{marker}</span>
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function UploadPanel({ onAnalyze }) {
  const fileInputRef = useRef(null);
  const dragDepthRef = useRef(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMessage, setFileMessage] = useState("");
  const [fileError, setFileError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

      <p className={`file-message${fileError ? " is-error" : ""}`} role="status" aria-live="polite">
        {fileMessage}
      </p>

      <div className="upload-footer">
        <span className="privacy-note">
          <PrivacyIcon />
          Stays on this device
        </span>
        <button
          className="analyze-button"
          type="button"
          disabled={!selectedFile}
          onClick={() => {
            onAnalyze(selectedFile);
            setFileMessage("Sample results are ready.");
          }}
        >
          Score my resume
          <ArrowIcon />
        </button>
      </div>
      <p className="mock-disclaimer">
        This is a visual demo — your results are sample data, not a real evaluation.
      </p>
    </div>
  );
}

function App() {
  const [resultFilename, setResultFilename] = useState("");
  const [hasResults, setHasResults] = useState(false);

  function handleAnalyze(file) {
    if (!file) return;
    setResultFilename(file.name);
    setHasResults(true);
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
              Drop in your resume. Get a quick read on your score, the skills you’ve got, and the
              ones to add.
            </p>
          </div>
          <div className="step-note" aria-label="Three easy steps">
            <span className="step-number">01</span>
            <span className="step-divider" />
            <span>Upload</span>
            <span className="step-divider" />
            <span>Get your readout</span>
          </div>
        </section>

        <section className="workspace" aria-label="Resume parser">
          <UploadPanel onAnalyze={handleAnalyze} />

          <aside className="results-panel panel" aria-labelledby="results-heading" aria-live="polite">
            <div className="results-topline">
              <div>
                <p className="section-kicker">YOUR QUICK READ</p>
                <h2 id="results-heading">The good stuff</h2>
              </div>
              <span className="result-icon">
                <ResultsIcon />
              </span>
            </div>

            {hasResults ? (
              <ScoreResults filename={resultFilename} />
            ) : (
              <div className="empty-state">
                <span className="empty-illustration">
                  <EmptyIllustration />
                </span>
                <h3>Your readout starts here</h3>
                <p>
                  Upload a resume and your score, matching skills, and next-step skills will show
                  up here.
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
