import { cachified, type Cache, type CacheMetadata, CacheEntry } from "@epic-web/cachified";
import { env as miniflareTestEnv } from "cloudflare:test";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { cloudflareKvCacheAdapter } from "~/index";
import { typeAsMockInstance } from "./helpers";

type MiniflareEnv = typeof miniflareTestEnv;
type Env = {
  CACHIFIED_KV_CACHE: Cache;
} & MiniflareEnv;

function getUser(userId: number): Promise<{ id: number; name: string; username: string }> {
  return new Promise((resolve) => {
    resolve({
      id: userId,
      name: "John Doe",
      username: "johndoe",
    });
  });
}

function validateCache(value: unknown) {
  void value;
  return true;
}

const testHelpers = {
  getUser,
  validateCache,
};

export async function getUserById(userId: number, ttl: number, swr: number, env: Env) {
  return cachified({
    key: `user-${userId}`,
    cache: env.CACHIFIED_KV_CACHE,
    async getFreshValue() {
      return testHelpers.getUser(userId);
    },
    checkValue: testHelpers.validateCache,
    ttl,
    swr,
  });
}

describe("Adapter Integration tests - no swr", () => {
  const TTL_TIME_MS = 60_000; // 1 minute
  let env: Env;
  let startingSystemTime: number;
  let getUserMock = typeAsMockInstance(testHelpers.getUser);

  beforeEach(() => {
    startingSystemTime = new Date("2023-01-01T00:00:00.000Z").valueOf();
    vi.useFakeTimers();
    vi.setSystemTime(startingSystemTime);
    env = {
      ...miniflareTestEnv,
      CACHIFIED_KV_CACHE: cloudflareKvCacheAdapter({
        kv: miniflareTestEnv.KV,
      }),
    };
    getUserMock = vi.spyOn(testHelpers, "getUser");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should store and retrieve a value from the cache", async () => {
    const user = await getUserById(1, TTL_TIME_MS, 0, env);
    expect(user).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });

    const { value, metadata } = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata,
      value: JSON.parse(value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: 0,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);

    // Should retrieve from cache
    const user2 = await getUserById(1, TTL_TIME_MS, 0, env);
    expect(user2).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);
  });

  test("it should reuse the cache if the ttl has not expired", async () => {
    const user = await getUserById(1, TTL_TIME_MS, 0, env);
    expect(user).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });

    const kvFirst = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvFirst.metadata,
      value: JSON.parse(kvFirst.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: 0,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(startingSystemTime + TTL_TIME_MS / 2);
    // This call should work but miniflare is removing the underlying cache
    // await vi.advanceTimersByTimeAsync(Math.floor(TTL_TIME_MS / 2));

    const user2 = await getUserById(1, TTL_TIME_MS, 0, env);
    expect(user2).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);

    // The cache should not have been updated
    const kvSecond = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvSecond.metadata,
      value: JSON.parse(kvSecond.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: 0,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
  });

  test("it should not return the cached value if the ttl has expired", async () => {
    const user = await getUserById(1, TTL_TIME_MS, 0, env);
    expect(user).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });

    const kvFirst = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvFirst.metadata,
      value: JSON.parse(kvFirst.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: 0,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);

    // Move time forward by 1 minute
    vi.setSystemTime(startingSystemTime + TTL_TIME_MS);
    await vi.advanceTimersByTimeAsync(TTL_TIME_MS + 1);

    const user2 = await getUserById(1, TTL_TIME_MS, 0, env);
    expect(user2).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });
    expect(getUserMock).toHaveBeenCalledTimes(2);
    await vi.runAllTimersAsync();

    // The cache should have been updated
    const kvSecond = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvSecond.metadata,
      value: JSON.parse(kvSecond.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime + TTL_TIME_MS + TTL_TIME_MS + 1,
        swr: 0,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
  });
});

