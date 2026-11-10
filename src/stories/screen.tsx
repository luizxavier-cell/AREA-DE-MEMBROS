import { createRouter, memoryHistory } from '@solidjs/router';
import { fileRoutes } from '@solidjs/router/fs';
import { Show, untrack } from 'solid-js';
import { pageRoutes } from 'virtual:file-routes';

import { AppLayout } from '../App';

// Storybook helper for full screens: the real app — file routes, layouts,
// data layer (src/lib/api.ts) — mounted at `url` on an in-memory history.
// Links and redirects navigate inside the story, so every screen is a
// clickable prototype of the member area.

function ScreenAt(props: { url: string }) {
  // One router per mount; the initial URL is fixed when it is created.
  const Router = createRouter({
    routes: fileRoutes(pageRoutes),
    history: memoryHistory(untrack(() => props.url)),
  });
  return <Router>{(route) => <AppLayout>{route.children}</AppLayout>}</Router>;
}

export type ScreenProps = {
  /** Path to open, e.g. `/cursos/metodo-criador` or `/cursos?busca=bio`. */
  url: string;
};

export function Screen(props: ScreenProps) {
  // Keyed: editing the URL control mounts a fresh router at the new URL.
  return (
    <Show when={props.url} keyed>
      {(url) => <ScreenAt url={url} />}
    </Show>
  );
}
