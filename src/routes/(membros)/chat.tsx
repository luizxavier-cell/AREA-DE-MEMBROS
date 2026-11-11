import { Title } from '@solidjs/meta';
import { useLocation, useNavigate, type RouteDefinition } from '@solidjs/router';
import { Show, createMemo } from 'solid-js';
import { ChevronLeft, MessageCircle } from 'lucide';

import { ChatComposer, ChatThread } from '../../components/chat';
import { Icon } from '../../components/ui/icon';
import { Avatar, Empty } from '../../components/ui/misc';
import { getChatMessages } from '../../lib/api';
import { platform } from '../../lib/config';
import { createKeyboardInset } from '../../lib/keyboard-inset';
import { paths } from '../../router';

export const route = {
  preload: () => void getChatMessages(),
} satisfies RouteDefinition;

/**
 * The member's 1:1 chat with the Creator. On phones it is a full-screen surface
 * like a native chat: the header stays put and the field rides on the keyboard.
 */
export default function ChatPage() {
  const messages = createMemo(() => getChatMessages());
  const { inset, keyboard } = createKeyboardInset();
  const location = useLocation<{ fromApp?: boolean }>();
  const navigate = useNavigate();
  const creator = platform.creator;

  // Opened from inside the platform, back returns to that page and its scroll.
  const goBack = (event: MouseEvent) => {
    if (!location.state?.fromApp) return;
    event.preventDefault();
    navigate(-1);
  };

  return (
    <>
      <Title>{`Chat com ${creator.name} · ${platform.name}`}</Title>

      <div
        data-keyboard={keyboard()}
        style={{ bottom: `${inset()}px` }}
        class="keyboard-glide fixed inset-x-0 top-0 z-50 flex flex-col bg-background md:static md:z-auto md:mx-auto md:h-svh md:w-full md:max-w-3xl"
      >
        <header class="flex items-center gap-1 border-b py-2 pr-4 pl-1 sm:px-6 md:gap-3 md:py-3">
          <a
            href={String(paths())}
            onClick={goBack}
            aria-label="Voltar para a plataforma"
            class="flex size-11 shrink-0 items-center justify-center rounded-full outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-[3px] focus-visible:ring-ring/50 active:bg-accent md:hidden"
          >
            <Icon icon={ChevronLeft} class="size-6" />
          </a>
          <Avatar name={creator.name} class="size-9" fallbackClass="bg-primary/15 text-primary" />
          <div class="ml-2 min-w-0 md:ml-0">
            <h1 class="truncate leading-tight font-semibold">{creator.name}</h1>
            <p class="truncate text-xs text-muted-foreground">{creator.role}</p>
          </div>
        </header>

        <Show
          when={messages().length > 0}
          fallback={
            <Empty
              class="m-4 sm:m-6"
              icon={<Icon icon={MessageCircle} />}
              title="Comece a conversa"
              description={`Envie sua primeira mensagem para ${creator.name}.`}
            />
          }
        >
          <ChatThread messages={messages()} creatorName={creator.name} />
        </Show>

        <ChatComposer creatorName={creator.name} />
      </div>
    </>
  );
}
