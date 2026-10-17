# 0 to shipped resume evaluator

The repository contains a React/Vite frontend and an Express/MongoDB backend. The backend stores uploaded PDF files in MongoDB GridFS and saves the associated job description as a pending analysis. Resume-versus-job-description AI comparison, scoring, and skill extraction are not implemented yet. After saving an upload, the frontend confirms the submission without showing fabricated results.

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Configure and run

1. Create `backend/.env` from `backend/.env.example` and set `MONGODB_URI` to your MongoDB connection string.
2. In `backend/`, run `npm install`, then `npm run dev`.
3. In `frontend/`, run `npm install`, then `npm run dev`.
4. Open the Vite URL shown in the frontend terminal (normally `http://localhost:5173`).

The frontend proxies `/api` requests to the backend on port 5000. The API health endpoint is `GET /api/health`; submit a PDF and job description to `POST /api/analyses` as multipart form data using the `resume` and `jobDescription` fields.

Run the backend validation tests with `npm test` from `backend/`. Create a production frontend build with `npm run build` from `frontend/`.

The API currently has no authentication or retention controls and binds to `127.0.0.1` by default. Before deploying it publicly or using real resumes, add access control and define a data-retention policy.
