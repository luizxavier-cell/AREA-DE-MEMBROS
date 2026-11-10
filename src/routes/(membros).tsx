import type { RouteDefinition } from '@solidjs/router';
import { Loading, type ParentProps } from 'solid-js';

import { PageSkeleton } from '../components/page-skeleton';
import { SiteHeader } from '../components/site-header';
import { getAnnouncements, getMember, getNextLive } from '../lib/api';

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
  return (
    <div class="flex min-h-svh flex-col">
      <SiteHeader />
      <main class="flex flex-1 flex-col pb-16">
        <Loading fallback={<PageSkeleton />}>{props.children}</Loading>
      </main>
    </div>
  );
}
