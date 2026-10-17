import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import app from "../server.js";
import { createDatabaseConnectionMiddleware } from "../middleware/ensureDatabaseConnection.js";

async function listenForTest(t) {
  const server = app.listen(0);
  await once(server, "listening");
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

test("health endpoint reports the API and database state", async (t) => {
  const baseUrl = await listenForTest(t);
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", database: "disconnected" });
});

test("analysis endpoint rejects a non-PDF upload", async (t) => {
  const baseUrl = await listenForTest(t);
  const form = new FormData();
  form.append("resume", new Blob(["not a PDF"], { type: "application/pdf" }), "resume.pdf");
  form.append("jobDescription", "Software engineer");

  const response = await fetch(`${baseUrl}/api/analyses`, { method: "POST", body: form });

  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /valid PDF header/i);
});

test("database middleware continues when MongoDB connects", async () => {
  let continued = false;
  const middleware = createDatabaseConnectionMiddleware(async () => {});

  await middleware({}, {}, () => {
    continued = true;
  });

  assert.equal(continued, true);
});

test("database middleware returns a clear service error when MongoDB is unavailable", async () => {
  const originalConsoleError = console.error;
  const originalError = new Error("private database connection detail");
  let statusCode;
  let responseBody;
  console.error = () => {};
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  try {
    const middleware = createDatabaseConnectionMiddleware(async () => {
      throw originalError;
    });

    await middleware({}, response, () => {
      assert.fail("next should not be called when MongoDB connection fails");
    });
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(statusCode, 503);
  assert.match(responseBody.message, /MONGODB_URI/);
  assert.doesNotMatch(responseBody.message, /private database connection detail/);
});
