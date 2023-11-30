import { CacheEntry, CacheMetadata } from "@epic-web/cachified";
import { test, expect, beforeEach } from "vitest";
import { setOperation } from "~/set";
import { buildCacheKey } from "~/utils";
import type { Env } from "./helpers";

const describe = setupMiniflareIsolatedStorage();

describe("setOperation() tests", () => {
  let env: Env;

  beforeEach(() => {
    env = getMiniflareBindings();
  });

  test("should store a value with no key prefix", async () => {
    const key = "test-key";
    const value = { data: "Test data" };
    const metadata: CacheMetadata = { createdTime: Date.now() };
    const cacheEntry: CacheEntry = { value, metadata };

    const result = await setOperation(env.KV, key, cacheEntry);
    expect(result).toEqual(cacheEntry.value);
    const storedValue = await env.KV.get(buildCacheKey(key), "json");
    expect(storedValue).toEqual(value);
  });

  test("should store a value with a key prefix", async () => {
    const key = "test-key";
    const keyPrefix = "testPrefix";
    const value = { data: "Test data with prefix" };
    const metadata: CacheMetadata = { createdTime: Date.now() };
    const cacheEntry: CacheEntry = { value, metadata };

    const result = await setOperation(env.KV, key, cacheEntry, keyPrefix);
    expect(result).toEqual(cacheEntry.value);
    const storedValue = await env.KV.get(buildCacheKey(key, keyPrefix), "json");
    expect(storedValue).toEqual(value);
  });

  test("should handle storing and retrieving non-JSON values", async () => {
    const key = "non-json-key";
    const stringValue = "Non-JSON string";
    const cacheEntry: CacheEntry = { value: stringValue, metadata: { createdTime: Date.now() } };

    await setOperation(env.KV, key, cacheEntry);
    const storedValue = await env.KV.get(buildCacheKey(key), "text");
    expect(JSON.parse(storedValue!)).toBe(stringValue);
  });

  test("should respect TTL in metadata", async () => {
    const key = "key-with-ttl";
    const value = { data: "Test data with TTL" };
    const metadata: CacheMetadata = { createdTime: Date.now(), ttl: 3600 };
    const cacheEntry: CacheEntry = { value, metadata };

    await setOperation(env.KV, key, cacheEntry);
    const storedMetadata = await env.KV.getWithMetadata<CacheMetadata>(buildCacheKey(key));
    expect(storedMetadata.metadata).toEqual(metadata);
  });

  test("should handle Infinity TTL as no expiration", async () => {
    const key = "key-with-infinity-ttl";
    const value = { data: "Test data with no expiration" };
    const metadata: CacheMetadata = { createdTime: Date.now(), ttl: null }; // ttl: null should result in Infinity TTL
    const cacheEntry: CacheEntry = { value, metadata };

    await setOperation(env.KV, key, cacheEntry);
    const storedMetadata = await env.KV.getWithMetadata<CacheMetadata>(buildCacheKey(key));
    expect(storedMetadata.metadata).toEqual(metadata);
    expect(storedMetadata.metadata?.ttl).toBeNull();
  });
});
