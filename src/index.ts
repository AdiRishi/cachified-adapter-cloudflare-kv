import type { KVNamespace } from "@cloudflare/workers-types/2023-07-01";
import { type Cache } from "@epic-web/cachified";
import { deleteOperation } from "./delete";
import { getOperation } from "./get";
import { setOperation } from "./set";

/**
 * Configuration options for the Cloudflare KV cache adapter.
 * @property {KVNamespace} kv - The KVNamespace instance to interact with Cloudflare KV.
 * @property {string} [keyPrefix] - Optional prefix for all keys managed by this adapter.
 * @property {string} [name] - Optional name for the cache, defaults to "CloudflareKV".
 */
export type CloudflareKvCacheConfig = {
  kv: KVNamespace;
  keyPrefix?: string;
  name?: string;
};

/**
 * Creates a cache adapter for Cloudflare's KV storage.
 * @param {CloudflareKvCacheConfig} config - Configuration options for the cache adapter.
 * @returns {Cache} A cache adapter instance for Cloudflare KV.
 */
export function cloudflareKvCacheAdapter<Value = unknown>(
  config: CloudflareKvCacheConfig,
): Cache<Value> {
  return {
    name: config.name ?? "CloudflareKV",
    get: async (key) => {
      return getOperation<Value>(config.kv, key, config.keyPrefix);
    },
    set: async (key, value) => {
      return await setOperation<Value>(config.kv, key, value, config.keyPrefix);
    },
    delete: async (key) => {
      await deleteOperation(config.kv, key, config.keyPrefix);
    },
  };
}
