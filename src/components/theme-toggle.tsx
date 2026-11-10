import { Moon, Sun } from 'lucide';

import { toggleTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Icon } from './ui/icon';

/**
 * Light/dark switch. Until it is pressed the page follows the device; the
 * icon and label follow the `dark` class through CSS only.
 */
export function ThemeToggle(props: { class?: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      class={cn('size-9 rounded-full', props.class)}
      onClick={toggleTheme}
      title="Alternar tema claro/escuro"
    >
      <Icon icon={Moon} class="dark:hidden" />
      <Icon icon={Sun} class="hidden dark:block" />
      <span class="sr-only dark:hidden">Ativar tema escuro</span>
      <span class="sr-only hidden dark:inline">Ativar tema claro</span>
    </Button>
  );
}
