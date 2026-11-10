import { Show } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Search } from 'lucide';

import { paths } from '../router';
import { ThemeToggle } from './theme-toggle';
import { Breadcrumbs, type BreadcrumbEntry } from './ui/breadcrumb';
import { Input } from './ui/form';
import { Icon } from './ui/icon';
import { Separator } from './ui/misc';
import { SidebarTrigger } from './ui/sidebar';

/**
 * Top bar of the members area (shadcn "site-header"): sidebar toggle,
 * breadcrumbs, course search and theme switch.
 */
export function SiteHeader(props: { breadcrumbs: BreadcrumbEntry[] }) {
  return (
    <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      <SidebarTrigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumbs items={props.breadcrumbs} />
      <div class="ml-auto flex items-center gap-2">
        <form
          role="search"
          action={String(paths.cursos())}
          method="get"
          class="relative hidden sm:block"
        >
          <label for="busca-global" class="sr-only">
            Buscar cursos
          </label>
          <Icon
            icon={Search}
            class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="busca-global"
            name="busca"
            type="search"
            placeholder="Buscar cursos…"
            autocomplete="off"
            class="h-8 w-48 pl-8 lg:w-64"
          />
        </form>
        <ThemeToggle />
      </div>
    </header>
  );
}

type PageHeaderProps = {
  title: string;
  description?: JSX.Element;
  actions?: JSX.Element;
};

/** Page title block used at the top of every members page. */
export function PageHeader(props: PageHeaderProps) {
  return (
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">{props.title}</h1>
        <Show when={props.description}>
          <p class="text-muted-foreground">{props.description}</p>
        </Show>
      </div>
      <Show when={props.actions}>
        <div class="flex shrink-0 flex-wrap gap-2">{props.actions}</div>
      </Show>
    </div>
  );
}
