import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { httpStatus } from '@solidjs/web';

import { buttonVariants } from '../components/ui/button';
import { platform } from '../lib/config';
import { paths } from '../router';

// The catch-all route. httpStatus() sets the response status during SSR
// (a no-op in the browser); it runs in preload so the status code is set
// before the response head flushes.
export const route = {
  preload: () => httpStatus(404),
} satisfies RouteDefinition;

export default function NotFound() {
  return (
    <main class="flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden p-6 text-center">
      <Title>{`Página não encontrada · ${platform.name}`}</Title>
      {/* The "0" is a target with a dart: the address missed it. The ring sits
          left in its square, so the dart overlaps the empty top-left of the
          last 4. Decorative; the heading below carries the message. */}
      <div
        aria-hidden="true"
        class="flex items-center text-[clamp(6.5rem,24vw,13rem)] leading-none font-semibold tracking-tighter select-none"
      >
        <span>4</span>
        <img
          src="/images/alvo-404.png"
          alt=""
          width="256"
          height="256"
          class="relative z-10 -mr-[0.12em] ml-[0.02em] size-[1.05em] -translate-y-[0.03em]"
        />
        <span>4</span>
      </div>
      <div class="space-y-3">
        <h1 class="text-3xl font-semibold tracking-tight text-balance">
          <span class="sr-only">Erro 404: </span>Página não encontrada
        </h1>
        <p class="text-muted-foreground">O endereço acessado não existe ou foi movido.</p>
      </div>
      <a href={String(paths())} class={buttonVariants()}>
        Voltar ao início
      </a>
    </main>
  );
}
