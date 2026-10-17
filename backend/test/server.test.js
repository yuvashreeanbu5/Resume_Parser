import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import app from "../src/server.js";

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
