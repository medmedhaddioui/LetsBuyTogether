import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { AxiosError } from "axios";

// Load the actual TypeScript client without a browser or an additional test runner.
const source = await readFile(
  new URL("../src/lib/api.ts", import.meta.url),
  "utf8",
);
const compiled = ts
  .transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  })
  .outputText.replace(
    /from ['"]axios['"]/,
    `from '${import.meta.resolve("axios")}'`,
  );
const { api, ApiError } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
globalThis.localStorage = { getItem: () => null };

function adapterFor(status, options = {}) {
  let calls = 0;
  api.defaults.adapter = async (config) => {
    calls++;
    if (options.recover && calls > 1)
      return { data: { data: ["product"] }, status: 200, headers: {}, config };
    throw new AxiosError(
      "Failure",
      status ? "ERR_BAD_RESPONSE" : "ERR_NETWORK",
      config,
      {},
      status
        ? {
            status,
            headers: options.headers ?? {},
            data: options.data ?? {},
            config,
          }
        : undefined,
    );
  };
  return () => calls;
}

test("temporary GET failure recovers", async () => {
  const calls = adapterFor(503, { recover: true });
  assert.deepEqual((await api.get("/promotions")).data.data, ["product"]);
  assert.equal(calls(), 2);
});

test("network failures stop after two retries and preserve useful metadata", async () => {
  const calls = adapterFor(undefined);
  await assert.rejects(
    api.get("/promotions"),
    (error) =>
      error instanceof ApiError &&
      error.code === "ERR_NETWORK" &&
      /connection/.test(error.message),
  );
  assert.equal(calls(), 3);
});

test("writes and permanent errors are never retried", async () => {
  for (const method of ["post", "patch", "put", "delete"]) {
    const calls = adapterFor(503);
    await assert.rejects(api.request({ url: "/promotions", method }));
    assert.equal(calls(), 1);
  }
  for (const status of [400, 401, 403, 404, 409, 422]) {
    const calls = adapterFor(status, {
      data: { error: { message: "Specific server message" } },
    });
    await assert.rejects(api.get("/promotions"), {
      message: "Specific server message",
      status,
    });
    assert.equal(calls(), 1);
  }
});

test("long Retry-After is surfaced without retrying early", async () => {
  const calls = adapterFor(429, { headers: { "retry-after": "60" } });
  await assert.rejects(api.get("/promotions"), { status: 429 });
  assert.equal(calls(), 1);
});

test("cancelling during backoff prevents another request", async () => {
  const calls = adapterFor(503);
  const controller = new AbortController();
  const request = api.get("/promotions", { signal: controller.signal });
  setTimeout(() => controller.abort(), 25);
  await assert.rejects(request, { code: "ERR_CANCELED" });
  assert.equal(calls(), 1);
});
