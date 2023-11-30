import { KVNamespace } from "@cloudflare/workers-types";

export type Env = {
  KV: KVNamespace;
};
