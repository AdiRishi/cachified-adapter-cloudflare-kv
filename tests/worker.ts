import {
  ExportedHandler,
  KVNamespace,
  ExecutionContext,
} from "@cloudflare/workers-types/2023-07-01";
import { cachified, Cache } from "@epic-web/cachified";
import { cloudflareKvCacheAdapter } from "~/index";

export interface Env {
  KV: KVNamespace;
  CACHIFIED_KV_CACHE: Cache;
}

export async function getUserById(
  userId: number,
  env: Env,
  ctx: ExecutionContext,
): Promise<Record<string, unknown>> {
  return cachified({
    key: `user-${userId}`,
    cache: env.CACHIFIED_KV_CACHE,
    async getFreshValue() {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
      const data = await response.json<Record<string, unknown>>();
      return data;
    },
    ttl: 60_000, // 1 minute
    staleWhileRevalidate: 300_000, // 5 minutes
    waitUntil: ctx.waitUntil.bind(ctx),
  });
}

const handler = {
  async fetch(request, env, ctx): Promise<Response> {
    env.CACHIFIED_KV_CACHE = cloudflareKvCacheAdapter({
      kv: env.KV,
      keyPrefix: "mycache",
      name: "CloudflareKV",
    });

    const url = new URL(request.url);
    const userId = parseInt(url.searchParams.get("userId") ?? "0");

    if (isNaN(userId) || userId <= 0) {
      return new Response("Invalid userId", { status: 400 });
    }

    const user = await getUserById(userId, env, ctx);
    return new Response(JSON.stringify(user), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
} satisfies ExportedHandler<Env>;

export default handler;
