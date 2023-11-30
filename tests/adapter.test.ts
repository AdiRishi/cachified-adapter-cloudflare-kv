import { cachified, type Cache, type CacheMetadata } from "@epic-web/cachified";
import { test, expect, beforeEach, afterEach, vi } from "vitest";
import { cloudflareKvCacheAdapter } from "~/index";
import { Env as MiniflareEnv, typeAsSpyInstance } from "./helpers";

const describe = setupMiniflareIsolatedStorage();

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

const userClass = {
  getUser,
};
const STALE_WHILE_REVALIDATE_TIME_MS = 300_000; // 5 minutes
const TTL_TIME_MS = 60_000; // 1 minute

export async function getUserById(userId: number, env: Env) {
  return cachified({
    key: `user-${userId}`,
    cache: env.CACHIFIED_KV_CACHE,
    async getFreshValue() {
      return userClass.getUser(userId);
    },
    ttl: TTL_TIME_MS,
    staleWhileRevalidate: STALE_WHILE_REVALIDATE_TIME_MS,
  });
}

describe("Adapter Integration tests", () => {
  let env: Env;
  const startingSystemTime: number = Date.now();
  let getUserMock = typeAsSpyInstance(userClass.getUser);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(startingSystemTime);
    env = getMiniflareBindings();
    env.CACHIFIED_KV_CACHE = cloudflareKvCacheAdapter({
      kv: env.KV,
    });
    getUserMock = vi.spyOn(userClass, "getUser");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should store and retrieve a value from the cache", async () => {
    const user = await getUserById(1, env);
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
    const user2 = await getUserById(1, env);
    expect(user2).toEqual({
      id: 1,
      name: "John Doe",
      username: "johndoe",
    });
    expect(getUserMock).toHaveBeenCalledTimes(1);
  });

  test("should revalidate the cache when stale", async () => {
    // Initial fetch and cache
    await getUserById(1, env);
    expect(getUserMock).toHaveBeenCalledTimes(1);
    // check cache
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
    await getUserById(1, env);

    // Move time forward to just before stale time
    await vi.advanceTimersByTimeAsync(STALE_WHILE_REVALIDATE_TIME_MS - 1);
    await getUserById(1, env);
    // Should not re-fetch because it's not stale yet
    expect(getUserMock).toHaveBeenCalledTimes(1);

    // Move time forward to stale time
    vi.advanceTimersByTime(1);
    await getUserById(1, env);
    // Should re-fetch because it's now stale
    expect(getUserMock).toHaveBeenCalledTimes(2);
  });
});
