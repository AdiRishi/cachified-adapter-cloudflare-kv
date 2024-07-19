/// <reference types="vitest" />
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import path from "path";
import { typescriptPaths } from "rollup-plugin-typescript-paths";
import dts from "vite-plugin-dts";

export default defineWorkersConfig({
  build: {
    sourcemap: true,
    minify: false,
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "CachifiedAdapterCloudflareKv",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["@epic-web/cachified", "@cloudflare/workers-types"],
    },
  },
  plugins: [typescriptPaths(), dts({ rollupTypes: true })],
  test: {
    poolOptions: {
      workers: {
        miniflare: {
          bindings: {
            ENVIRONMENT: "testing",
          },
        },
        wrangler: {
          configPath: "./wrangler.vitest.toml",
        },
      },
    },
    reporters: ["verbose"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "clover", "json"],
    },
  },
});
