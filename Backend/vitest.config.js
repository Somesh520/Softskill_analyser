import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/Tests/setup.js'],
    fileParallelism: false,
    testTimeout: 30000,
  },
});
