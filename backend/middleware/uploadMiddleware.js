import multer from "multer";
import { MAX_RESUME_SIZE } from "../utils.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_SIZE,
    files: 1,
    fields: 1,
    parts: 2,
  },
});

export const uploadResume = upload.single("resume");
