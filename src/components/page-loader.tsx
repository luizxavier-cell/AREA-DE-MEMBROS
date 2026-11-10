import { LoaderCircle } from 'lucide';

import { Icon } from './ui/icon';

/** Full-screen fallback while a page's data loads for the first time. */
export function PageLoader() {
  return (
    <div
      role="status"
      class="flex min-h-svh items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <Icon icon={LoaderCircle} class="size-5 animate-spin" />
      Carregando…
    </div>
  );
}
