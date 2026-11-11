import { useLocation, type RouteDefinition } from '@solidjs/router';
import { Loading, type ParentProps } from 'solid-js';

import { ChatBubble } from '../components/chat-bubble';
import { MobileTabBar } from '../components/mobile-tab-bar';
import { PageSkeleton } from '../components/page-skeleton';
import { SiteHeader } from '../components/site-header';
import { getAnnouncements, getMember, getNextLive } from '../lib/api';
import { paths } from '../router';

// Pathless layout for every page of the members area: the (membros) group
// puts them under the top bar. The lesson player lives in (aula) with a
// layout of its own; sign-in pages sit outside both.
export const route = {
  preload: () => {
    void getMember();
    void getAnnouncements();
    void getNextLive();
  },
} satisfies RouteDefinition;

export default function MembersLayout(props: ParentProps) {
  const location = useLocation();
  // On phones the chat is a screen of its own, with no platform chrome around it.
  const inChat = () => location.pathname === String(paths.chat());

  return (
    // One pixel taller than Safari's largest viewport, so a short page can
    // still hold the tab bar's scroll position with the toolbar collapsed.
    <div class="flex min-h-[calc(100lvh+1px)] flex-col md:min-h-svh">
      <div class={['contents', { 'max-md:hidden': inChat() }]}>
        <SiteHeader />
      </div>
      <main
        class={[
          'flex flex-1 flex-col',
          { 'pb-[calc(env(safe-area-inset-bottom)+7rem)] md:pb-24': !inChat() },
        ]}
      >
        <Loading fallback={<PageSkeleton />}>{props.children}</Loading>
      </main>
      <div class={['contents', { hidden: inChat() }]}>
        <MobileTabBar />
      </div>
      <ChatBubble />
    </div>
  );
}
