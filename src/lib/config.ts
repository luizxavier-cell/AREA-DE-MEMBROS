// Platform identity. VITE_APP_NAME is validated and baked in at build time
// (see env.ts); everything else here is the Creator's static profile — swap
// it for an API read once the backend exists.
import { env } from 'virtual:solid-env/client';

export const platform = {
  name: env.VITE_APP_NAME,
  creator: {
    name: 'Marina Duarte',
    role: 'Criadora de conteúdo e mentora',
  },
  supportEmail: 'suporte@exemplo.com',
} as const;
