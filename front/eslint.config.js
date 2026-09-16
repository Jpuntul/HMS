import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // v7's react-hooks/set-state-in-effect flags the standard
      // fetch-in-useEffect-then-setState pattern used throughout this app's
      // list/detail pages. That pattern is intentional here (no data-fetching
      // library in use) rather than a bug, so the rule is off rather than
      // suppressed call-by-call.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
