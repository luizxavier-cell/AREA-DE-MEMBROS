import { createSignal, omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import { Eye, EyeOff } from 'lucide';

import { cn } from '../../lib/utils';
import { Input } from './form';
import { Icon } from './icon';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'class' | 'type'> & { class?: string };

/** Password field with a show/hide toggle. */
export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = createSignal(false);
  const rest = omit(props, 'class');

  return (
    <div class="relative">
      <Input type={visible() ? 'text' : 'password'} class={cn('pr-10', props.class)} {...rest} />
      <button
        type="button"
        class="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={visible() ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible() ? 'true' : 'false'}
        onClick={() => setVisible(!visible())}
      >
        <Icon icon={visible() ? EyeOff : Eye} />
      </button>
    </div>
  );
}
