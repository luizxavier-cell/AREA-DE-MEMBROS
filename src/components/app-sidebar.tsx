import { For, Show, createMemo } from 'solid-js';
import {
  Award,
  BookOpen,
  CalendarPlus,
  ChevronsUpDown,
  CircleQuestionMark,
  GraduationCap,
  House,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from 'lucide';

import { getCourses, getMember, getNextLive, getProgress } from '../lib/api';
import { platform } from '../lib/config';
import { googleCalendarUrl } from '../lib/calendar';
import { courseStats } from '../lib/progress';
import { toggleTheme } from '../lib/theme';
import type { Member } from '../lib/types';
import { cn, formatDateTime } from '../lib/utils';
import { paths } from '../router';
import { courseColor } from './course-cover';
import { buttonVariants } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Icon } from './ui/icon';
import { Avatar } from './ui/misc';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  sidebarMenuButtonVariants,
} from './ui/sidebar';

/** The members-area navigation (shadcn sidebar-07, "inset" variant). */
export function AppSidebar() {
  const mainNav = [
    { label: 'Início', href: String(paths()), icon: House },
    { label: 'Meus cursos', href: String(paths.cursos()), icon: BookOpen },
    { label: 'Certificados', href: String(paths.certificados()), icon: Award },
    { label: 'Ajuda', href: String(paths.ajuda()), icon: CircleQuestionMark },
  ];
  const courses = createMemo(() => getCourses());
  const progress = createMemo(() => getProgress());
  const member = createMemo(() => getMember());
  const live = createMemo(() => getNextLive());

  const studying = createMemo(() =>
    courses()
      .filter((course) => course.access === 'liberado')
      .map((course) => ({ course, stats: courseStats(course, progress()) }))
      .filter((entry) => entry.stats.status === 'em-andamento'),
  );

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              href={String(paths())}
              tooltip={platform.name}
              class="data-active:bg-transparent data-active:font-normal hover:data-active:bg-sidebar-accent"
            >
              <span class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Icon icon={GraduationCap} class="size-4.5" />
              </span>
              <span class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{platform.name}</span>
                <span class="truncate text-xs text-muted-foreground">
                  com {platform.creator.name}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarMenu>
            <For each={mainNav}>
              {(item) => (
                <SidebarMenuItem>
                  <SidebarMenuButton href={item.href} tooltip={item.label}>
                    <Icon icon={item.icon} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </For>
          </SidebarMenu>
        </SidebarGroup>

        <Show when={studying().length > 0}>
          <SidebarGroup class="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Continuar estudando</SidebarGroupLabel>
            <SidebarMenu>
              <For each={studying()} keyed={(entry) => entry.course.id}>
                {(entry) => (
                  <SidebarMenuItem>
                    <SidebarMenuButton href={String(paths.cursos(entry().course.id))} class="pr-10">
                      <span
                        class="size-2 shrink-0 rounded-full"
                        style={{ background: courseColor(entry().course.hue) }}
                      />
                      <span>{entry().course.title}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{entry().stats.percent}%</SidebarMenuBadge>
                  </SidebarMenuItem>
                )}
              </For>
            </SidebarMenu>
          </SidebarGroup>
        </Show>

        <SidebarGroup class="mt-auto group-data-[collapsible=icon]:hidden">
          <div class="rounded-lg border border-sidebar-border bg-background/60 p-3 text-sm shadow-xs dark:bg-sidebar-accent/40">
            <p class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span class="relative flex size-2">
                <span class="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span class="relative inline-flex size-2 rounded-full bg-red-500" />
              </span>
              Próximo ao vivo
            </p>
            <p class="mt-2 leading-snug font-medium">{live().title}</p>
            <p class="mt-1 text-xs text-muted-foreground first-letter:uppercase">
              {formatDateTime(live().startsAt)}
            </p>
            <a
              href={googleCalendarUrl(live())}
              target="_blank"
              rel="noopener noreferrer"
              class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-3 w-full')}
            >
              <Icon icon={CalendarPlus} />
              Adicionar à agenda
            </a>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser member={member()} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavUser(props: { member: Member }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Menu da conta"
            class={cn(
              sidebarMenuButtonVariants({ size: 'lg' }),
              'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
            )}
          >
            <Avatar
              name={props.member.name}
              src={props.member.avatarUrl}
              class="size-8 rounded-lg"
              fallbackClass="rounded-lg bg-sidebar-primary/15 text-sidebar-primary"
            />
            <span class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{props.member.name}</span>
              <span class="truncate text-xs text-muted-foreground">{props.member.email}</span>
            </span>
            <Icon icon={ChevronsUpDown} class="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" class="w-60">
            <DropdownMenuLabel class="flex items-center gap-2 font-normal">
              <Avatar
                name={props.member.name}
                src={props.member.avatarUrl}
                class="size-8 rounded-lg"
                fallbackClass="rounded-lg"
              />
              <span class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">{props.member.name}</span>
                <span class="truncate text-xs text-muted-foreground">{props.member.plan}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem href={String(paths.conta())}>
              <Icon icon={UserRound} />
              Minha conta
            </DropdownMenuItem>
            <DropdownMenuItem href={String(paths.certificados())}>
              <Icon icon={Award} />
              Certificados
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={toggleTheme}>
              <Icon icon={Moon} class="dark:hidden" />
              <Icon icon={Sun} class="hidden dark:block" />
              <span class="dark:hidden">Tema escuro</span>
              <span class="hidden dark:inline">Tema claro</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem href={String(paths.entrar())}>
              <Icon icon={LogOut} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
