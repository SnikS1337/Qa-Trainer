import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');

          if (normalizedId.includes('/node_modules/')) {
            if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/')) {
              return 'react-vendor';
            }

            if (normalizedId.includes('/motion/')) {
              return 'motion-vendor';
            }

            if (normalizedId.includes('/canvas-confetti/')) {
              return 'confetti-vendor';
            }
          }

          if (
            normalizedId.includes('/src/data/lessons.ts') ||
            /\/src\/data\/lessons_part_\d+\.ts$/.test(normalizedId)
          ) {
            return 'lessons-content';
          }

          if (normalizedId.includes('/src/data/practice_tasks.ts')) {
            return 'practice-content';
          }

          if (
            normalizedId.includes('/src/data/achievements.ts') ||
            normalizedId.includes('/src/data/messages.ts') ||
            normalizedId.includes('/src/data/quotes.ts')
          ) {
            return 'reference-content';
          }
        },
      },
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify: file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
