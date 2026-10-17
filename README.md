# Resume Parser

The repository contains a React/Vite frontend and an Express/MongoDB backend. The backend stores uploaded PDF files in MongoDB GridFS, saves the associated job description, and uses Gemini to score the resume against the job description and identify matched and missing skills. Configure `GEMINI_API_KEY` in the backend environment; never expose it in the frontend.

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Configure and run

1. Create `backend/.env` with `MONGODB_URI` and `GEMINI_API_KEY` set to your MongoDB connection string and Gemini API key.
2. In `backend/`, run `npm install`, then `npm run dev`.
3. In `frontend/`, run `npm install`, then `npm run dev`.
4. Open the Vite URL shown in the frontend terminal (normally `http://localhost:5173`).

The frontend proxies `/api` requests to the backend on port 5000. The API health endpoint is `GET /api/health`; submit a PDF and job description to `POST /api/analyses` as multipart form data using the `resume` and `jobDescription` fields.

Run the backend validation tests with `npm test` from `backend/`. Create a production frontend build with `npm run build` from `frontend/`.

The API currently has no authentication or retention controls and binds to `127.0.0.1` by default when run locally. Before deploying it publicly or using real resumes, add access control and define a data-retention policy.

## Backend structure

- `backend/server.js` configures Express and starts the local server.
- `backend/routers/` maps API paths to controllers.
- `backend/controllers/` handles HTTP requests and responses.
- `backend/services/` contains submission persistence operations.
- `backend/config/` loads environment configuration and connects to MongoDB.
- `backend/middleware/` contains database-connection, upload, not-found, and error-handling middleware.
- `backend/models/` contains Mongoose models.
- `backend/utils.js` contains shared upload validation and utility functions.
- `backend/scoreResume.js` extracts PDF text, sends up to 6,000 characters each of resume text and job description to Gemini, and validates the structured scoring result.
- `backend/api/` exposes the Express app through a Vercel serverless function.

## Deploy as a Vercel project with services

The root `vercel.json` defines one Vercel project containing two services: `backend` (Express) and `frontend` (Vite). The `/api/*` rewrite routes to the backend, and all remaining paths route to the frontend. The browser calls the backend at the same-origin `/api` path, so no service binding is required.

Import the repository as a single Vercel project with the repository root as its Root Directory. Set `MONGODB_URI` and `GEMINI_API_KEY` for the backend service in Vercel's environment variables. The frontend does not need `VITE_API_URL`; it uses the same-origin `/api` rewrite. Keep the Gemini key server-side; never prefix it with `VITE_`.

The backend function has a 60-second maximum duration, and the Gemini request times out after 45 seconds. A submission remains saved if scoring fails.

Set the MongoDB provider's network access rules to allow connections from your deployment. Do not put database credentials or other secrets in frontend environment variables; `VITE_*` values are included in the browser bundle.

Vercel Functions currently limit request bodies to 4.5 MB. The app accepts PDFs up to 10 MB locally, so larger uploads may be rejected by the Vercel API. Supporting larger PDFs in production requires uploading directly to object storage (for example, with signed uploads) rather than sending the file through a function.
