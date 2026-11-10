import { omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

// shadcn/ui Button. There is no `asChild`: for a link that looks like a
// button, put `buttonVariants()` on a plain <a> (the router handles <a>).
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-brand text-primary-foreground hover:brightness-95 dark:hover:brightness-110',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = Omit<ComponentProps<'button'>, 'class'> &
  VariantProps<typeof buttonVariants> & { class?: string };

export function Button(props: ButtonProps) {
  const rest = omit(props, 'class', 'variant', 'size', 'type');
  return (
    <button
      data-slot="button"
      type={props.type ?? 'button'}
      class={cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)}
      {...rest}
    />
  );
}