describe("Adapter Integration tests - with swr", () => {
  const TTL_TIME_MS = 60_000; // 1 minute
  const STALE_WHILE_REVALIDATE_TIME_MS = 300_000; // 5 minutes
  let env: Env;
  let startingSystemTime: number;
  let getUserMock = typeAsMockInstance(testHelpers.getUser);

  beforeEach(() => {
    startingSystemTime = new Date("2021-01-01T00:00:00.000Z").valueOf();
    vi.useFakeTimers();
    vi.setSystemTime(startingSystemTime);
    env = {
      ...miniflareTestEnv,
      CACHIFIED_KV_CACHE: cloudflareKvCacheAdapter({
        kv: miniflareTestEnv.KV,
      }),
    };
    getUserMock = vi.spyOn(testHelpers, "getUser");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should store and retrieve a value from the cache", async () => {
    const user = await getUserById(1, TTL_TIME_MS, STALE_WHILE_REVALIDATE_TIME_MS, env);
    expect(user).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });

    const { value, metadata } = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata,
      value: JSON.parse(value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: STALE_WHILE_REVALIDATE_TIME_MS,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);

    // Should retrieve from cache
    const user2 = await getUserById(1, TTL_TIME_MS, STALE_WHILE_REVALIDATE_TIME_MS, env);
    expect(user2).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);
  });

  test("it should reuse the cache if the ttl has not expired", async () => {
    const user = await getUserById(1, TTL_TIME_MS, STALE_WHILE_REVALIDATE_TIME_MS, env);
    expect(user).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });

    const kvFirst = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvFirst.metadata,
      value: JSON.parse(kvFirst.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: STALE_WHILE_REVALIDATE_TIME_MS,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(startingSystemTime + TTL_TIME_MS / 2);
    // This call should work but miniflare is removing the underlying cache
    // await vi.advanceTimersByTimeAsync(Math.floor(TTL_TIME_MS / 2));

    const user2 = await getUserById(1, TTL_TIME_MS, STALE_WHILE_REVALIDATE_TIME_MS, env);
    expect(user2).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);

    // The cache should not have been updated
    const kvSecond = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvSecond.metadata,
      value: JSON.parse(kvSecond.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: STALE_WHILE_REVALIDATE_TIME_MS,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
  });

  test("it should return + revalidate the cached value if the ttl has expired but the swr has not", async () => {
    const user = await getUserById(1, TTL_TIME_MS, STALE_WHILE_REVALIDATE_TIME_MS, env);
    expect(user).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });
    const kvFirst = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvFirst.metadata,
      value: JSON.parse(kvFirst.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: STALE_WHILE_REVALIDATE_TIME_MS,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(startingSystemTime + TTL_TIME_MS * 2);
    // This call should work but miniflare is removing the underlying cache
    // await vi.advanceTimersByTimeAsync(Math.floor(TTL_TIME_MS / 2));

    // override cache value to verify stale vs fresh
    const currentCacheValue = (await env.CACHIFIED_KV_CACHE.get(
      "user-1",
    )) as unknown as CacheEntry<object>;
    currentCacheValue.value = { ...currentCacheValue.value, name: "CACHE_OVERRIDE" };
    await env.CACHIFIED_KV_CACHE.set("user-1", currentCacheValue);

    const user2 = await getUserById(1, TTL_TIME_MS, STALE_WHILE_REVALIDATE_TIME_MS, env);
    expect(user2).toEqual({
      id: 1,
      name: "CACHE_OVERRIDE",
      username: "johndoe",
    });

    // Revalidation happens on the next tick, so the fresh value function should still only be called once
    expect(getUserMock).toHaveBeenCalledTimes(1);
    const kvSecond = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvSecond.metadata,
      value: JSON.parse(kvSecond.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: STALE_WHILE_REVALIDATE_TIME_MS,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "CACHE_OVERRIDE",
        username: "johndoe",
      },
    });

    // Advance the next tick and verify the cache has been updated
    await vi.advanceTimersByTimeAsync(1);
    const kvThird = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvThird.metadata,
      value: JSON.parse(kvThird.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime + TTL_TIME_MS * 2,
        swr: STALE_WHILE_REVALIDATE_TIME_MS,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
    expect(getUserMock).toHaveBeenCalledTimes(2);
  });
});

describe("Adapter integration tests - delete", () => {
  const TTL_TIME_MS = 60_000; // 1 minute
  let env: Env = {
    ...miniflareTestEnv,
    CACHIFIED_KV_CACHE: cloudflareKvCacheAdapter({
      kv: miniflareTestEnv.KV,
    }),
  };
  let startingSystemTime: number;
  let getUserMock = typeAsMockInstance(testHelpers.getUser);
  let checkValueMock = typeAsMockInstance(testHelpers.validateCache);
  let deleteMock = typeAsMockInstance(env.CACHIFIED_KV_CACHE.delete);

  beforeEach(() => {
    startingSystemTime = new Date("2023-01-01T00:00:00.000Z").valueOf();
    vi.useFakeTimers();
    vi.setSystemTime(startingSystemTime);
    env = {
      ...miniflareTestEnv,
      CACHIFIED_KV_CACHE: cloudflareKvCacheAdapter({
        kv: miniflareTestEnv.KV,
      }),
    };
    getUserMock = vi.spyOn(testHelpers, "getUser");
    checkValueMock = vi.spyOn(testHelpers, "validateCache");
    deleteMock = vi.spyOn(env.CACHIFIED_KV_CACHE, "delete");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should delete value from cache when checkValue returns "false"', async () => {
    const user = await getUserById(1, TTL_TIME_MS, 0, env);
    expect(user).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });

    const kvFirst = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvFirst.metadata,
      value: JSON.parse(kvFirst.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: 0,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);

    checkValueMock.mockImplementationOnce(() => false);
    getUserMock.mockImplementationOnce(() =>
      Promise.resolve({ id: 1, name: "FRESH_OVERRIDE", username: "johndoe" }),
    );

    const user2 = await getUserById(1, TTL_TIME_MS, 0, env);
    expect(user2).toEqual({
      id: 1,
      name: "FRESH_OVERRIDE",
      username: "johndoe",
    });

    // The cache should be deleted
    expect(deleteMock).toHaveBeenCalledTimes(1);

    // The cache should have been updated
    const kvSecond = await env.KV.getWithMetadata<CacheMetadata>("user-1");
    expect({
      metadata: kvSecond.metadata,
      value: JSON.parse(kvSecond.value ?? '""') as unknown,
    }).toEqual({
      metadata: {
        createdTime: startingSystemTime,
        swr: 0,
        ttl: TTL_TIME_MS,
      },
      value: {
        id: 1,
        name: "FRESH_OVERRIDE",
        username: "johndoe",
      },
    });
  });
});
