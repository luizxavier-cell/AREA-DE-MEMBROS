import { omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';

import { cn } from '../../lib/utils';

// shadcn/ui Card family.
type DivProps = Omit<ComponentProps<'div'>, 'class'> & { class?: string };

export function Card(props: DivProps) {
  const rest = omit(props, 'class');
  return (
    <div
      data-slot="card"
      class={cn(
        'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
        props.class,
      )}
      {...rest}
    />
  );
}

export function CardHeader(props: DivProps) {
  const rest = omit(props, 'class');
  return (
    <div
      data-slot="card-header"
      class={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        props.class,
      )}
      {...rest}
    />
  );
}

export function CardTitle(props: DivProps) {
  const rest = omit(props, 'class');
  return (
    <div data-slot="card-title" class={cn('leading-none font-semibold', props.class)} {...rest} />
  );
}

export function CardDescription(props: DivProps) {
  const rest = omit(props, 'class');
  return (
    <div
      data-slot="card-description"
      class={cn('text-sm text-muted-foreground', props.class)}
      {...rest}
    />
  );
}

export function CardAction(props: DivProps) {
  const rest = omit(props, 'class');
  return (
    <div
      data-slot="card-action"
      class={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', props.class)}
      {...rest}
    />
  );
}

export function CardContent(props: DivProps) {
  const rest = omit(props, 'class');
  return <div data-slot="card-content" class={cn('px-6', props.class)} {...rest} />;
}

export function CardFooter(props: DivProps) {
  const rest = omit(props, 'class');
  return (
    <div
      data-slot="card-footer"
      class={cn('flex items-center px-6 [.border-t]:pt-6', props.class)}
      {...rest}
    />
  );
}
