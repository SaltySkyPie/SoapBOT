import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    ignores: ["node_modules/**", "out/**", "src/generated/**"],
  },
  {
    files: ["src/**/*.ts"],
    plugins: {
      "unused-imports": unusedImports,
      prettier: prettier,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Prettier integration
      "prettier/prettier": "warn",

      // Auto-fix unused imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Disable base rule in favor of unused-imports plugin
      "@typescript-eslint/no-unused-vars": "off",

      // Discord.js async patterns - catches unhandled promise rejections
      "@typescript-eslint/no-floating-promises": "off",

      // Allow explicit any (Discord.js sometimes needs flexibility)
      "@typescript-eslint/no-explicit-any": "off",

      // Allow Function type (used for event handlers)
      "@typescript-eslint/no-unsafe-function-type": "off",

      // Prefer const over let
      "prefer-const": "warn",

      // No var declarations
      "no-var": "error",

      // Consistent return types (helpful for command execute methods)
      "@typescript-eslint/explicit-function-return-type": "off",

      // Allow require imports (sometimes needed for dynamic imports)
      "@typescript-eslint/no-require-imports": "off",

      // Warn on console usage (prefer custom logger)
      "no-console": "off",

      // Enforce strict equality (smart mode allows == null checks)
      eqeqeq: ["warn", "smart"],

      // No duplicate imports (auto-fixable)
      "no-duplicate-imports": "error",

      // Allow non-null assertions (common in Discord.js with guaranteed contexts)
      "@typescript-eslint/no-non-null-assertion": "off",

      // Warn on empty functions (except for arrow functions as callbacks)
      "@typescript-eslint/no-empty-function": ["warn", { allow: ["arrowFunctions"] }],
    },
  }
);
