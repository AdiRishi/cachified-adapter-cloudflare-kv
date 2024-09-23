import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  js.configs.recommended,
  ...tsEslint.configs.recommendedTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,
  eslintPluginPrettier,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": "off",
    },
  },
  {
    ignores: [
      "**/.eslintrc.json",
      "**/node_modules",
      "**/.nuxt",
      "**/.output",
      "**/.turbo",
      "**/assets",
      "functions/*.js",
      "functions/*.js.*",
      "**/public",
      "**/dist",
      "**/coverage",
      "**/.wrangler",
      "**/.prettierrc.js",
      "**/vite.config.ts",
      "**/eslint.config.mjs",
    ],
  },
);
