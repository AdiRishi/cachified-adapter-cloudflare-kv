# AGENTS.md

This file provides guidance to AI Agents when working with code in this repository.

## Overview

This is a Cloudflare KV adapter for `@epic-web/cachified`, providing a seamless integration between the cachified caching library and Cloudflare Workers' KV storage. The adapter implements the `Cache` interface from `@epic-web/cachified` with get, set, and delete operations backed by Cloudflare KV.

## Development Commands

```bash
# Install dependencies
pnpm install

# Build the library (builds to dist/)
pnpm build

# Type checking
pnpm typecheck

# Linting and formatting
pnpm lint        # Run eslint and prettier check
pnpm format      # Auto-format with prettier

# Testing
pnpm test        # Run tests with coverage
pnpm test:ui     # Run tests with Vitest UI
```

## Architecture

### Core Implementation

The adapter is split into modular operations in `src/`:

- **index.ts**: Main entry point that exports `cloudflareKvCacheAdapter()` factory function
- **get.ts**: Implements cache retrieval using `KV.getWithMetadata()` to get both value and metadata
- **set.ts**: Implements cache storage with TTL calculation - converts cachified's TTL to KV's expirationTtl (minimum 60 seconds)
- **delete.ts**: Implements cache key deletion
- **utils.ts**: Contains `buildCacheKey()` which applies optional key prefixes

### Key Design Patterns

**TTL Handling**: The adapter converts `@epic-web/cachified`'s totalTtl (milliseconds) to Cloudflare KV's expirationTtl (seconds, min 60). Uses `totalTtl()` from cachified to calculate ttl + swr for KV expiration.

**Metadata Storage**: Leverages KV's native metadata field to store `CacheMetadata` (createdTime, ttl, swr) alongside cached values. This enables stale-while-revalidate behavior.

**Key Prefixing**: Optional `keyPrefix` allows namespace isolation when sharing a KV binding across multiple cache instances.

**Value Serialization**: All values are JSON stringified before storage and parsed on retrieval, supporting arbitrary serializable data types.

## Testing

Tests use `@cloudflare/vitest-pool-workers` to run in a Cloudflare Workers environment with real KV bindings via Miniflare. Key test files:

- **adapter.test.ts**: Integration tests for full cachified workflows including TTL expiration and stale-while-revalidate behavior
- **get.test.ts**, **set.test.ts**, **delete.test.ts**: Unit tests for individual operations
- **worker.test.ts**: End-to-end test with a minimal worker implementation

The test worker is configured in `wrangler.vitest.toml` with a KV binding named "KV".

## Build Configuration

Uses Vite with:

- `vite-plugin-dts` for TypeScript declaration generation with rollup
- `rollup-plugin-typescript-paths` for path alias resolution (~/_ → src/_)
- Outputs both ESM (index.js) and CJS (index.cjs) formats
- Externalizes `@epic-web/cachified` and `@cloudflare/workers-types` as peer dependencies

## Package Manager

This project uses `pnpm`. Always use `pnpm` for dependency operations.

## Contributing Requirements

From CONTRIBUTING.md:

1. Run `pnpm lint` and `pnpm test` before submitting PRs
2. Write unit tests for all changes
3. May need to create a changeset using `@changesets/cli` for version management
