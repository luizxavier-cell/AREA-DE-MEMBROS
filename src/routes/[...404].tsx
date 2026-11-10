import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { httpStatus } from '@solidjs/web';
import { ArrowLeft, BookOpen, Compass } from 'lucide';

import { ThemeToggle } from '../components/theme-toggle';
import { buttonVariants } from '../components/ui/button';
import { Icon } from '../components/ui/icon';
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
    <main class="relative flex min-h-svh flex-col items-center justify-center gap-8 p-6 text-center">
      <Title>{`Página não encontrada · ${platform.name}`}</Title>
      <ThemeToggle class="absolute top-4 right-4" />
      <span class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon icon={Compass} class="size-7" />
      </span>
      <div class="max-w-md space-y-3">
        <p class="text-sm font-medium text-primary">Erro 404</p>
        <h1 class="text-3xl font-semibold tracking-tight">Página não encontrada</h1>
        <p class="text-balance text-muted-foreground">
          O endereço que você acessou não existe ou foi movido. Que tal voltar para os seus cursos?
        </p>
      </div>
      <div class="flex flex-wrap justify-center gap-3">
        <a href={String(paths())} class={buttonVariants()}>
          <Icon icon={ArrowLeft} />
          Ir para o início
        </a>
        <a href={String(paths.cursos())} class={buttonVariants({ variant: 'outline' })}>
          <Icon icon={BookOpen} />
          Meus cursos
        </a>
      </div>
    </main>
  );
}
