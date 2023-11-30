import { KVNamespace } from "@cloudflare/workers-types";
import { type CacheEntry } from "@epic-web/cachified";
import { buildCacheKey } from "./utils";

export async function getOperation(
  kv: KVNamespace,
  key: string,
  keyPrefix?: string,
): Promise<CacheEntry<unknown> | null> {
  const cacheKey = buildCacheKey(key, keyPrefix);
  const value = await kv.get(cacheKey, { type: "text" });
  if (value === null) {
    return value;
  }
  return JSON.parse(value);
}
