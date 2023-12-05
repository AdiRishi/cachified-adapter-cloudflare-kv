import { test, expect, beforeEach } from "vitest";
import { cloudflareKvCacheAdapter } from "~/index";
import type { Env } from "./helpers";

const describe = setupMiniflareIsolatedStorage();

describe("Adapter creation() tests", () => {
  let env: Env;

  beforeEach(() => {
    env = getMiniflareBindings();
  });

  test("should correctly set cache name", () => {
    const adapter = cloudflareKvCacheAdapter({ kv: env.KV, name: "TestCache" });
    expect(adapter.name).toBe("TestCache");
  });
});
