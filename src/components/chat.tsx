import type { PreparedText } from '@chenglou/pretext';
import { For, Show, createEffect, createMemo, createSignal, onSettled } from 'solid-js';
import { ArrowUp } from 'lucide';

import { sendChatMessage } from '../lib/api';
import { chatRows } from '../lib/chat';
import { fieldLineCount, prepareText, shrinkWrap, type TextStyle } from '../lib/text-measure';
import type { ChatMessage } from '../lib/types';
import { cn, formatTime } from '../lib/utils';
import { Button } from './ui/button';
import { Textarea } from './ui/form';
import { Icon } from './ui/icon';

// Pretext's numbers are only right while these match the classes below. The
// whole font list counts: its fallbacks decide how wide an emoji is.
const FONT_FAMILY = '"Geist Variable", ui-sans-serif, system-ui, sans-serif';

const BUBBLE_TEXT: TextStyle = { font: `400 15px ${FONT_FAMILY}`, lineHeight: 22 };
const BUBBLE_PADDING_X = 28; // px-3.5, both sides
const BUBBLE_MAX_WIDTH = 480; // 30rem
const BUBBLE_MAX_SHARE = 0.8; // 80%

const FIELD_TEXT: TextStyle = { font: `400 16px ${FONT_FAMILY}`, lineHeight: 24 };
const FIELD_CHROME_Y = 22; // py-2.5 and the 1px border, both sides
const FIELD_MAX_LINES = 6;

/**
 * The conversation, in its own scroller. `flex-col-reverse` anchors it to the
 * newest message by itself, so it stays there as the keyboard or the field
 * takes room, with no scrolling from here.
 */
export function ChatThread(props: { messages: ChatMessage[]; creatorName: string }) {
  const [columnWidth, setColumnWidth] = createSignal(0);
  const rows = createMemo(() => chatRows(props.messages));
  let list: HTMLDivElement | undefined;
  let scroller: HTMLDivElement | undefined;

  const maxTextWidth = () =>
    Math.min(Math.floor(columnWidth() * BUBBLE_MAX_SHARE), BUBBLE_MAX_WIDTH) - BUBBLE_PADDING_X;

  onSettled(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setColumnWidth(Math.floor(entry.contentRect.width));
    });
    if (list) observer.observe(list);
    return () => observer.disconnect();
  });

  // A new message brings the conversation back to its end.
  createEffect(
    () => props.messages.length,
    () => {
      if (scroller) scroller.scrollTop = 0;
    },
  );

  return (
    <div
      ref={scroller}
      class="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto overscroll-contain px-4 sm:px-6"
    >
      <div
        ref={list}
        role="log"
        aria-label={`Conversa com ${props.creatorName}`}
        class="flex flex-col py-4"
      >
        <For each={rows()} keyed={(row) => row.message.id}>
          {(row) => (
            <>
              <Show when={row().day}>
                {(day) => (
                  <p class="my-4 text-center text-xs font-medium text-muted-foreground">{day()}</p>
                )}
              </Show>
              <MessageBubble
                message={row().message}
                creatorName={props.creatorName}
                startsGroup={row().startsGroup}
                endsGroup={row().endsGroup}
                maxTextWidth={maxTextWidth()}
              />
            </>
          )}
        </For>
      </div>
    </div>
  );
}

function MessageBubble(props: {
  message: ChatMessage;
  creatorName: string;
  startsGroup: boolean;
  endsGroup: boolean;
  maxTextWidth: number;
}) {
  const [prepared, setPrepared] = createSignal<PreparedText>();
  const mine = () => props.message.from === 'member';

  // Until Pretext runs (on the server, say) CSS sizes the bubble at its maximum.
  const size = createMemo(() => {
    const text = prepared();
    if (!text || props.maxTextWidth <= 0) return undefined;
    return shrinkWrap(text, props.maxTextWidth, BUBBLE_TEXT.lineHeight);
  });

  onSettled(() => {
    let active = true;
    void prepareText(props.message.text, BUBBLE_TEXT).then((text) => {
      if (active) setPrepared(text);
    });
    return () => {
      active = false;
    };
  });

  return (
    <div
      class={[
        'flex flex-col',
        mine() ? 'items-end' : 'items-start',
        props.startsGroup ? 'mt-3' : 'mt-0.5',
      ]}
    >
      <span class="sr-only">{mine() ? 'Você' : props.creatorName}:</span>
      <div
        class={[
          'max-w-[min(80%,30rem)] rounded-2xl px-3.5 py-2',
          mine() ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
          props.endsGroup && (mine() ? 'rounded-br-md' : 'rounded-bl-md'),
        ]}
      >
        <p
          style={
            size() ? { width: `${size()?.width}px`, height: `${size()?.height}px` } : undefined
          }
          class="text-[15px] leading-[22px] wrap-break-word whitespace-pre-wrap"
        >
          {props.message.text}
        </p>
      </div>
      <Show when={props.endsGroup}>
        <time
          datetime={props.message.sentAt}
          class="mt-1 px-1 text-[0.6875rem] text-muted-foreground"
        >
          {formatTime(props.message.sentAt)}
        </time>
      </Show>
    </div>
  );
}

/** The message field, at the foot of the surface; it grows with what is typed. */
export function ChatComposer(props: { creatorName: string }) {
  const [draft, setDraft] = createSignal('');
  const [contentWidth, setContentWidth] = createSignal(0);
  const [fontReady, setFontReady] = createSignal(false);
  let field: HTMLTextAreaElement | undefined;

  const lines = createMemo(() => {
    if (!fontReady() || contentWidth() <= 0) return 1;
    return Math.min(fieldLineCount(draft(), FIELD_TEXT, contentWidth()), FIELD_MAX_LINES);
  });

  onSettled(() => {
    let active = true;
    void document.fonts.load(FIELD_TEXT.font).then(() => {
      if (active) setFontReady(true);
    });
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setContentWidth(Math.floor(entry.contentRect.width));
    });
    if (field) observer.observe(field);
    return () => {
      active = false;
      observer.disconnect();
    };
  });

  const send = (event: SubmitEvent) => {
    event.preventDefault();
    const text = draft().trim();
    if (!text) return;
    setDraft('');
    void sendChatMessage(text);
  };

  // Enter sends on a keyboard; on a phone it is a line break and the button sends.
  const sendOnEnter = (event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <form onSubmit={send} class="flex items-end gap-2 bg-background px-3 pt-1 pb-2 sm:px-6 md:pb-6">
      <label for="mensagem" class="sr-only">
        Mensagem para {props.creatorName}
      </label>
      <Textarea
        id="mensagem"
        ref={field}
        rows={1}
        placeholder="Escreva uma mensagem…"
        value={draft()}
        onInput={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={sendOnEnter}
        style={{ height: `${lines() * FIELD_TEXT.lineHeight + FIELD_CHROME_Y}px` }}
        class={cn(
          'scrollbar-none min-h-0 flex-1 resize-none rounded-3xl px-4 py-2.5 text-base leading-6 field-sizing-fixed md:text-base',
          lines() < FIELD_MAX_LINES && 'overflow-hidden',
        )}
      />
      <Button
        type="submit"
        size="icon"
        aria-label="Enviar mensagem"
        disabled={!draft().trim()}
        onMouseDown={(event) => event.preventDefault()}
        class="size-11.5 shrink-0 rounded-full"
      >
        <Icon icon={ArrowUp} class="size-5" />
      </Button>
    </form>
  );
}
