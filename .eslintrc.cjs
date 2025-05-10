module.exports = {
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:astro/recommended",
    "plugin:astro/jsx-a11y-recommended", // Optional: for accessibility linting in Astro's JSX-like expressions
    "prettier", // Make sure this is last to override other formatting rules
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      // Define the configuration for `.astro` file.
      files: ["*.astro"],
      // Allows Astro components to be parsed.
      parser: "astro-eslint-parser",
      // Parse the script in `.astro` as TypeScript by adding the following configuration.
      // It'sKv recommended to specify the parser even if you are not using TypeScript.
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
      rules: {
        // Override/add rules specific to Astro files here
        // Example: 'astro/no-set-html-directive': 'error'
      },
    },
    {
      // Define the configuration for `.ts` files.
      files: ["*.ts"],
      rules: {
        // Add any TypeScript specific rules here
        // Example: "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      },
    },
  ],
  // Global settings can be added here
  // settings: {
  //   // ...
  // }
};
