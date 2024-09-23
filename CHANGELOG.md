# cachified-adapter-cloudflare-kv

## 2.3.0

### Minor Changes

- [#322](https://github.com/AdiRishi/cachified-adapter-cloudflare-kv/pull/322) [`5bd37ac`](https://github.com/AdiRishi/cachified-adapter-cloudflare-kv/commit/5bd37ac454ec5e130e176805fc2485fc95ea3e2e) Thanks [@AdiRishi](https://github.com/AdiRishi)! - This package has been updated to support cachified 5.2.0
  With this change comes full support for [`waitUntil`](https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil).
  The package documentation has been updated to reflect the best way to use `@epic-web/cachified` with Cloudflare KV.

## 2.2.1

### Patch Changes

- [`dbeff54`](https://github.com/AdiRishi/cachified-adapter-cloudflare-kv/commit/dbeff540c0b984334c06c40d8c87a3a6f1479dc2) Thanks [@AdiRishi](https://github.com/AdiRishi)! - Bump version due to bug in CI/CD pipeline

## 2.2.0

### Minor Changes

- [#167](https://github.com/AdiRishi/cachified-adapter-cloudflare-kv/pull/167) [`8547aa0`](https://github.com/AdiRishi/cachified-adapter-cloudflare-kv/commit/8547aa0494ae834fd9b00c16e6d1dda22354e284) Thanks [@AdiRishi](https://github.com/AdiRishi)! - Update Cloudflare worker types to the recommended default compatibility date of 2023-07-01

## 2.1.0

### Minor Changes

- 7c092cf: Set @epic-web/cachified peer dependency to ^5.1.1
  This is necessary as this package uses updated type definitions from @epic-web/cachified that were introduced in `5.1.1`

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
