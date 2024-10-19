// / <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // reporters: ['verbose'],
    include: ['test/**/*.spec.js'],
    forceRerunTriggers: ['src/**/*.js'],
    coverage: {
      include: ['src/**/*.js']
    },
    fileParallelism: false,
    passWithNoTests: true,
    snapshotSerializers: [
      './test/serializers/joint-error-serializer'
    ]
  }
})
