---
"cachified-adapter-cloudflare-kv": major
---

🎉 We are thrilled to announce the official 1.0 release of `cachified-adapter-cloudflare-kv`! 🚀

## 📦 Installation

To get started, simply install the package along with its peer dependency `@epic-web/cachified`:

```sh
npm install cachified-adapter-cloudflare-kv @epic-web/cachified
```

## 💡 Usage

Integrating the adapter into your Cloudflare Workers is straightforward. Here's a quick example to show you how it's done:

```ts
import { cachified, Cache } from "@epic-web/cachified";
import { cloudflareKvCacheAdapter } from "cachified-adapter-cloudflare-kv";

export interface Env {
    KV: KVNamespace;
}

export async function getUserById(
    userId: number,
    cacheAdapter: Cache,
): Promise<Record<string, unknown>> {
    return cachified({
        key: `user-${userId}`,
        cache: cacheAdapter,
        async getFreshValue() {
            return { id: userId, name: "John Doe" };
        },
        ttl: 60_000, // 1 minute
        staleWhileRevalidate: 300_000, // 5 minutes
    });
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        env.CACHIFIED_KV_CACHE = cloudflareKvCacheAdapter({ kv: env.KV });
    },
};
```

For detailed usage and configuration options, please refer to the README in our repository.

We welcome users to this new chapter in `cachified-adapter-cloudflare-kv`'s journey and look forward to your feedback and contributions. Let's build a faster web together! 🌐
