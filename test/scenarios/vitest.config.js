// / <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['test/scenarios/**/*.spec.js'],
    forceRerunTriggers: ['src/**/*.js'],
    fileParallelism: false,
    passWithNoTests: true,
  },
})
