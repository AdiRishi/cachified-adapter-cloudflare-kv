import { KVNamespace } from "@cloudflare/workers-types";
import { type CacheEntry, type CacheMetadata } from "@epic-web/cachified";
import { buildCacheKey } from "./utils";

export async function getOperation(
  kv: KVNamespace,
  key: string,
  keyPrefix?: string,
): Promise<CacheEntry<unknown> | null> {
  const cacheKey = buildCacheKey(key, keyPrefix);
  const { value, metadata } = await kv.getWithMetadata<CacheMetadata>(cacheKey, { type: "text" });
  if (value === null) {
    return value;
  }
  const jsonValue = JSON.parse(value) as unknown;
  return {
    value: jsonValue,
    metadata: metadata!,
  };
}
