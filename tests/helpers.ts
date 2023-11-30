import { KVNamespace } from "@cloudflare/workers-types";
import { SpyInstance } from "vitest";

export type Env = {
  KV: KVNamespace;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Procedure = (...args: any[]) => any;

export function typeAsSpyInstance<T extends Procedure>(
  fn: T,
): SpyInstance<Parameters<T>, ReturnType<T>> {
  return fn as unknown as SpyInstance<Parameters<typeof fn>, ReturnType<typeof fn>>;
}
