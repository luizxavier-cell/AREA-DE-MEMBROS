import { For, Show } from 'solid-js';
import { ChevronRight } from 'lucide';

import { cn } from '../../lib/utils';
import { Icon } from './icon';

// shadcn/ui Breadcrumb, collapsed into one data-driven component: every
// item but the last is a link; the last is the current page.

export type BreadcrumbEntry = { label: string; href?: string };

export function Breadcrumbs(props: { items: BreadcrumbEntry[]; class?: string }) {
  return (
    <nav
      aria-label="Navegação estrutural"
      data-slot="breadcrumb"
      class={cn('min-w-0', props.class)}
    >
      <ol class="flex min-w-0 flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5">
        <For each={props.items} keyed={(item) => `${item.label}|${item.href ?? ''}`}>
          {(item, index) => (
            <>
              <Show when={index() > 0}>
                <li role="presentation" aria-hidden="true" class="max-md:hidden [&>svg]:size-3.5">
                  <Icon icon={ChevronRight} />
                </li>
              </Show>
              <li
                class={[
                  'inline-flex min-w-0 items-center gap-1.5',
                  // On phones only the current page is shown.
                  { 'max-md:hidden': index() < props.items.length - 1 },
                ]}
              >
                <Show
                  when={index() < props.items.length - 1 && item().href}
                  fallback={
                    <span aria-current="page" class="truncate font-normal text-foreground">
                      {item().label}
                    </span>
                  }
                >
                  {(href) => (
                    <a href={href()} class="truncate transition-colors hover:text-foreground">
                      {item().label}
                    </a>
                  )}
                </Show>
              </li>
            </>
          )}
        </For>
      </ol>
    </nav>
  );
}
