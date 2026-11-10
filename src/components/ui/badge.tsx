import { omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

// shadcn/ui Badge, plus a `success` variant for completed states.
export const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-white dark:bg-destructive/60',
        outline: 'text-foreground',
        success: 'border-transparent bg-success/12 text-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeProps = Omit<ComponentProps<'span'>, 'class'> &
  VariantProps<typeof badgeVariants> & { class?: string };

export function Badge(props: BadgeProps) {
  const rest = omit(props, 'class', 'variant');
  return (
    <span
      data-slot="badge"
      class={cn(badgeVariants({ variant: props.variant }), props.class)}
      {...rest}
    />
  );
}
