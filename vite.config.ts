/// <reference types="vitest" />
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { typescriptPaths } from "rollup-plugin-typescript-paths";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    sourcemap: false,
    minify: false,
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
  plugins: [
    typescriptPaths(),
    typescript({
      sourceMap: false,
      declaration: true,
      outDir: "dist",
    }),
  ],
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "html", "clover", "json"],
    },
    environment: "node",
    include: ["tests/*.test.ts", "tests/**/*.test.ts"],
  },
});
