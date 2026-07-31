import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(__dirname, '..'),
  resolve: {
    alias: {
      vitest: path.resolve(__dirname, 'node_modules/vitest'),
      supertest: path.resolve(__dirname, 'node_modules/supertest'),
    },
  },
});
