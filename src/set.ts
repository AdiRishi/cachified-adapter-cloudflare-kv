import { KVNamespace } from "@cloudflare/workers-types";
import { type CacheEntry, totalTtl } from "@epic-web/cachified";
import { buildCacheKey } from "./utils";

export async function setOperation<Value = unknown>(
  kv: KVNamespace,
  key: string,
  value: CacheEntry<Value>,
  keyPrefix?: string,
): Promise<unknown> {
  const cacheKey = buildCacheKey(key, keyPrefix);

  let expirationTtl: number | undefined = totalTtl(value.metadata);
  if (expirationTtl === Infinity) {
    expirationTtl = undefined;
  } else {
    expirationTtl = Math.max(Math.ceil(expirationTtl / 1000), 60);
  }

  await kv.put(cacheKey, JSON.stringify(value.value), {
    expirationTtl: expirationTtl,
    metadata: value.metadata,
  });
  return value.value;
}
