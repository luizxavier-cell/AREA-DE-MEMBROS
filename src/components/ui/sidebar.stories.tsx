import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { For } from 'solid-js';
import { Award, BookOpen, CircleQuestionMark, GraduationCap, House } from 'lucide';

import { Breadcrumbs } from './breadcrumb';
import { Icon } from './icon';
import { Avatar, Separator } from './misc';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from './sidebar';

const nav = [
  { label: 'Início', icon: House },
  { label: 'Meus cursos', icon: BookOpen, badge: '7' },
  { label: 'Certificados', icon: Award },
  { label: 'Ajuda', icon: CircleQuestionMark },
];

const meta = {
  title: 'UI/Sidebar',
  component: Sidebar,
  subcomponents: {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
    SidebarMenuButton,
    SidebarMenuBadge,
  },
  args: { variant: 'inset', collapsible: 'icon' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['sidebar', 'floating', 'inset'] },
    collapsible: { control: 'inline-radio', options: ['icon', 'offcanvas'] },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The members-area shell. Toggle with the header button or Ctrl/⌘ + B;
 * below 768px the sidebar opens as a sheet.
 */
export const Shell: Story = {
  render: (args) => (
    <SidebarProvider>
      <Sidebar variant={args.variant} collapsible={args.collapsible}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" href="#" tooltip="Área de Membros">
                <span class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Icon icon={GraduationCap} />
                </span>
                <span class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">Área de Membros</span>
                  <span class="truncate text-xs text-muted-foreground">com Marina Duarte</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
            <SidebarMenu>
              <For each={nav}>
                {(item) => (
                  <SidebarMenuItem>
                    <SidebarMenuButton href="#" tooltip={item.label}>
                      <Icon icon={item.icon} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                  </SidebarMenuItem>
                )}
              </For>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" href="#" tooltip="Ana Beatriz Souza">
                <Avatar
                  name="Ana Beatriz Souza"
                  class="size-8 rounded-lg"
                  fallbackClass="rounded-lg"
                />
                <span class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">Ana Beatriz Souza</span>
                  <span class="truncate text-xs text-muted-foreground">ana.souza@email.com</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header class="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumbs items={[{ label: 'Início', href: '#' }, { label: 'Meus cursos' }]} />
        </header>
        <div class="grid flex-1 gap-4 p-6 md:grid-cols-3">
          <div class="aspect-video rounded-xl bg-muted/60" />
          <div class="aspect-video rounded-xl bg-muted/60" />
          <div class="aspect-video rounded-xl bg-muted/60" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};
