<div style="text-align:center">

# cachified-adapter-cloudflare-kv

</div>

<div style="text-align:center">

[![CI](https://github.com/AdiRishi/cachified-adapter-cloudflare-kv/actions/workflows/ci.yml/badge.svg)](https://github.com/AdiRishi/cachified-adapter-cloudflare-kv/actions/workflows/ci.yml) [![npm version](https://img.shields.io/npm/v/cachified-adapter-cloudflare-kv.svg?style=flat)](https://www.npmjs.com/package/cachified-adapter-cloudflare-kv) ![GitHub License](https://img.shields.io/github/license/AdiRishi/cachified-adapter-cloudflare-kv) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](.github/CONTRIBUTING.md)

</div>

## 🚀 Introduction

`cachified-adapter-cloudflare-kv` is an efficient and reliable adapter allowing `@epic-web/cachified` to seamlessly integrate with Cloudflare KV.

## 📦 Installation

```sh
npm install cachified-adapter-cloudflare-kv @epic-web/cachified
```

`@epic-web/cachified` is a peer dependency of `cachified-adapter-cloudflare-kv` and must be installed separately.

## 💡 Usage

This adapter is designed to be used with Cloudflare Workers. The example below shows a simple Cloudflare worker script that uses this adapter.

```ts
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
        ttl: 60_000, // 1 minute
        staleWhileRevalidate: 300_000, // 5 minutes
    });
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // It is a common pattern to pass around the env object to most functions when writing workers code
        // So it's convenient to inject the cache adapter into the env object
        env.CACHIFIED_KV_CACHE = cloudflareKvCacheAdapter({
            kv: env.KV,
            keyPrefix: "mycache", // optional
        });
        const userId = Math.floor(Math.random() * 10) + 1;
        const user = await getUserById(userId, env);
        return new Response(`User data is ${JSON.stringify(user)}`);
    },
};
```

## ⚙️ Configuration

The adapter takes the following configuration options:

## 📈 Planned Changes

Investigating the integration of ExecutionContext for non-blocking cache operations.

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated. Check our [contributing guidelines](.github/CONTRIBUTING.md).

## 🙏 Acknowledgments

-   [@epic-web/cachified](https://github.com/epicweb-dev/cachified) - For the foundational caching library.
-   [Cloudflare KV](https://developers.cloudflare.com/kv/) - For the underlying caching technology.
