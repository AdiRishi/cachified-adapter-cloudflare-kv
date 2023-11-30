import type { KVNamespace, ExecutionContext } from "@cloudflare/workers-types";
import { type Cache } from "@epic-web/cachified";
import { deleteOperation } from "./delete";
import { getOperation } from "./get";
import { setOperation } from "./set";

/**
 * Configuration options for the Cloudflare KV cache adapter.
 * @property {KVNamespace} kv - The KVNamespace instance to interact with Cloudflare KV.
 * @property {ExecutionContext} [ctx] - The optional execution context in which the adapter is running.
 * @property {string} [keyPrefix] - Optional prefix for all keys managed by this adapter.
 * @property {string} [name] - Optional name for the cache, defaults to "CloudflareKV".
 */
export type CloudflareKvCacheConfig = {
  kv: KVNamespace;
  ctx?: ExecutionContext;
  keyPrefix?: string;
  name?: string;
};

/**
 * Creates a cache adapter for Cloudflare's KV storage.
 * @param {CloudflareKvCacheConfig} config - Configuration options for the cache adapter.
 * @returns {Cache} A cache adapter instance for Cloudflare KV.
 */
export function cloudflareKvCacheAdapter(config: CloudflareKvCacheConfig): Cache {
  return {
    name: config.name ?? "CloudflareKV",
    get: async (key) => {
      return getOperation(config.kv, key, config.keyPrefix);
    },
    set: async (key, value) => {
      if (config.ctx) {
        config.ctx.waitUntil(setOperation(config.kv, key, value, config.keyPrefix));
        return value;
      } else {
        return await setOperation(config.kv, key, value, config.keyPrefix);
      }
    },
    delete: async (key) => {
      if (config.ctx) {
        config.ctx.waitUntil(deleteOperation(config.kv, key, config.keyPrefix));
      } else {
        await deleteOperation(config.kv, key, config.keyPrefix);
      }
    },
  };
}
