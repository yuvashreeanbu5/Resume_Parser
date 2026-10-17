import assert from "node:assert/strict";
import test from "node:test";
import { scoreResume } from "../scoreResume.js";

const validResult = {
  score: 84,
  matchedSkills: ["React", "Node.js"],
  missingSkills: ["TypeScript"],
  summary: "The resume demonstrates strong frontend experience.",
};

function createPdfBuffer(text) {
  const escapedText = text.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(`BT /F1 12 Tf 72 720 Td (${escapedText}) Tj ET`)} >>\nstream\nBT /F1 12 Tf 72 720 Td (${escapedText}) Tj ET\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf);
}

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

test("sends extracted resume text and job description to Gemini", async () => {
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
    const result = await scoreResume(
      createPdfBuffer("My resume says React and Node.js."),
      "React engineer",
    );

    assert.deepEqual(result, validResult);
    assert.equal(
      requestUrl,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
    );
    assert.equal(requestUrl.includes(apiKey), false);
    assert.equal(requestOptions.headers["x-goog-api-key"], apiKey);
    const requestBody = JSON.parse(requestOptions.body);
    const prompt = requestBody.contents[0].parts[0].text;
    assert.match(prompt, /My resume says React and Node\.js\./);
    assert.match(prompt, /React engineer/);
    assert.equal(requestBody.contents[0].parts[0].inline_data, undefined);
    assert.equal(requestBody.generationConfig.maxOutputTokens, 512);
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
      scoreResume(createPdfBuffer("Resume text."), "React engineer"),
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
      scoreResume(createPdfBuffer("Resume text."), "React engineer"),
      /GEMINI_API_KEY is not configured/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey !== undefined) process.env.GEMINI_API_KEY = originalApiKey;
  }
});

test("truncates resume text and job description to 6,000 characters", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.GEMINI_API_KEY;
  let requestOptions;
  process.env.GEMINI_API_KEY = "test-only-gemini-key";
  globalThis.fetch = async (_url, options) => {
    requestOptions = options;
    return mockGeminiResponse(validResult);
  };

  try {
    const result = await scoreResume(
      createPdfBuffer("x".repeat(6_001)),
      "J".repeat(6_001),
    );

    assert.deepEqual(result, validResult);
    const requestBody = JSON.parse(requestOptions.body);
    const prompt = requestBody.contents[0].parts[0].text;
    assert.equal(prompt.includes("x".repeat(6_000)), true);
    assert.equal(prompt.includes("x".repeat(6_001)), false);
    assert.equal(prompt.includes("J".repeat(6_000)), true);
    assert.equal(prompt.includes("J".repeat(6_001)), false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalApiKey;
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
      scoreResume(createPdfBuffer("Resume text."), "React engineer"),
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
