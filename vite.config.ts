import path from "path";
import { defineConfig } from "vite";
import typescript from "@rollup/plugin-typescript";

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
  },
  plugins: [
    typescript({
      sourceMap: false,
      declaration: true,
      outDir: "dist",
    }),
  ],
});
