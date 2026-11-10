import type { ParentProps } from 'solid-js';

import type { Course } from '../lib/types';
import { cn } from '../lib/utils';
import { CourseBackdrop } from './course-cover';
import { Progress } from './ui/misc';

/**
 * The big course banner at the top of Início and of a course page. On wider
 * screens it slides under the transparent top bar; the copy sits at the
 * left, where the art has faded into the page background.
 */
export function Billboard(
  props: ParentProps<{ course: Pick<Course, 'hue' | 'icon' | 'coverUrl'>; class?: string }>,
) {
  return (
    <section
      class={cn(
        'relative isolate flex items-end pt-52 pb-10 md:-mt-16 md:min-h-[min(80svh,44rem)] md:items-center md:pt-24 md:pb-20',
        props.class,
      )}
    >
      <CourseBackdrop course={props.course} />
      <div class="w-full px-4 sm:px-6 lg:px-12">
        <div class="flex max-w-xl flex-col items-start gap-5">{props.children}</div>
      </div>
    </section>
  );
}

/** "Continuar" / "Mais informações" button styles for a billboard. */
export const billboardButton = {
  primary:
    'inline-flex h-10 items-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-primary-foreground transition-[filter] outline-none hover:brightness-95 focus-visible:ring-[3px] focus-visible:ring-ring/50 md:h-11 md:px-6 md:text-base dark:hover:brightness-110 [&_svg]:size-5',
  secondary:
    'inline-flex h-10 items-center gap-2 rounded-md bg-foreground/8 px-5 text-sm font-semibold ring-1 ring-foreground/10 backdrop-blur-sm transition-colors outline-none ring-inset hover:bg-foreground/12 focus-visible:ring-[3px] focus-visible:ring-ring/50 md:h-11 md:px-6 md:text-base [&_svg]:size-5',
};

/** Small uppercase kicker above a billboard title, led by a brand dot. */
export function Eyebrow(props: ParentProps) {
  return (
    <p class="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-foreground/80 uppercase">
      <span aria-hidden="true" class="size-1.5 shrink-0 rounded-full bg-primary" />
      <span>{props.children}</span>
    </p>
  );
}

/** Progress line with its caption, for a course already started. */
export function BillboardProgress(props: { percent: number; caption: string; label: string }) {
  return (
    <div class="flex w-full max-w-sm items-center gap-3">
      <Progress value={props.percent} class="h-1 bg-foreground/15" aria-label={props.label} />
      <span class="shrink-0 text-xs text-muted-foreground tabular-nums">{props.caption}</span>
    </div>
  );
}
