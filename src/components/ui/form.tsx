import { createSignal, omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import { ChevronDown } from 'lucide';

import { cn } from '../../lib/utils';
import { Icon } from './icon';

// shadcn/ui form controls: Input, Textarea, Label, NativeSelect, Checkbox
// and Switch. They are thin wrappers over native elements, so they work in
// plain <form>s, before hydration, and with FormData on submit.

// Text fields stay at 16px on touch screens: below that an iPhone zooms the
// page when they take the focus. A phone on its side is past `md`, hence
// `pointer-fine` on the smaller size.
const fieldBase =
  'w-full min-w-0 rounded-md border border-input bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:pointer-fine:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40';

type InputProps = Omit<ComponentProps<'input'>, 'class'> & { class?: string };

export function Input(props: InputProps) {
  const rest = omit(props, 'class');
  return (
    <input
      data-slot="input"
      class={cn(
        fieldBase,
        'flex h-9 px-3 py-1 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        props.class,
      )}
      {...rest}
    />
  );
}

type TextareaProps = Omit<ComponentProps<'textarea'>, 'class'> & { class?: string };

export function Textarea(props: TextareaProps) {
  const rest = omit(props, 'class');
  return (
    <textarea
      data-slot="textarea"
      class={cn(fieldBase, 'flex field-sizing-content min-h-16 px-3 py-2', props.class)}
      {...rest}
    />
  );
}

type LabelProps = Omit<ComponentProps<'label'>, 'class'> & { class?: string };

export function Label(props: LabelProps) {
  const rest = omit(props, 'class');
  return (
    <label
      data-slot="label"
      class={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        props.class,
      )}
      {...rest}
    />
  );
}

type SelectProps = Omit<ComponentProps<'select'>, 'class'> & { class?: string };

/** shadcn's NativeSelect: a styled <select> with a chevron. */
export function NativeSelect(props: SelectProps) {
  const rest = omit(props, 'class');
  return (
    <div class={cn('relative w-full', props.class)}>
      <select
        data-slot="native-select"
        class={cn(fieldBase, 'flex h-9 appearance-none py-1 pr-9 pl-3 dark:bg-input/30')}
        {...rest}
      />
      <Icon
        icon={ChevronDown}
        class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

export function Checkbox(props: Omit<InputProps, 'type'>) {
  const rest = omit(props, 'class');
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      class={cn(
        'peer size-4 shrink-0 rounded-[4px] border border-input accent-primary shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )}
      {...rest}
    />
  );
}

type SwitchProps = {
  id?: string;
  name?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  class?: string;
  onChange?: (checked: boolean) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
};

/**
 * shadcn/ui Switch (uncontrolled). With a `name`, it also submits "on"/""
 * through a hidden input so it participates in FormData like a checkbox.
 */
export function Switch(props: SwitchProps) {
  const [checked, setChecked] = createSignal(() => props.defaultChecked ?? false);
  const state = () => (checked() ? 'checked' : 'unchecked');

  return (
    <>
      <button
        type="button"
        role="switch"
        id={props.id}
        aria-checked={checked() ? 'true' : 'false'}
        aria-label={props['aria-label']}
        aria-describedby={props['aria-describedby']}
        disabled={props.disabled}
        data-slot="switch"
        data-state={state()}
        class={cn(
          'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
          props.class,
        )}
        onClick={() => {
          const next = !checked();
          setChecked(next);
          props.onChange?.(next);
        }}
      >
        <span
          data-state={state()}
          class="pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
        />
      </button>
      {props.name ? <input type="hidden" name={props.name} value={checked() ? 'on' : ''} /> : null}
    </>
  );
}
