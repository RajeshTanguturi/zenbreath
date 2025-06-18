// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Correct import for v4's Vite plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Use the @tailwindcss/vite plugin here
  ],
});