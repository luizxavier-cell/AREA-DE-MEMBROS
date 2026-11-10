import { createDecorator, type Preview } from 'storybook-solidjs-vite';

import '../src/app.css';

// Light/dark from the toolbar. The app's theme is the `dark` class on
// <html> (see src/lib/theme.ts), so the decorator only flips that class;
// it runs again whenever the global changes.
const withTheme = createDecorator((Story, context) => {
  document.documentElement.classList.toggle('dark', context.globals.theme === 'dark');
  return Story();
});

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Tema da interface',
      toolbar: {
        title: 'Tema',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Claro', icon: 'sun' },
          { value: 'dark', title: 'Escuro', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    layout: 'centered',
    // The page background comes from the theme tokens, not this tool.
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Accessibility violations show in the A11y panel without failing.
      test: 'todo',
    },
  },
};

export default preview;
