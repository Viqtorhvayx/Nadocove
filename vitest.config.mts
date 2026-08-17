import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      // Fixed test-only secret — never used outside the test run.
      AUTH_SECRET: "vitest-test-secret-do-not-use-in-production",
    },
  },
});
