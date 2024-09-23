import { default as WorkerDefault, Env as WorkerEnv } from "./worker";

declare module "cloudflare:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ProvidedEnv extends WorkerEnv {}

  export const SELF: Service<WorkerDefault>;
}
