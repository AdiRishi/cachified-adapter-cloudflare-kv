import { KVNamespace } from "@cloudflare/workers-types/2023-07-01";

declare module "cloudflare:test" {
  interface ProvidedEnv {
    KV: KVNamespace;
  }
}
