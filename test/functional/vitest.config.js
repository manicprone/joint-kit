// / <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['test/functional/**/*.spec.js'],
    forceRerunTriggers: ['src/**/*.js'],
    fileParallelism: false,
    passWithNoTests: true,
    snapshotSerializers: [
      './test/serializers/joint-error-serializer',
    ],
  },
})
