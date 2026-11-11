import { useLinkState, useLocation } from '@solidjs/router';
import { For, createEffect, createMemo, createSignal, onSettled } from 'solid-js';

import { CHAT_LINK_STATE } from './chat-bubble';
import { navLinks } from './site-header';
import { Icon } from './ui/icon';

/** Scroll distance that counts as a change of direction. */
const SCROLL_STEP = 6;
/** Scrolling down shrinks the bar only past this point. */
const TOP_ZONE = 48;
/** How long after a field lets go the page may still be moving back. */
const KEYBOARD_SETTLE_MS = 300;

const isTyping = () => document.activeElement?.matches('input, textarea') ?? false;

/**
 * The phone's main navigation: a floating Liquid Glass tab bar. Scrolling
 * down shrinks it to just the icons, with every tab still in reach, and
 * scrolling up brings the labels back. Switching tabs keeps its size.
 */
export function MobileTabBar() {
  const location = useLocation();
  const tabs = navLinks().map((link) => ({ ...link, state: useLinkState(() => link.href) }));
  const [compact, setCompact] = createSignal(false);
  let holdSafariBars = false;

  // The tab being opened counts as selected right away, before its page loads.
  const selected = createMemo(() => {
    const opening = tabs.findIndex((tab) => tab.state.pending());
    return opening >= 0 ? opening : tabs.findIndex((tab) => tab.state.active());
  });

  // At exactly 0 Safari pops its toolbar back in one frame, which throws this
  // bar 82px up. One pixel short of the top the toolbar stays collapsed.
  createEffect(
    () => location.pathname,
    () => {
      if (!holdSafariBars) return;
      holdSafariBars = false;
      window.scrollTo(0, 1);
    },
  );

  onSettled(() => {
    let last = Math.max(window.scrollY, 0);
    let path = window.location.pathname;
    let settlesAt = 0;
    const onFocusOut = () => {
      settlesAt = performance.now() + KEYBOARD_SETTLE_MS;
    };
    const update = () => {
      // Clamped so Safari's rubber-band bounce doesn't read as a direction.
      const end = document.documentElement.scrollHeight - window.innerHeight;
      const y = Math.min(Math.max(window.scrollY, 0), Math.max(end, 0));
      const navigated = window.location.pathname !== path;
      path = window.location.pathname;
      if (isTyping() || performance.now() < settlesAt) {
        // The keyboard moved the page, not the member: the bar keeps its size.
      } else if (y === 0) {
        setCompact(false);
      } else if (navigated) {
        // A new page moved the scroll, not the member: keep the bar as it is.
      } else if (Math.abs(y - last) < SCROLL_STEP) {
        return;
      } else if (y < last) {
        setCompact(false);
      } else if (y > TOP_ZONE) {
        setCompact(true);
      }
      last = y;
    };
    window.addEventListener('scroll', update, { passive: true });
    document.addEventListener('focusout', onFocusOut);
    return () => {
      window.removeEventListener('scroll', update);
      document.removeEventListener('focusout', onFocusOut);
    };
  });

  return (
    <nav
      aria-label="Principal"
      data-compact={compact() ? '' : undefined}
      class="group pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 flex justify-center md:hidden"
    >
      <div class="liquid-glass pointer-events-auto h-16 w-[min(22rem,calc(100vw-2rem))] rounded-full p-1 transition-[width,height] duration-400 ease-[cubic-bezier(0.3,1.3,0.5,1)] group-data-compact:h-12 group-data-compact:w-56 motion-reduce:transition-none">
        <div class="relative h-full">
          <span
            aria-hidden="true"
            style={{ translate: `${Math.max(selected(), 0) * 100}% 0` }}
            class={[
              'absolute inset-y-0 left-0 w-1/4 rounded-full bg-(--glass-pill) transition-[translate,opacity] duration-350 ease-[cubic-bezier(0.3,1.25,0.5,1)] will-change-[translate] motion-reduce:transition-none',
              { 'opacity-0': selected() < 0 },
            ]}
          />
          <ul class="relative grid h-full grid-cols-4">
            <For each={tabs}>
              {(tab, index) => (
                <li>
                  <a
                    href={tab.href}
                    state={tab.phoneOnly ? CHAT_LINK_STATE : undefined}
                    noscroll={compact() && !tab.state.current() ? '' : undefined}
                    data-selected={selected() === index() ? '' : undefined}
                    onClick={() => {
                      holdSafariBars = compact() && !tab.state.current();
                    }}
                    class="flex h-full flex-col items-center justify-center rounded-full text-foreground/80 transition-colors outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-[3px] focus-visible:ring-ring/50 data-selected:text-(--glass-active)"
                  >
                    <Icon icon={tab.icon} class="size-5.5" />
                    <span class="mt-1 max-h-4 overflow-hidden text-[0.6875rem] leading-4 font-medium whitespace-nowrap transition-[max-height,margin,opacity] duration-300 group-data-compact:mt-0 group-data-compact:max-h-0 group-data-compact:opacity-0 motion-reduce:transition-none">
                      {tab.label}
                    </span>
                  </a>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>
    </nav>
  );
}
