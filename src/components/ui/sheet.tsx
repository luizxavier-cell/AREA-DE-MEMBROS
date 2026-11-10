import { Show, onSettled, type ParentProps } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { X } from 'lucide';

import { cn } from '../../lib/utils';
import { Icon } from './icon';

// shadcn/ui Sheet: a modal side panel. Only mounted while open, so the
// server never renders it. Escape and the overlay close it; page scroll is
// locked while it is open and focus moves into the panel.

type SheetProps = ParentProps<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name of the dialog. */
  title: string;
  side?: 'left' | 'right';
  class?: string;
  style?: JSX.CSSProperties;
  hideClose?: boolean;
}>;

export function Sheet(props: SheetProps) {
  return (
    <Show when={props.open}>
      <SheetPanel {...props} />
    </Show>
  );
}

function SheetPanel(props: SheetProps) {
  let panel!: HTMLDivElement;
  const close = () => props.onOpenChange(false);

  onSettled(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    panel.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  });

  return (
    <>
      <div
        data-slot="sheet-overlay"
        class="fixed inset-0 z-50 animate-in bg-black/50 fade-in-0"
        onClick={close}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        tabindex={-1}
        data-slot="sheet-content"
        data-side={props.side ?? 'left'}
        style={props.style}
        class={cn(
          'fixed inset-y-0 z-50 flex h-full w-3/4 animate-in flex-col gap-4 bg-background shadow-lg outline-none duration-300 sm:max-w-sm',
          'data-[side=left]:left-0 data-[side=left]:border-r data-[side=left]:slide-in-from-left',
          'data-[side=right]:right-0 data-[side=right]:border-l data-[side=right]:slide-in-from-right',
          props.class,
        )}
      >
        {props.children}
        <Show when={!props.hideClose}>
          <button
            type="button"
            class="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden"
            onClick={close}
          >
            <Icon icon={X} />
            <span class="sr-only">Fechar</span>
          </button>
        </Show>
      </div>
    </>
  );
}
