<div>
  <h1 align="center"><a href="https://www.npmjs.com/package/cachified-adapter-cloudflare-kv">cachified-adapter-cloudflare-kv</a></h1>
</div>

**The official Cloudflare KV adapter for [@epic-web/cachified](https://www.npmjs.com/package/@epic-web/cachified)**

This adapter allows you to use `@epic-web/cachified` with Cloudflare KV as the cache store.

```
npm install cachified-adapter-cloudflare-kv
```

## Usage

```ts
// This is a sample Cloudflare worker script
import { cachified, Cache } from "@epic-web/cachified";
import { cloudflareKvCacheAdapter } from "cachified-adapter-cloudflare-kv";

export interface Env {
    KV: KVNamespace;
    CACHIFIED_KV_CACHE: Cache;
}

export async function getUserById(userId: number, env: Env): Promise<Record<string, unknown>> {
    return cachified({
        key: `user-${userId}`,
        cache: env.CACHIFIED_KV_CACHE,
        async getFreshValue() {
            const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
            return response.json();
        },
        ttl: 300_000,
    });
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // It is a common pattern to pass around the env object to most functions when writing workers code
        // So it's convenient to inject the cache adapter into the env object
        env.CACHIFIED_KV_CACHE = cloudflareKvCacheAdapter({
            kv: env.KV,
            ctx: ctx,
            keyPrefix: "mycache", // optional
        });
        const userId = Math.floor(Math.random() * 10) + 1;
        const user = await getUserById(userId, env);
        return new Response(`User data is ${JSON.stringify(user)}`);
    },
};
```
