import type { KVNamespace, ExecutionContext } from "@cloudflare/workers-types";
import { type Cache, totalTtl } from "@epic-web/cachified";

export interface CloudflareKvCacheConfig {
  kv: KVNamespace;
  ctx: ExecutionContext;
  keyPrefix?: string;
  name?: string;
}

export function cloudflareKvCacheAdapter(config: CloudflareKvCacheConfig): Cache {
  return {
    name: config.name || "CloudflareKV",
    get: async (key) => {
      const value = await config.kv.get(key, { type: "text" });
      if (!value) {
        return value;
      }
      return JSON.parse(value);
    },
    set: (key, value) => {
      const setOperation = async () => {
        let expirationTtl: number | undefined = totalTtl(value?.metadata);
        if (expirationTtl === Infinity) {
          expirationTtl = undefined;
        } else {
          expirationTtl = Math.max(Math.ceil(expirationTtl / 1000), 60);
        }

        await config.kv.put(key, JSON.stringify(value), {
          expirationTtl: expirationTtl,
          metadata: value.metadata,
        });
      };
      config.ctx.waitUntil(setOperation());
    },
    delete: (key) => {
      const deleteOperation = async () => {
        await config.kv.delete(key);
      };
      config.ctx.waitUntil(deleteOperation());
    },
  };
}
