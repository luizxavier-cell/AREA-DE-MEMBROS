import { Repeat, Show, createSignal, omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';

import { cn } from '../../lib/utils';

type OtpInputProps = Omit<ComponentProps<'input'>, 'class' | 'type' | 'value' | 'onInput'> & {
  value: string;
  onValueChange: (value: string) => void;
  /** Number of digits. */
  length?: number;
  class?: string;
};

/**
 * One-time code field. A single native input sits transparent over the
 * slots, so paste, `one-time-code` autofill and screen readers all see one
 * ordinary field; the slots are only its visual rendering.
 */
export function OtpInput(props: OtpInputProps) {
  const [focused, setFocused] = createSignal(false);
  const rest = omit(props, 'class', 'value', 'onValueChange', 'length');
  const length = () => props.length ?? 6;
  const activeSlot = () => Math.min(props.value.length, length() - 1);
  const isActive = (slot: number) => focused() && slot === activeSlot();

  // The slots can't show a caret in the middle, so it stays at the end.
  // A range selection is left alone: select-all then type or paste replaces.
  const keepCaretAtEnd = (event: Event & { currentTarget: HTMLInputElement }) => {
    const input = event.currentTarget;
    const end = input.value.length;
    if (input.selectionStart === input.selectionEnd && input.selectionStart !== end) {
      input.setSelectionRange(end, end);
    }
  };

  return (
    <div data-slot="otp-input" class={cn('relative flex w-full gap-2', props.class)}>
      <Repeat count={length()}>
        {(slot) => (
          <div
            aria-hidden="true"
            data-active={isActive(slot) ? 'true' : undefined}
            data-invalid={props['aria-invalid'] ? 'true' : undefined}
            class="flex h-12 min-w-0 flex-1 items-center justify-center rounded-md border border-input text-lg font-medium shadow-xs transition-[color,box-shadow] data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50 data-[invalid=true]:border-destructive dark:bg-input/30"
          >
            {props.value[slot]}
            <Show when={isActive(slot) && !props.value[slot]}>
              <span class="h-5 w-px animate-pulse bg-foreground motion-reduce:animate-none" />
            </Show>
          </div>
        )}
      </Repeat>
      <input
        {...rest}
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        data-slot="otp-input-field"
        class="absolute inset-0 size-full cursor-text bg-transparent text-base text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed"
        value={props.value}
        onInput={(event) => {
          const input = event.currentTarget;
          // No maxlength: it would cut a pasted "123 456" before the cleanup.
          const digits = input.value.replace(/\D/g, '').slice(0, length());
          input.value = digits;
          props.onValueChange(digits);
        }}
        onSelect={keepCaretAtEnd}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}
