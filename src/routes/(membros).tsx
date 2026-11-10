import type { RouteDefinition } from '@solidjs/router';
import { Loading, type ParentProps } from 'solid-js';

import { AppSidebar } from '../components/app-sidebar';
import { PageSkeleton } from '../components/page-skeleton';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { getCourses, getMember, getNextLive, getProgress } from '../lib/api';

// Pathless layout for every page of the members area: the (membros) group
// wraps them in the sidebar shell. The lesson player lives in (aula) with a
// layout of its own; sign-in pages sit outside both.
export const route = {
  preload: () => {
    void getMember();
    void getCourses();
    void getProgress();
    void getNextLive();
  },
} satisfies RouteDefinition;

export default function MembersLayout(props: ParentProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Loading fallback={<PageSkeleton />}>{props.children}</Loading>
      </SidebarInset>
    </SidebarProvider>
  );
}
