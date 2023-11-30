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
    const expectedMetadata = { createdTime: Date.now() };
    await env.KV.put(buildCacheKey(key), JSON.stringify(expectedValue), {
      metadata: expectedMetadata,
    });
    const cacheEntry = await getOperation(env.KV, key);
    expect(cacheEntry).toEqual({ value: expectedValue, metadata: expectedMetadata });
  });

  test("should return the correct value with a key prefix", async () => {
    const key = "key-with-prefix";
    const keyPrefix = "testPrefix";
    const expectedValue = { data: "This is a test object with prefix." };
    const expectedMetadata = { createdTime: Date.now() };
    await env.KV.put(buildCacheKey(key, keyPrefix), JSON.stringify(expectedValue), {
      metadata: expectedMetadata,
    });
    const cacheEntry = await getOperation(env.KV, key, keyPrefix);
    expect(cacheEntry).toEqual({ value: expectedValue, metadata: expectedMetadata });
  });

  test("should handle JSON stringified non-JSON values gracefully", async () => {
    const key = "stringified-non-json-key";
    const stringValue = "Non-JSON string";
    const stringifiedValue = JSON.stringify(stringValue);
    const expectedMetadata = { createdTime: Date.now() };
    await env.KV.put(buildCacheKey(key), stringifiedValue, {
      metadata: expectedMetadata,
    });
    const cacheEntry = await getOperation(env.KV, key);
    expect(cacheEntry).toEqual({ value: stringValue, metadata: expectedMetadata });
  });

  test("should throw an error for non-stringified non-JSON values", async () => {
    const key = "non-stringified-non-json-key";
    const nonJsonValue = "Non-JSON string";
    const expectedMetadata = { createdTime: Date.now() };
    await env.KV.put(buildCacheKey(key), nonJsonValue, {
      metadata: expectedMetadata,
    });
    await expect(getOperation(env.KV, key)).rejects.toThrow();
  });

  // Additional test case: Check if metadata is returned correctly
  test("should return the correct metadata for an existing key", async () => {
    const key = "key-with-metadata";
    const expectedValue = { data: "This is a test object with metadata." };
    const expectedMetadata = { createdTime: Date.now(), ttl: 3600 };
    await env.KV.put(buildCacheKey(key), JSON.stringify(expectedValue), {
      metadata: expectedMetadata,
    });
    const cacheEntry = await getOperation(env.KV, key);
    expect(cacheEntry).toEqual({ value: expectedValue, metadata: expectedMetadata });
  });
});
