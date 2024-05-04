import { KVNamespace } from "@cloudflare/workers-types/2023-07-01";
import { type CacheEntry, type CacheMetadata } from "@epic-web/cachified";
import { buildCacheKey } from "./utils";

export async function getOperation<Value = unknown>(
  kv: KVNamespace,
  key: string,
  keyPrefix?: string,
): Promise<CacheEntry<Value> | null> {
  const cacheKey = buildCacheKey(key, keyPrefix);
  const { value, metadata } = await kv.getWithMetadata<CacheMetadata>(cacheKey, { type: "text" });
  if (value === null) {
    return value;
  }
  const jsonValue = JSON.parse(value) as Value;
  return {
    value: jsonValue,
    metadata: metadata!,
  };
}
