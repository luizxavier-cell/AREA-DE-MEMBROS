import { Show, createUniqueId, type ParentProps } from 'solid-js';
import { ChevronLeft, ChevronRight } from 'lucide';

import { cn } from '../lib/utils';
import { Icon } from './ui/icon';

type RailProps = ParentProps<{
  title: string;
  /** Short muted note beside the title, e.g. "5 módulos · 40%". */
  meta?: string;
  /** "Ver tudo" link target. */
  href?: string;
  class?: string;
}>;

const arrowClass =
  'absolute inset-y-2 z-10 hidden w-10 items-center justify-center text-foreground opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 hover:[&>svg]:scale-125 md:flex lg:w-12';

/**
 * A titled horizontal row of tiles that scrolls sideways (touch, trackpad,
 * or the edge arrows on hover). Children are the tiles; each keeps its own
 * width and snaps to the row's left edge.
 */
export function Rail(props: RailProps) {
  const headingId = createUniqueId();
  let track!: HTMLDivElement;
  const scroll = (direction: 1 | -1) =>
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' });

  return (
    <section aria-labelledby={headingId} class={cn('group/rail', props.class)}>
      <div class="flex items-baseline gap-3 px-4 sm:px-6 lg:px-12">
        <h2 id={headingId} class="text-lg font-semibold tracking-tight md:text-xl">
          <Show when={props.href} fallback={props.title}>
            {(href) => (
              <a
                href={href()}
                class="group/link inline-flex items-center gap-1 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {props.title}
                <span class="flex items-center gap-0.5 text-sm font-medium text-primary opacity-0 transition-opacity group-hover/link:opacity-100 group-focus-visible/link:opacity-100 max-md:sr-only">
                  Ver tudo
                  <Icon icon={ChevronRight} class="size-3.5" />
                </span>
              </a>
            )}
          </Show>
        </h2>
        <Show when={props.meta}>
          <span class="text-sm text-muted-foreground tabular-nums">{props.meta}</span>
        </Show>
      </div>
      <div class="relative">
        <div
          ref={track}
          class="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 py-3 *:shrink-0 *:snap-start sm:scroll-px-6 sm:px-6 md:gap-3 lg:scroll-px-12 lg:px-12"
        >
          {props.children}
        </div>
        {/* Pointer-only helpers: keyboard users tab through the tiles, which
            scroll themselves into view. */}
        <button
          type="button"
          tabindex={-1}
          aria-hidden="true"
          class={cn(arrowClass, 'left-0 bg-linear-to-r from-background to-transparent')}
          onClick={() => scroll(-1)}
        >
          <Icon icon={ChevronLeft} class="size-7 transition-transform" />
        </button>
        <button
          type="button"
          tabindex={-1}
          aria-hidden="true"
          class={cn(arrowClass, 'right-0 bg-linear-to-l from-background to-transparent')}
          onClick={() => scroll(1)}
        >
          <Icon icon={ChevronRight} class="size-7 transition-transform" />
        </button>
      </div>
    </section>
  );
}
