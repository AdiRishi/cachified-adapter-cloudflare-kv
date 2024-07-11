import { KVNamespace } from "@cloudflare/workers-types/2023-07-01";
import { MockInstance } from "vitest";

export type Env = {
  KV: KVNamespace;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Procedure = (...args: any[]) => any;

export function typeAsSpyInstance<T extends Procedure>(fn: T): MockInstance<T> {
  return fn as unknown as MockInstance<T>;
}
