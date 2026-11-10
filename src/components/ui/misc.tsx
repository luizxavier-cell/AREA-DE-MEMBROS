import { Show, omit } from 'solid-js';
import type { ComponentProps, JSX } from '@solidjs/web';

import { cn, initials } from '../../lib/utils';

// Small shadcn/ui primitives: Progress, Avatar, Separator, Skeleton, Kbd and
// the Empty state.

type ProgressProps = {
  /** 0–100 */
  value: number;
  class?: string;
  indicatorClass?: string;
  'aria-label'?: string;
};

export function Progress(props: ProgressProps) {
  const value = () => Math.min(100, Math.max(0, props.value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value())}
      aria-label={props['aria-label']}
      data-slot="progress"
      class={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', props.class)}
    >
      <div
        data-slot="progress-indicator"
        class={cn('h-full w-full flex-1 bg-primary transition-transform', props.indicatorClass)}
        style={{ transform: `translateX(-${100 - value()}%)` }}
      />
    </div>
  );
}

type AvatarProps = {
  name: string;
  src?: string;
  class?: string;
  fallbackClass?: string;
};

/** shadcn/ui Avatar: the image when there is one, initials otherwise. */
export function Avatar(props: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      class={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', props.class)}
    >
      <Show
        when={props.src}
        fallback={
          <span
            data-slot="avatar-fallback"
            aria-hidden="true"
            class={cn(
              'flex size-full items-center justify-center rounded-full bg-muted text-xs font-medium',
              props.fallbackClass,
            )}
          >
            {initials(props.name)}
          </span>
        }
      >
        {(src) => <img class="aspect-square size-full object-cover" src={src()} alt={props.name} />}
      </Show>
    </span>
  );
}

type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical';
  class?: string;
};

export function Separator(props: SeparatorProps) {
  return (
    <div
      role="none"
      data-slot="separator"
      data-orientation={props.orientation ?? 'horizontal'}
      class={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        props.class,
      )}
    />
  );
}

type DivProps = Omit<ComponentProps<'div'>, 'class'> & { class?: string };

export function Skeleton(props: DivProps) {
  const rest = omit(props, 'class');
  return (
    <div
      data-slot="skeleton"
      class={cn('animate-pulse rounded-md bg-accent', props.class)}
      {...rest}
    />
  );
}

export function Kbd(props: { class?: string; children: JSX.Element }) {
  return (
    <kbd
      data-slot="kbd"
      class={cn(
        'pointer-events-none inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none',
        props.class,
      )}
    >
      {props.children}
    </kbd>
  );
}

type EmptyProps = {
  icon?: JSX.Element;
  title: string;
  description?: JSX.Element;
  children?: JSX.Element;
  class?: string;
};

/** shadcn/ui Empty: a centered state for "nothing here (yet)". */
export function Empty(props: EmptyProps) {
  return (
    <div
      data-slot="empty"
      class={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border border-dashed p-6 text-center text-balance md:p-12',
        props.class,
      )}
    >
      <div class="flex max-w-sm flex-col items-center gap-2 text-center">
        <Show when={props.icon}>
          <div class="mb-2 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6">
            {props.icon}
          </div>
        </Show>
        <div class="text-lg font-medium tracking-tight">{props.title}</div>
        <Show when={props.description}>
          <div class="text-sm/relaxed text-muted-foreground">{props.description}</div>
        </Show>
      </div>
      <Show when={props.children}>
        <div class="flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance">
          {props.children}
        </div>
      </Show>
    </div>
  );
}
