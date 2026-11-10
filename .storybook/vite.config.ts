import solid from '@solidjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { fileRoutes } from 'filesystem-routing/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

// Vite config for Storybook only (see .storybook/main.ts). Same compiler and
// styling as the app, without start mode: components compile as plain,
// non-hydratable client code.
export default defineConfig({
  plugins: [
    tailwindcss(),
    // Resolves the `?w=...&as=picture` image imports, as in the app config.
    imagetools(),
    solid({
      // Serves virtual:solid-env/client (VITE_ vars from env.ts), which
      // src/lib/config.ts reads for the platform name.
      env: true,
      extensions: ['.jsx', '.tsx'],
    }),
    // Components build links with the typed `paths` from src/router.ts,
    // which reads the route manifest this plugin generates.
    fileRoutes(),
  ],
});
