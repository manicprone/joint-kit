// / <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['test/unit/**/*.spec.js'],
    forceRerunTriggers: ['src/**/*.js'],
    passWithNoTests: true,
  },
})
