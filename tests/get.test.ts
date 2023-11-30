import { test, expect, beforeEach } from "vitest";
import { getOperation } from "~/get";
import { buildCacheKey } from "~/utils";
import type { Env } from "./helpers";

const describe = setupMiniflareIsolatedStorage();

describe("getOperation() tests", () => {
  let env: Env;

  beforeEach(() => {
    env = getMiniflareBindings();
  });

  test("should return null if the key is not found", async () => {
    const value = await getOperation(env.KV, "nonexistent-key");
    expect(value).toBeNull();
  });

  test("should return the correct value for an existing key", async () => {
    const key = "existing-key";
    const expectedValue = { data: "This is a test object." };
    await env.KV.put(key, JSON.stringify(expectedValue));
    const value = await getOperation(env.KV, key);
    expect(value).toEqual(expectedValue);
  });

  test("should return the correct value with a key prefix", async () => {
    const key = "key-with-prefix";
    const keyPrefix = "testPrefix";
    const expectedValue = { data: "This is a test object with prefix." };
    await env.KV.put(`${keyPrefix}:${key}`, JSON.stringify(expectedValue));
    const value = await getOperation(env.KV, key, keyPrefix);
    expect(value).toEqual(expectedValue);
  });

  test("should handle non-JSON values gracefully", async () => {
    const key = "non-json-key";
    const nonJsonValue = "Non-JSON string";
    await env.KV.put(key, nonJsonValue);
    await expect(getOperation(env.KV, key)).rejects.toThrow(SyntaxError);
  });
});
