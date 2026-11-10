import { Moon, Sun } from 'lucide';

import { toggleTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Icon } from './ui/icon';

/** Light/dark switch. The icon follows the `dark` class through CSS only. */
export function ThemeToggle(props: { class?: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      class={cn('size-8', props.class)}
      onClick={toggleTheme}
      title="Alternar tema"
    >
      <Icon icon={Sun} class="dark:hidden" />
      <Icon icon={Moon} class="hidden dark:block" />
      <span class="sr-only">Alternar tema claro/escuro</span>
    </Button>
  );
}
