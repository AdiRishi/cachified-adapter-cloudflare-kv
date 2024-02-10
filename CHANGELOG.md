# cachified-adapter-cloudflare-kv

## 2.0.0

### Major Changes

- 4be40a6: Bump @epic-web/cachified peer dependency to ^5.0.0

  While there are no breaking changes to this package, @epic-web/cachified has a few breaking changes in their 5.0.0 release.
  Please see https://github.com/epicweb-dev/cachified/releases/tag/v5.0.0 for more information.

### Minor Changes

- 4be40a6: Add generics to the cloudflare cache implementation
  This is in an effort to match the behavior of @epic-web/cachified since 5.1.0

## 1.0.1

### Patch Changes

- deed297: Improve documentation and unit test coverage

  - Greatly improved adapter integration tests
  - Improve README documentation

## 1.0.0

### Major Changes

- 7725598: 🎉 I'm thrilled to announce the official 1.0 release of `cachified-adapter-cloudflare-kv`! 🚀

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
    async fetch(
      request: Request,
      env: Env,
      ctx: ExecutionContext,
    ): Promise<Response> {
      env.CACHIFIED_KV_CACHE = cloudflareKvCacheAdapter({ kv: env.KV });
      const user = await getUserById(1, env.CACHIFIED_KV_CACHE);
      return new Response(JSON.stringify(user), {
        headers: { "content-type": "application/json" },
      });
    },
  };
  ```

  For detailed usage and configuration options, please refer to the README in our repository.

  I'm excited to share the latest updates to `cachified-adapter-cloudflare-kv` with you. Your feedback and contributions are greatly appreciated as we work together to enhance web performance. 🌐

## 0.1.0

### Minor Changes

- 3af27b6: Improve documentation and add usage examples in the README

### Patch Changes

- a4239d8: Add jsdoc comments to adapter code

## 0.0.3

### Patch Changes

- 312cfaf: Fix incorrect esm file name in package.json export

## 0.0.2

### Patch Changes

- d7cd7c9: Correctly build package output when publishing a release

## 0.0.1

### Patch Changes

- 8ffa8ff: Specify peerDependencies as external packages in vite build
