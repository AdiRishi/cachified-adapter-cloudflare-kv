import path from "path";
import { defineConfig } from "vite";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  build: {
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "CachifiedAdapterCloudflareKv",
      fileName: "main",
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
