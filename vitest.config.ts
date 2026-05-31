import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    // Default run excludes snapshot tests (real Groq API calls) and real-DB
    // integration tests (require SUPABASE_SERVICE_ROLE_KEY from .env.local).
    // Run snapshots: npm run test:slow
    // Run real-DB tests: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx vitest run lib/__tests__/integration/course-structure-persistence.integration.test.ts
    exclude: ['**/node_modules/**', '**/snapshots/**', 'tests/e2e/**', '.claude/worktrees/**', '**/course-structure-persistence.integration.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
