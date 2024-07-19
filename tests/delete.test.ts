import { env as miniflareTestEnv } from "cloudflare:test";
import { describe, test, expect, beforeEach } from "vitest";
import { deleteOperation } from "~/delete";
import { buildCacheKey } from "~/utils";

describe("deleteOperation() tests", () => {
  let env: typeof miniflareTestEnv;

  beforeEach(() => {
    env = miniflareTestEnv;
  });

  test("should delete a value with no key prefix", async () => {
    const key = "test-key";
    const value = "Test data";
    await env.KV.put(buildCacheKey(key), value);
    await deleteOperation(env.KV, key);
    const deletedValue = await env.KV.get(buildCacheKey(key));
    expect(deletedValue).toBeNull();
  });

  test("should delete a value with a key prefix", async () => {
    const key = "test-key";
    const keyPrefix = "testPrefix";
    const value = "Test data with prefix";
    await env.KV.put(buildCacheKey(key, keyPrefix), value);
    await deleteOperation(env.KV, key, keyPrefix);
    const deletedValue = await env.KV.get(buildCacheKey(key, keyPrefix));
    expect(deletedValue).toBeNull();
  });

  test("should handle deletion of non-existent keys gracefully", async () => {
    const key = "non-existent-key";
    const deletionResult = await deleteOperation(env.KV, key);
    expect(deletionResult).toBeUndefined();
  });

  test("should not affect other keys when deleting a specific key", async () => {
    const keyToDelete = "key-to-delete";
    const keyToKeep = "key-to-keep";
    const value = "Test data";
    await env.KV.put(buildCacheKey(keyToDelete), value);
    await env.KV.put(buildCacheKey(keyToKeep), value);
    await deleteOperation(env.KV, keyToDelete);
    const deletedValue = await env.KV.get(buildCacheKey(keyToDelete));
    const keptValue = await env.KV.get(buildCacheKey(keyToKeep));
    expect(deletedValue).toBeNull();
    expect(keptValue).toEqual(value);
  });
});
