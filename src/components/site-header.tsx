import { For, Show, createMemo, createSignal, createUniqueId, onSettled } from 'solid-js';
import type { JSX } from '@solidjs/web';
import {
  Bell,
  BookOpen,
  CalendarPlus,
  CircleQuestionMark,
  GraduationCap,
  House,
  LogOut,
  MessageCircle,
  Pin,
  Search,
  UserRound,
} from 'lucide';

import { getAnnouncements, getMember, getNextLive } from '../lib/api';
import { googleCalendarUrl } from '../lib/calendar';
import { platform } from '../lib/config';
import type { Member } from '../lib/types';
import { cn, formatDate, formatDateTime } from '../lib/utils';
import { paths } from '../router';
import { ThemeToggle } from './theme-toggle';
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

/**
 * The main sections: the desktop sidebar's links and the phone's tabs. Chat is
 * a tab only; wider screens reach it through the ChatBubble.
 */
export const navLinks = () => [
  { label: 'Início', href: String(paths()), icon: House },
  { label: 'Meus cursos', href: String(paths.cursos()), icon: BookOpen },
  { label: 'Ajuda', href: String(paths.ajuda()), icon: CircleQuestionMark },
  { label: 'Chat', href: String(paths.chat()), icon: MessageCircle, phoneOnly: true },
];

const iconButton = cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9 rounded-full');

/**
 * Top bar of the members area on phones: brand, then search, notices, theme
 * and profile. It sits transparent over the page's billboard and turns solid
 * once the page scrolls. The links are in the MobileTabBar; on wider screens
 * all of this moves to the DesktopSidebar.
 */
export function SiteHeader() {
  const member = createMemo(() => getMember());
  const [scrolled, setScrolled] = createSignal(false);

  onSettled(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  });

  return (
    <header
      data-scrolled={scrolled() ? '' : undefined}
      class="sticky top-0 z-40 bg-linear-to-b md:hidden from-background/80 via-background/35 to-transparent transition-[background-color,box-shadow] duration-300 data-scrolled:bg-background/95 data-scrolled:shadow-sm data-scrolled:backdrop-blur supports-backdrop-filter:data-scrolled:bg-background/80"
    >
      <div class="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-12">
        <a
          href={String(paths())}
          class="mr-4 flex shrink-0 items-center gap-2.5 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon icon={GraduationCap} class="size-4.5" />
          </span>
          <span class="max-sm:sr-only">{platform.name}</span>
        </a>
        <div class="ml-auto flex items-center gap-1">
          <SearchBox />
          <Notices />
          <ThemeToggle />
          <UserMenu member={member()} />
        </div>
      </div>
    </header>
  );
}

/** A search icon that opens into a field; submits to Meus cursos (?busca=). */
function SearchBox() {
  return (
    <form role="search" action={String(paths.cursos())} method="get" class="relative">
      <label for="busca-global" class="sr-only">
        Buscar cursos
      </label>
      <Icon
        icon={Search}
        class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-foreground"
      />
      <input
        id="busca-global"
        name="busca"
        type="search"
        placeholder="Buscar cursos…"
        autocomplete="off"
        class="h-9 w-9 cursor-pointer rounded-full border border-transparent bg-transparent pr-3 pl-9 text-sm transition-[width,background-color,border-color] duration-300 outline-none placeholder:text-transparent hover:bg-accent focus:w-44 focus:cursor-text focus:border-input focus:bg-background focus:placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 not-placeholder-shown:w-44 not-placeholder-shown:border-input not-placeholder-shown:bg-background sm:focus:w-60 sm:not-placeholder-shown:w-60 [&::-webkit-search-cancel-button]:hidden"
      />
    </form>
  );
}

/**
 * Notices from the Creator and the next live session, in a native popover
 * (light dismiss and Escape for free) pinned under the bar's right edge.
 */
