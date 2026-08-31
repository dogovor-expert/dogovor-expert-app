import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/__integration__/**/*.test.ts', 'src/**/__integration__/**/*.test.tsx'],
    setupFiles: ['./vitest.integration.setup.ts'],
    testTimeout: 30000,
  },
});