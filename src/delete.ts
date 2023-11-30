import { KVNamespace } from "@cloudflare/workers-types";
import { buildCacheKey } from "./utils";

export async function deleteOperation(
  kv: KVNamespace,
  key: string,
  keyPrefix?: string,
): Promise<void> {
  const cacheKey = buildCacheKey(key, keyPrefix);
  await kv.delete(cacheKey);
}
