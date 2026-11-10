import type { StorybookConfig } from 'storybook-solidjs-vite';

// Storybook 10 + storybook-solidjs-vite (picks its Solid 2 renderer from the
// installed solid-js). Stories live next to their components.
const config: StorybookConfig = {
  framework: 'storybook-solidjs-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: {
    builder: {
      name: '@storybook/builder-vite',
      // The app's vite.config.ts runs Solid's start mode (SSR, server
      // functions, middleware). Components only need the client compile, so
      // Storybook gets its own config.
      options: { viteConfigPath: '.storybook/vite.config.ts' },
    },
    disableTelemetry: true,
  },
  staticDirs: ['../public'],
};

export default config;
