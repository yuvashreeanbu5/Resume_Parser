import assert from "node:assert/strict";
import test from "node:test";
import { scoreResume } from "../scoreResume.js";

const validResult = {
  score: 84,
  matchedSkills: ["React", "Node.js"],
  missingSkills: ["TypeScript"],
  summary: "The resume demonstrates strong frontend experience.",
};

function mockGeminiResponse(result) {
  return {
    ok: true,
    async json() {
      return {
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(result) }],
            },
          },
        ],
      };
    },
  };
}

test("sends the PDF and job description to Gemini and validates its result", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.GEMINI_API_KEY;
  const apiKey = "test-only-gemini-key";
  let requestUrl;
  let requestOptions;
  process.env.GEMINI_API_KEY = apiKey;
  globalThis.fetch = async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return mockGeminiResponse(validResult);
  };

  try {
    const result = await scoreResume(Buffer.from("%PDF-test"), "React engineer");

    assert.deepEqual(result, validResult);
    assert.equal(
      requestUrl,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
    );
    assert.equal(requestUrl.includes(apiKey), false);
    assert.equal(requestOptions.headers["x-goog-api-key"], apiKey);
    const requestBody = JSON.parse(requestOptions.body);
    assert.equal(
      requestBody.contents[0].parts[0].inline_data.data,
      Buffer.from("%PDF-test").toString("base64"),
    );
    assert.match(requestBody.contents[0].parts[1].text, /React engineer/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalApiKey;
  }
});

test("rejects out-of-range and malformed Gemini scores", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only-gemini-key";
  globalThis.fetch = async () =>
    mockGeminiResponse({ ...validResult, score: 101 });

  try {
    await assert.rejects(
      scoreResume(Buffer.from("%PDF-test"), "React engineer"),
      /invalid resume scoring result/i,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalApiKey;
  }
});

test("requires GEMINI_API_KEY without making a request", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  globalThis.fetch = async () => {
    assert.fail("Gemini must not be called without an API key");
  };

  try {
    await assert.rejects(
      scoreResume(Buffer.from("%PDF-test"), "React engineer"),
      /GEMINI_API_KEY is not configured/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey !== undefined) process.env.GEMINI_API_KEY = originalApiKey;
  }
});

test("turns Gemini HTTP errors into a key-free error", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.GEMINI_API_KEY;
  const apiKey = "test-only-gemini-key";
  process.env.GEMINI_API_KEY = apiKey;
  globalThis.fetch = async () => ({
    ok: false,
    status: 429,
    async text() {
      return JSON.stringify({
        error: { message: `Request rejected for key ${apiKey}` },
      });
    },
  });

  try {
    await assert.rejects(
      scoreResume(Buffer.from("%PDF-test"), "React engineer"),
      (error) => {
        assert.match(error.message, /HTTP 429/);
        assert.equal(error.message.includes(apiKey), false);
        assert.match(error.message, /\[REDACTED\]/);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalApiKey;
  }
});
