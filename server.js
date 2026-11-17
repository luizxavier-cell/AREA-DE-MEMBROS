// Production entry for hosts that start the app from a file they are given
// (Hostinger's "Entry file": `server.js`). Run `pnpm build` first.
//
// dist/server/node.js only listens when it is the very script node was started
// with; process managers that load the entry through a wrapper of their own
// would import it and never listen. Calling serve() here works either way, and
// since this file is not dist/server/node.js the server is never started twice.
//
// Like `pnpm start`, a .env next to this file is loaded when present; variables
// the host already set win over it. The import waits for it because the server
// bundle validates its env (env.ts) when it loads.
try {
  process.loadEnvFile(new URL('.env', import.meta.url));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

import('./dist/server/node.js').then(({ serve }) => serve());
