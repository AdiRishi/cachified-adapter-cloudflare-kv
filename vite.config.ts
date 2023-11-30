/// <reference types="vitest" />
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { typescriptPaths } from "rollup-plugin-typescript-paths";
import { defineConfig } from "vite";

export default defineConfig({
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
  plugins: [typescriptPaths(), typescript()],
  test: {
    reporters: ["verbose"],
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "html", "clover", "json"],
    },
    include: ["tests/*.test.ts", "tests/**/*.test.ts"],
    environment: "miniflare",
    environmentOptions: {
      wranglerConfigPath: "./wrangler.vitest.toml",
      packagePath: false, // Stop miniflare from looking only in the dist/ folder
      bindings: { ENVIRONMENT: "testing" },
    },
  },
});
