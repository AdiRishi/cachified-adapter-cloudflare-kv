import { describe, test, expect } from "vitest";
import { buildCacheKey } from "~/utils";

describe("buildCacheKey", () => {
  test("should return the given key when no prefix is provided", () => {
    const key = "testKey";
    const result = buildCacheKey(key);
    expect(result).toBe(key);
  });

  test("should return a composite key with prefix when provided", () => {
    const key = "testKey";
    const prefix = "testPrefix";
    const expected = `${prefix}:${key}`;
    const result = buildCacheKey(key, prefix);
    expect(result).toBe(expected);
  });

  test("should return the given key when the prefix is an empty string", () => {
    const key = "testKey";
    const prefix = "";
    const result = buildCacheKey(key, prefix);
    expect(result).toBe(key);
  });

  test("should handle keys with special characters", () => {
    const key = "testKey$123";
    const prefix = "test!Prefix";
    const expected = `${prefix}:${key}`;
    const result = buildCacheKey(key, prefix);
    expect(result).toBe(expected);
  });
});
