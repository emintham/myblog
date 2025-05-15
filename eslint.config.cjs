const { defineConfig } = require("eslint/config");

const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const parser = require("astro-eslint-parser");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {},
    },

    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:astro/recommended",
      "plugin:astro/jsx-a11y-recommended",
      "prettier"
    ),

    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
  },
  {
    files: ["**/*.astro"],

    languageOptions: {
      parser: parser,

      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },

    rules: {},
  },
  {
    files: ["**/*.ts"],
    rules: {},
  },
]);
