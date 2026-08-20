import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json', 'html'],
      include: [
        'src/services/examsService.js',
        'src/utils/**',
        'src/hooks/useExamSession.js',
        'src/components/Admin/**',
        'src/components/Common/**',
        'src/components/Dashboard/**',
        'src/components/Monitoring/**',
        'src/components/Student/**',
        'src/components/Layout/**',
      ],
      exclude: [
        'src/test/**',
        'src/main.jsx',
        'src/firebase.js',
        'src/components/Common/PasswordModal.jsx',
        'src/components/Layout/Header.jsx',
        'src/components/Layout/ProfileDrawer.jsx',
        'src/components/Student/ProctoringMonitor.jsx',
        'src/components/Forms/**',
      ],
      thresholds: {
        lines: 70,
        functions: 65,
        branches: 60,
        statements: 70,
      },
    },
  },
});
