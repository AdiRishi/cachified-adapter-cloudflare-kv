import { env as miniflareTestEnv } from "cloudflare:test";
import { describe, test, expect, beforeEach } from "vitest";
import { cloudflareKvCacheAdapter } from "~/index";

describe("Adapter creation() tests", () => {
  let env: typeof miniflareTestEnv;

  beforeEach(() => {
    env = miniflareTestEnv;
  });

  test("should correctly set cache name", () => {
    const adapter = cloudflareKvCacheAdapter({ kv: env.KV, name: "TestCache" });
    expect(adapter.name).toBe("TestCache");
  });
});
