import {
  createContext,
  createSignal,
  onFlush,
  onSettled,
  useContext,
  type Accessor,
  type ParentProps,
} from 'solid-js';
import { getRequestEvent, isServer, type JSX } from '@solidjs/web';
import { cva, type VariantProps } from 'class-variance-authority';
import { PanelLeft } from 'lucide';

import { cn } from '../../lib/utils';
import { Button } from './button';
import { Icon } from './icon';
import { Sheet } from './sheet';

// shadcn/ui Sidebar for Solid 2.0. Same anatomy and class names as the
// React original (variant "sidebar" | "floating" | "inset", collapsible
// "icon" | "offcanvas"), so shadcn blocks port over almost line by line.
//
// - Desktop (md+): fixed rail that collapses to icons. The choice is stored
//   in a cookie, which the server reads too, so the first paint is right.
// - Mobile: the same content inside a Sheet.
// - Ctrl/⌘ + B toggles it.

const COOKIE_NAME = 'sidebar_state';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const MOBILE_QUERY = '(max-width: 767px)';

type SidebarContextValue = {
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
  openMobile: Accessor<boolean>;
  setOpenMobile: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue>();

export function useSidebar() {
  return useContext(SidebarContext);
}

function readCookie(): boolean {
  const header = isServer
    ? (getRequestEvent()?.request.headers.get('cookie') ?? '')
    : document.cookie;
  const match = header.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=(true|false)`));
  return match ? match[1] === 'true' : true;
}

export function SidebarProvider(props: ParentProps<{ class?: string }>) {
  const [open, setOpenState] = createSignal(readCookie());
  const [openMobile, setOpenMobile] = createSignal(false);

  const setOpen = (value: boolean) => {
    setOpenState(value);
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  };

  const toggle = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) setOpenMobile(!openMobile());
    else setOpen(!open());
  };

  onSettled(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'b' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <SidebarContext value={{ open, setOpen, openMobile, setOpenMobile, toggle }}>
      <div
        data-slot="sidebar-wrapper"
        style={{
          '--sidebar-width': SIDEBAR_WIDTH,
          '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
        }}
        class={cn(
          'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
          props.class,
        )}
      >
        {props.children}
      </div>
    </SidebarContext>
  );
}

type SidebarProps = ParentProps<{
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'icon' | 'offcanvas';
  class?: string;
}>;

export function Sidebar(props: SidebarProps) {
  const sidebar = useSidebar();
  const variant = () => props.variant ?? 'sidebar';
  const padded = () => variant() === 'floating' || variant() === 'inset';

  // Close the mobile sheet as soon as a link inside it is followed.
  const onMobileClick = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest('a[href]')) {
      onFlush(() => sidebar.setOpenMobile(false));
    }
  };

  return (
    <>
      <Sheet
        open={sidebar.openMobile()}
        onOpenChange={sidebar.setOpenMobile}
        title="Menu"
        hideClose
        class="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground"
        style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE }}
      >
        <div
          data-sidebar="sidebar"
          data-mobile="true"
          class="flex h-full w-full flex-col"
          onClick={onMobileClick}
        >
          {props.children}
        </div>
      </Sheet>

      <div
        data-slot="sidebar"
        data-state={sidebar.open() ? 'expanded' : 'collapsed'}
        data-collapsible={sidebar.open() ? '' : (props.collapsible ?? 'offcanvas')}
        data-variant={variant()}
        data-side="left"
        class="group peer hidden text-sidebar-foreground md:block"
      >
        {/* Reserves the rail's width in the page flow. */}
        <div
          data-slot="sidebar-gap"
          class={cn(
            'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0',
            padded()
              ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
              : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
          )}
        />
        <div
          data-slot="sidebar-container"
          class={cn(
            'fixed inset-y-0 left-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] md:flex',
            padded()
              ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
              : 'border-r group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
            props.class,
          )}
        >
          <div
            data-sidebar="sidebar"
            data-slot="sidebar-inner"
            class="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
          >
            {props.children}
          </div>
        </div>
      </div>
    </>
  );
}

export function SidebarTrigger(props: { class?: string }) {
  const sidebar = useSidebar();
  return (
    <Button
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      class={cn('size-7', props.class)}
      onClick={() => sidebar.toggle()}
    >
      <Icon icon={PanelLeft} />
      <span class="sr-only">Alternar menu lateral</span>
    </Button>
  );
}

/** The thin grab strip on the rail's edge: click to collapse/expand. */
export function SidebarRail() {
  const sidebar = useSidebar();
  return (
    <button
      type="button"
      data-sidebar="rail"
      aria-label="Alternar menu lateral"
      tabindex={-1}
      title="Alternar menu lateral"
      onClick={() => sidebar.toggle()}
      class="absolute inset-y-0 -right-4 z-20 hidden w-4 -translate-x-1/2 cursor-w-resize transition-all ease-linear group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border in-data-[mobile=true]:hidden in-data-[state=collapsed]:cursor-e-resize sm:flex"
    />
  );
}

export function SidebarInset(props: ParentProps<{ class?: string }>) {
  return (
    <main
      data-slot="sidebar-inset"
      class={cn(
        'relative flex w-full min-w-0 flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        props.class,
      )}
    >
      {props.children}
    </main>
  );
}

function section(slot: string, base: string) {
  return (props: ParentProps<{ class?: string }>) => (
    <div data-slot={slot} data-sidebar={slot.replace('sidebar-', '')} class={cn(base, props.class)}>
      {props.children}
    </div>
  );
}

export const SidebarHeader = section('sidebar-header', 'flex flex-col gap-2 p-2');
export const SidebarFooter = section('sidebar-footer', 'flex flex-col gap-2 p-2');
export const SidebarContent = section(
  'sidebar-content',
  'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
);
export const SidebarGroup = section('sidebar-group', 'relative flex w-full min-w-0 flex-col p-2');
export const SidebarGroupContent = section('sidebar-group-content', 'w-full text-sm');
export const SidebarGroupLabel = section(
  'sidebar-group-label',
  'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 [&>svg]:size-4 [&>svg]:shrink-0',
);

export function SidebarSeparator(props: { class?: string }) {
  return (
    <div
      role="none"
      data-slot="sidebar-separator"
      class={cn('mx-2 h-px w-auto shrink-0 bg-sidebar-border', props.class)}
    />
  );
}

export function SidebarMenu(props: ParentProps<{ class?: string }>) {
  return (
    <ul data-slot="sidebar-menu" class={cn('flex w-full min-w-0 flex-col gap-1', props.class)}>
      {props.children}
    </ul>
  );
}

export function SidebarMenuItem(props: ParentProps<{ class?: string }>) {
  return (
    <li data-slot="sidebar-menu-item" class={cn('group/menu-item relative', props.class)}>
      {props.children}
    </li>
  );
}

// Active state comes from the router: it puts `data-active` on every <a>
// whose path is the current one or a parent of it, so the styles below key
// off that attribute instead of an `isActive` prop.
export const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: { size: 'default' },
  },
);

type MenuButtonProps = ParentProps<
  VariantProps<typeof sidebarMenuButtonVariants> & {
    href: string;
    /** Shown as a native tooltip while the rail is collapsed to icons. */
    tooltip?: string;
    class?: string;
  }
>;

export function SidebarMenuButton(props: MenuButtonProps) {
  const sidebar = useSidebar();
  return (
    <a
      href={props.href}
      title={sidebar.open() ? undefined : props.tooltip}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={props.size ?? 'default'}
      class={cn(sidebarMenuButtonVariants({ size: props.size }), props.class)}
    >
      {props.children}
    </a>
  );
}

export function SidebarMenuBadge(props: { class?: string; children: JSX.Element }) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      class={cn(
        'pointer-events-none absolute top-1.5 right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-active/menu-button:text-sidebar-accent-foreground',
        props.class,
      )}
    >
      {props.children}
    </div>
  );
}

export function SidebarMenuSub(props: ParentProps<{ class?: string }>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      class={cn(
        'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden',
        props.class,
      )}
    >
      {props.children}
    </ul>
  );
}

export function SidebarMenuSubItem(props: ParentProps<{ class?: string }>) {
  return (
    <li data-slot="sidebar-menu-sub-item" class={cn('group/menu-sub-item relative', props.class)}>
      {props.children}
    </li>
  );
}

export function SidebarMenuSubButton(props: ParentProps<{ href: string; class?: string }>) {
  return (
    <a
      href={props.href}
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      class={cn(
        'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        props.class,
      )}
    >
      {props.children}
    </a>
  );
}
