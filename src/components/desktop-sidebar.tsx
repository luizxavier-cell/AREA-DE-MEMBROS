import { For, Show, createMemo, createSignal, createUniqueId, onSettled } from 'solid-js';
import { Bell, GraduationCap, LogOut, Moon, Search, Sun, UserRound } from 'lucide';

import { getAnnouncements, getMember } from '../lib/api';
import { platform } from '../lib/config';
import { toggleTheme } from '../lib/theme';
import { paths } from '../router';
import { NoticesPanel, navLinks } from './site-header';
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

const row =
  'flex h-12 w-full items-center gap-4 rounded-lg px-3 text-left text-[0.9375rem] text-foreground/80 transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50';
const label = 'desktop-rail-label min-w-0 flex-1 truncate';
const icon = 'size-6';

/**
 * The members area's navigation on wider screens: open at the top of the page,
 * down to its icons once the page scrolls, and open again under the mouse.
 * Everything but the scroll is CSS, in the `desktop-rail` utility.
 */
export function DesktopSidebar() {
  const [scrolled, setScrolled] = createSignal(false);

  onSettled(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  });

  return (
    <aside
      data-docked={scrolled() ? undefined : ''}
      class="desktop-rail fixed inset-y-0 left-0 z-40 hidden flex-col bg-background px-3 py-4 md:flex"
    >
      <a
        href={String(paths())}
        class="flex h-12 items-center gap-3 rounded-lg px-2 font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Icon icon={GraduationCap} class="size-4.5" />
        </span>
        <span class={label}>{platform.name}</span>
      </a>

      <div class="my-auto flex flex-col gap-1">
        <nav aria-label="Principal" class="flex flex-col gap-1">
          <For each={navLinks().filter((link) => !link.phoneOnly)}>
            {(link) => (
              <a
                href={link.href}
                class={`${row} data-active:font-semibold data-active:text-foreground data-active:[&_svg]:stroke-[2.5]`}
              >
                <Icon icon={link.icon} class={icon} />
                <span class={label}>{link.label}</span>
              </a>
            )}
          </For>
        </nav>
        <SidebarSearch />
        <SidebarNotices />
        <button type="button" class={row} onClick={toggleTheme}>
          <Icon icon={Moon} class={`${icon} dark:hidden`} />
          <Icon icon={Sun} class={`${icon} hidden dark:block`} />
          <span class={`${label} dark:hidden`}>Tema escuro</span>
          <span class={`${label} hidden dark:inline`}>Tema claro</span>
        </button>
        <SidebarProfile />
      </div>
    </aside>
  );
}

/** Same search as the top bar's: submits to Meus cursos (?busca=). */
function SidebarSearch() {
  const id = createUniqueId();
  return (
    <form role="search" action={String(paths.cursos())} method="get">
      <label for={id} class={`${row} cursor-text`}>
        <Icon icon={Search} class={icon} />
        <span class="sr-only">Buscar cursos</span>
        <input
          id={id}
          name="busca"
          type="search"
          placeholder="Buscar"
          autocomplete="off"
          class="desktop-rail-label w-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-foreground/80 pointer-fine:text-[0.9375rem] [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
    </form>
  );
}

function SidebarNotices() {
  const id = createUniqueId();
  const announcements = createMemo(() => getAnnouncements());

  return (
    <>
      <button type="button" popovertarget={id} class={row}>
        <span class="relative shrink-0">
          <Icon icon={Bell} class={icon} />
          <Show when={announcements().some((item) => item.pinned)}>
            <span class="absolute top-0 right-0 size-2 rounded-full bg-highlight ring-2 ring-background" />
          </Show>
        </span>
        <span class={label}>Avisos</span>
      </button>
      <NoticesPanel id={id} class="top-1/2 left-62 -translate-y-1/2" />
    </>
  );
}

function SidebarProfile() {
  const member = createMemo(() => getMember());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Menu da conta" class={row}>
        <Avatar
          name={member().name}
          src={member().avatarUrl}
          class="size-6"
          fallbackClass="bg-primary/15 text-[0.625rem] text-primary"
        />
        <span class={label}>{member().name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" class="w-60">
        <DropdownMenuLabel class="grid font-normal">
          <span class="truncate font-medium">{member().name}</span>
          <span class="truncate text-xs text-muted-foreground">{member().plan}</span>
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
