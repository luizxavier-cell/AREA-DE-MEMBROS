import { MessageCircle } from 'lucide';

import { paths } from '../router';
import { Icon } from './ui/icon';

/** Link state saying the chat was opened from inside the platform, so back can go back. */
export const CHAT_LINK_STATE = JSON.stringify({ fromApp: true });

/** Floating shortcut to the chat on wider screens; phones have it as a tab. */
export function ChatBubble() {
  return (
    <a
      href={String(paths.chat())}
      state={CHAT_LINK_STATE}
      aria-label="Abrir chat"
      title="Chat"
      class="fixed right-6 bottom-6 z-40 hidden size-14 items-center justify-center rounded-full bg-brand text-primary-foreground drop-shadow-lg transition-[filter,scale] outline-none hover:brightness-95 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 md:flex md:data-active:hidden lg:right-12 dark:hover:brightness-110"
    >
      <Icon icon={MessageCircle} class="size-6" />
    </a>
  );
}
