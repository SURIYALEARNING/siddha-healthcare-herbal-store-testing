import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx,js,jsx}'],
    exclude: ['node_modules', 'dist', 'src/__tests__/e2e'],
    css: true,
    deps: {
      inline: [/\.png$/, /\.jpg$/, /\.jpeg$/, /\.gif$/, /\.svg$/, /\.webp$/],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/pages/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
        'src/context/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
        'src/api/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules',
        'dist',
        'src/__tests__',
        'coverage',
        'src/types.ts',
        'src/types/*.ts',
        'src/constants/*.ts',
        'src/data/*.ts',
        'src/i18n/*.ts',
        'src/*.d.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});