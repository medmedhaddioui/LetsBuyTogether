import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

process.env.JWT_SECRET ??= "test-secret-at-least-sixteen";
const { createApp } = await import("../../src/app.js");
const directory = mkdtempSync(join(tmpdir(), "lbt-monolith-"));
writeFileSync(join(directory, "index.html"), "<html><body>LetsBuyTogether</body></html>");
writeFileSync(join(directory, "app.js"), 'console.log("app")');
const app = createApp({ staticDirectory: directory });
afterAll(() => rmSync(directory, { recursive: true, force: true }));

describe("monolithic web server", () => {
  it("serves the UI and API from the same application", async () => {
    expect((await request(app).get("/").accept("html")).text).toContain("LetsBuyTogether");
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ok");
  });
  it("serves client-side routes and built assets", async () => {
    expect((await request(app).get("/groups/example").accept("html")).text).toContain(
      "LetsBuyTogether",
    );
    expect((await request(app).get("/app.js")).text).toContain("console.log");
  });
  it("returns JSON 404s for unknown API routes, including browser requests", async () => {
    for (const url of ["/api/unknown", "/api"]) {
      const response = await request(app).get(url).accept("html");
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    }
  });
  it("does not return HTML for missing assets or unsupported methods", async () => {
    expect((await request(app).get("/missing.js")).status).toBe(404);
    expect((await request(app).post("/groups/example")).status).toBe(404);
    expect((await request(app).get("/unknown").accept("json")).status).toBe(404);
  });
});
