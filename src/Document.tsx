import type { ParentProps } from 'solid-js';
import { HydrationScript } from '@solidjs/web';

// The document shell (the index.html replacement), picked up by the
// src/Document.* convention; it must render the full <html> and ships no
// client JS. <HydrationScript /> is stripped from the prerendered shell in
// client mode and activates under `ssr: true`.
//
// /theme-init.js (public/) is a tiny blocking script that sets the `dark`
// class on <html> before first paint. <html> is never hydrated, so the class
// it adds cannot cause a hydration mismatch.
export default function Document(props: ParentProps) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.ico" />
        <title>Área de Membros</title>
        <script src="/theme-init.js" />
        <HydrationScript />
      </head>
      <body>{props.children}</body>
    </html>
  );
}
