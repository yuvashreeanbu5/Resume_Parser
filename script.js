const fileInput = document.querySelector("#resume-file");
const dropzone = document.querySelector("#dropzone");
const dropzoneTitle = document.querySelector("#dropzone-title");
const dropzoneSubtitle = document.querySelector("#dropzone-subtitle");
const fileMessage = document.querySelector("#file-message");
const analyzeButton = document.querySelector("#analyze-button");
const emptyState = document.querySelector("#empty-state");
const scoreContent = document.querySelector("#score-content");
const resumeFilename = document.querySelector("#resume-filename");

const maxFileSize = 10 * 1024 * 1024;
let selectedFile = null;

function showFileError(message) {
  selectedFile = null;
  fileInput.value = "";
  analyzeButton.disabled = true;
  fileMessage.textContent = message;
  fileMessage.classList.add("is-error");
  dropzoneTitle.textContent = "Drop your PDF right here";
  dropzoneSubtitle.innerHTML = 'or <span>browse files</span> on your device';
}

function selectFile(file) {
  if (!file) return;

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    showFileError("That file doesn’t look like a PDF. Choose a .pdf to continue.");
    return;
  }

  if (file.size > maxFileSize) {
    showFileError("That PDF is over 10 MB. Choose a smaller file to continue.");
    return;
  }

  selectedFile = file;
  analyzeButton.disabled = false;
  fileMessage.textContent = "Ready when you are.";
  fileMessage.classList.remove("is-error");
  dropzoneTitle.textContent = file.name;
  dropzoneSubtitle.innerHTML = "PDF selected <span>· Choose another</span>";
}

fileInput.addEventListener("change", () => selectFile(fileInput.files[0]));

dropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

for (const eventName of ["dragenter", "dragover"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });
}

for (const eventName of ["dragleave", "drop"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
  });
}

dropzone.addEventListener("drop", (event) => {
  selectFile(event.dataTransfer.files[0]);
});

analyzeButton.addEventListener("click", () => {
  if (!selectedFile) return;

  resumeFilename.textContent = selectedFile.name;
  emptyState.hidden = true;
  scoreContent.hidden = false;
  fileMessage.textContent = "Sample results are ready.";
});
