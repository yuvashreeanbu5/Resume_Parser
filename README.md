# 0 to shipped resume evaluator

The repository contains a React/Vite frontend and an Express/MongoDB backend. The backend stores uploaded PDF files in MongoDB GridFS and saves the associated job description as a pending analysis. Resume-versus-job-description AI comparison, scoring, and skill extraction are not implemented yet. After saving an upload, the frontend confirms the submission without showing fabricated results.

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Configure and run

1. Create `backend/.env` with `MONGODB_URI` set to your MongoDB connection string.
2. In `backend/`, run `npm install`, then `npm run dev`.
3. In `frontend/`, run `npm install`, then `npm run dev`.
4. Open the Vite URL shown in the frontend terminal (normally `http://localhost:5173`).

The frontend proxies `/api` requests to the backend on port 5000. The API health endpoint is `GET /api/health`; submit a PDF and job description to `POST /api/analyses` as multipart form data using the `resume` and `jobDescription` fields.

Run the backend validation tests with `npm test` from `backend/`. Create a production frontend build with `npm run build` from `frontend/`.

The API currently has no authentication or retention controls and binds to `127.0.0.1` by default. Before deploying it publicly or using real resumes, add access control and define a data-retention policy.

## Deploy as two Vercel projects

Create two Vercel projects from this repository:

1. **Frontend project:** set the Root Directory to `frontend`. The included `frontend/vercel.json` configures the Vite build and SPA fallback. Add the `VITE_API_URL` environment variable with the backend project's public origin, for example `https://your-backend.vercel.app` (no trailing slash), then redeploy.
2. **Backend project:** set the Root Directory to `backend`. The included `backend/vercel.json` configures the serverless API function. Add `MONGODB_URI` with your MongoDB connection string and `FRONTEND_ORIGIN` with the frontend project's public origin. Multiple allowed frontend origins can be comma-separated.

Set the MongoDB provider's network access rules to allow connections from your deployed backend. Do not put database credentials or other secrets in frontend environment variables; `VITE_*` values are included in the browser bundle.

Vercel Functions currently limit request bodies to 4.5 MB. The app accepts PDFs up to 10 MB locally, so larger uploads may be rejected by the Vercel API. Supporting larger PDFs in production requires uploading directly to object storage (for example, with signed uploads) rather than sending the file through a function.
