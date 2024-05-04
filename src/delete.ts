import { KVNamespace } from "@cloudflare/workers-types/2023-07-01";
import { buildCacheKey } from "./utils";

export async function deleteOperation(
  kv: KVNamespace,
  key: string,
  keyPrefix?: string,
): Promise<void> {
  const cacheKey = buildCacheKey(key, keyPrefix);
  await kv.delete(cacheKey);
}
