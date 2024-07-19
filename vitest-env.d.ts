import { KVNamespace } from "@cloudflare/workers-types";

declare module "cloudflare:test" {
  interface ProvidedEnv {
    KV: KVNamespace;
  }
}