function Notices() {
  const id = createUniqueId();
  const announcements = createMemo(() => getAnnouncements());

  return (
    <>
      <button
        type="button"
        popovertarget={id}
        class={cn(iconButton, 'relative')}
        title="Avisos e próxima aula ao vivo"
      >
        <Icon icon={Bell} />
        <span class="sr-only">Avisos e próxima aula ao vivo</span>
        <Show when={announcements().some((item) => item.pinned)}>
          <span class="absolute top-2 right-2 size-2 rounded-full bg-highlight ring-2 ring-background" />
        </Show>
      </button>
      <NoticesPanel id={id} class="top-16 right-4 sm:right-6" />
    </>
  );
}

/** The notices and the next live session, in a native popover (see Notices). */
export function NoticesPanel(props: { id: string; class: string }) {
  const live = createMemo(() => getNextLive());
  const announcements = createMemo(() => getAnnouncements());

  return (
    <div
      id={props.id}
      popover
      class={cn(
        'fixed bottom-auto left-auto m-0 max-h-[calc(100svh-5rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border bg-popover p-0 text-popover-foreground shadow-lg',
        props.class,
      )}
    >
      <section class="border-b p-4" aria-labelledby={`${props.id}-live`}>
        <h2
          id={`${props.id}-live`}
          class="flex items-center gap-2 text-xs font-medium text-muted-foreground"
        >
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span class="relative inline-flex size-2 rounded-full bg-red-500" />
          </span>
          Próximo ao vivo
        </h2>
        <p class="mt-2 leading-snug font-medium">{live().title}</p>
        <p class="mt-1 text-xs text-muted-foreground first-letter:uppercase">
          {formatDateTime(live().startsAt)} · {live().durationMin} min
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
      </section>
      <section class="p-4" aria-labelledby={`${props.id}-avisos`}>
        <h2 id={`${props.id}-avisos`} class="text-xs font-medium text-muted-foreground">
          Avisos de {platform.creator.name.split(' ')[0]}
        </h2>
        <ul class="mt-3 space-y-4">
          <For each={announcements()}>
            {(item) => (
              <li class="space-y-1">
                <p class="flex items-start gap-1.5 text-sm leading-snug font-medium">
                  <Show when={item.pinned}>
                    <Icon icon={Pin} class="mt-0.5 size-3.5 shrink-0 text-highlight" />
                    <span class="sr-only">Fixado:</span>
                  </Show>
                  {item.title}
                </p>
                <p class="text-sm text-muted-foreground">{item.body}</p>
                <p class="text-xs text-muted-foreground">{formatDate(item.publishedAt)}</p>
              </li>
            )}
          </For>
        </ul>
      </section>
    </div>
  );
}

function UserMenu(props: { member: Member }) {
  return (
    <DropdownMenu class="ml-1">
      <DropdownMenuTrigger
        aria-label="Menu da conta"
        class="flex rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Avatar
          name={props.member.name}
          src={props.member.avatarUrl}
          class="size-8 rounded-md"
          fallbackClass="rounded-md bg-primary/15 text-primary"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-60">
        <DropdownMenuLabel class="grid font-normal">
          <span class="truncate font-medium">{props.member.name}</span>
          <span class="truncate text-xs text-muted-foreground">{props.member.plan}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem href={String(paths.conta())}>
          <Icon icon={UserRound} />
          Minha conta
        </DropdownMenuItem>
        <DropdownMenuItem href={String(paths.entrar())}>
          <Icon icon={LogOut} />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type PageHeaderProps = {
  title: string;
  description?: JSX.Element;
  actions?: JSX.Element;
};

/** Title block at the top of the members pages that have no billboard. */
export function PageHeader(props: PageHeaderProps) {
  return (
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-1.5">
        <h1 class="text-3xl font-semibold tracking-tight">{props.title}</h1>
        <Show when={props.description}>
          <p class="text-muted-foreground">{props.description}</p>
        </Show>
      </div>
      <Show when={props.actions}>
        <div class="flex shrink-0 flex-wrap gap-2">{props.actions}</div>
      </Show>
    </div>
  );
}
