/**
 * Part 2: API / Backend Testing
 * Platform: JSONPlaceholder (https://jsonplaceholder.typicode.com)
 *
 * Goal (per PDF):
 * - Create tests for positive and negative cases within the APIs.
 *
 * Output artifacts:
 * - Test result (JSON): api-testing/result/
 */

import fs from "node:fs";
import path from "node:path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}${pad(d.getSeconds())}`;
}

async function httpJson(url, options = {}) {
  const start = Date.now();
  const res = await fetch(url, { redirect: "follow", ...options });
  const elapsedMs = Date.now() - start;
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  let json = null;
  if (contentType.includes("application/json")) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }
  return { res, elapsedMs, text, json };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runTest(name, fn) {
  const startedAt = new Date().toISOString();
  try {
    const details = await fn();
    return { name, status: "pass", startedAt, finishedAt: new Date().toISOString(), details };
  } catch (err) {
    return {
      name,
      status: "fail",
      startedAt,
      finishedAt: new Date().toISOString(),
      error: { message: err?.message || String(err), stack: err?.stack || null },
    };
  }
}

async function main() {
  const baseUrl = process.env.API_BASE_URL || "https://jsonplaceholder.typicode.com";
  const resultDir = path.resolve("api-testing", "result");
  ensureDir(resultDir);

  console.log(`[api-testing] Running against: ${baseUrl}`);

  const tests = [];

  // Positive: GET /posts/1
  tests.push(
    await runTest("GET /posts/1 returns 200 + expected schema", async () => {
      const { res, elapsedMs, json } = await httpJson(`${baseUrl}/posts/1`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(elapsedMs < 5000, `Response too slow: ${elapsedMs}ms`);
      assert(json && typeof json === "object", "Expected JSON object body");
      assert(json.id === 1, `Expected id=1, got ${json?.id}`);
      assert(typeof json.title === "string", "Expected title as string");
      assert(typeof json.body === "string", "Expected body as string");
      assert(typeof json.userId === "number", "Expected userId as number");
      return { status: res.status, elapsedMs, sample: json };
    }),
  );

  // Positive: POST /posts
  tests.push(
    await runTest("POST /posts returns 201 + includes id", async () => {
      const payload = { title: "qa-assessment", body: "hello", userId: 1 };
      const { res, elapsedMs, json } = await httpJson(`${baseUrl}/posts`, {
        method: "POST",
        headers: { "content-type": "application/json; charset=UTF-8" },
        body: JSON.stringify(payload),
      });
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      assert(elapsedMs < 5000, `Response too slow: ${elapsedMs}ms`);
      assert(json && typeof json === "object", "Expected JSON object body");
      assert(typeof json.id === "number", "Expected response to contain numeric id");
      assert(json.title === payload.title, "Expected title echoed back");
      assert(json.body === payload.body, "Expected body echoed back");
      assert(json.userId === payload.userId, "Expected userId echoed back");
      return { status: res.status, elapsedMs, sample: json };
    }),
  );

  // Negative: GET invalid route
  tests.push(
    await runTest("GET /this-route-does-not-exist returns 404", async () => {
      const { res, elapsedMs } = await httpJson(`${baseUrl}/this-route-does-not-exist`);
      assert(res.status === 404, `Expected 404, got ${res.status}`);
      assert(elapsedMs < 5000, `Response too slow: ${elapsedMs}ms`);
      return { status: res.status, elapsedMs };
    }),
  );

  // Negative-ish: invalid post id type (non-numeric). JSONPlaceholder returns 404.
  tests.push(
    await runTest("GET /posts/abc returns 404", async () => {
      const { res, elapsedMs } = await httpJson(`${baseUrl}/posts/abc`);
      assert(res.status === 404, `Expected 404, got ${res.status}`);
      assert(elapsedMs < 5000, `Response too slow: ${elapsedMs}ms`);
      return { status: res.status, elapsedMs };
    }),
  );

  const passed = tests.filter((t) => t.status === "pass").length;
  const failed = tests.filter((t) => t.status === "fail").length;
  const report = {
    meta: {
      baseUrl,
      executedAt: new Date().toISOString(),
      totals: { total: tests.length, passed, failed },
    },
    tests,
  };

  const outPath = path.join(resultDir, `api-test-report-${nowStamp()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

  if (failed > 0) {
    console.error(`[api-testing] FAIL (${failed} failed)`);
    console.error(`[api-testing] Report: ${outPath}`);
    process.exitCode = 1;
    return;
  }

  console.log(`[api-testing] PASS (${passed}/${tests.length})`);
  console.log(`[api-testing] Report: ${outPath}`);
}

main().catch((err) => {
  console.error("[api-testing] FAIL (unexpected error)");
  console.error(err);
  process.exitCode = 1;
});

