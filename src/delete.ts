import { KVNamespace } from "@cloudflare/workers-types";
import { type CacheEntry, totalTtl } from "@epic-web/cachified";
import { buildCacheKey } from "./utils";

export async function deleteOperation(
  kv: KVNamespace,
  key: string,
  keyPrefix?: string,
): Promise<void> {
  const cacheKey = buildCacheKey(key, keyPrefix);
  await kv.delete(cacheKey);
}
