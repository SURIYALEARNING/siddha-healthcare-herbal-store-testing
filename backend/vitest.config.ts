import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./__tests__/setup.ts'],
    include: [
      '__tests__/**/*.test.ts',
      '__tests__/**/*.test.js',
    ],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'controllers/**/*.js',
        'services/**/*.js',
        'Auth/**/*.js',
        'config/**/*.js',
        'models/**/*.js',
        'constants/**/*.js',
      ],
      exclude: [
        'node_modules',
        'dist',
        '__tests__',
        'coverage',
        'server.ts',
        'database.js',
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    forceExit: true,
    detectOpenHandles: true,
  },
});