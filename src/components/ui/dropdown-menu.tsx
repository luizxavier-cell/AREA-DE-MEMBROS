import {
  Show,
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  onFlush,
  onSettled,
  useContext,
  type Accessor,
  type ParentProps,
} from 'solid-js';

import { cn } from '../../lib/utils';

// shadcn/ui DropdownMenu, dependency-free: a trigger button and a menu
// positioned against it. Closes on outside press, Escape, Tab and on
// selecting an item; arrow keys, Home and End move between items.

type MenuContextValue = {
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
  triggerId: string;
  menuId: string;
  focusTrigger: () => void;
  registerTrigger: (el: HTMLButtonElement) => void;
};

const MenuContext = createContext<MenuContextValue>();

export function DropdownMenu(props: ParentProps<{ class?: string }>) {
  const [open, setOpen] = createSignal(false);
  const id = createUniqueId();
  let root!: HTMLDivElement;
  let trigger: HTMLButtonElement | undefined;

  createEffect(open, (isOpen) => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  });

  const context: MenuContextValue = {
    open,
    setOpen,
    triggerId: `${id}-trigger`,
    menuId: `${id}-menu`,
    focusTrigger: () => trigger?.focus(),
    registerTrigger: (el) => {
      trigger = el;
    },
  };

  return (
    <MenuContext value={context}>
      <div ref={root} data-slot="dropdown-menu" class={cn('relative', props.class)}>
        {props.children}
      </div>
    </MenuContext>
  );
}

export function DropdownMenuTrigger(props: ParentProps<{ class?: string; 'aria-label'?: string }>) {
  const menu = useContext(MenuContext);
  return (
    <button
      ref={menu.registerTrigger}
      type="button"
      id={menu.triggerId}
      aria-haspopup="menu"
      aria-expanded={menu.open() ? 'true' : 'false'}
      aria-controls={menu.open() ? menu.menuId : undefined}
      aria-label={props['aria-label']}
      data-slot="dropdown-menu-trigger"
      data-state={menu.open() ? 'open' : 'closed'}
      class={props.class}
      onClick={() => menu.setOpen(!menu.open())}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          menu.setOpen(true);
        }
      }}
    >
      {props.children}
    </button>
  );
}

const sideClasses = {
  bottom: 'top-full mt-2',
  top: 'bottom-full mb-2',
  right: 'left-full ml-2',
} as const;

const alignClasses = {
  bottom: { start: 'left-0', end: 'right-0' },
  top: { start: 'left-0', end: 'right-0' },
  right: { start: 'top-0', end: 'bottom-0' },
} as const;

type ContentProps = ParentProps<{
  class?: string;
  side?: keyof typeof sideClasses;
  align?: 'start' | 'end';
}>;

export function DropdownMenuContent(props: ContentProps) {
  const menu = useContext(MenuContext);
  const side = () => props.side ?? 'bottom';

  return (
    <Show when={menu.open()}>
      <MenuSurface
        menu={menu}
        class={cn(sideClasses[side()], alignClasses[side()][props.align ?? 'start'], props.class)}
      >
        {props.children}
      </MenuSurface>
    </Show>
  );
}

function MenuSurface(props: ParentProps<{ menu: MenuContextValue; class: string }>) {
  let el!: HTMLDivElement;
  const items = () => Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]'));

  // Move focus into the menu once it is on screen.
  onSettled(() => {
    items()[0]?.focus();
  });

  const onKeyDown = (event: KeyboardEvent) => {
    const list = items();
    const current = list.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        list[(current + 1) % list.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        list[(current - 1 + list.length) % list.length]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        list[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        list[list.length - 1]?.focus();
        break;
      case 'Escape':
        event.preventDefault();
        props.menu.setOpen(false);
        props.menu.focusTrigger();
        break;
      case 'Tab':
        props.menu.setOpen(false);
        break;
    }
  };

  return (
    <div
      ref={el}
      role="menu"
      id={props.menu.menuId}
      aria-labelledby={props.menu.triggerId}
      data-slot="dropdown-menu-content"
      class={cn(
        'absolute z-50 min-w-[8rem] animate-in overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md fade-in-0 zoom-in-95',
        props.class,
      )}
      onKeyDown={onKeyDown}
    >
      {props.children}
    </div>
  );
}

type ItemProps = ParentProps<{
  class?: string;
  href?: string;
  variant?: 'default' | 'destructive';
  onSelect?: () => void;
}>;

const itemClass =
  "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

/** A menu item: a link when `href` is set, a button otherwise. */
export function DropdownMenuItem(props: ItemProps) {
  const menu = useContext(MenuContext);
  const select = () => {
    // Close right away, even when the item starts a navigation that holds
    // the next frame until the new page is ready.
    onFlush(() => menu.setOpen(false));
    props.onSelect?.();
  };

  return (
    <Show
      when={props.href}
      fallback={
        <button
          type="button"
          role="menuitem"
          tabindex={-1}
          data-slot="dropdown-menu-item"
          data-variant={props.variant ?? 'default'}
          class={cn(itemClass, props.class)}
          onClick={select}
        >
          {props.children}
        </button>
      }
    >
      {(href) => (
        <a
          href={href()}
          role="menuitem"
          tabindex={-1}
          data-slot="dropdown-menu-item"
          data-variant={props.variant ?? 'default'}
          class={cn(itemClass, props.class)}
          onClick={select}
        >
          {props.children}
        </a>
      )}
    </Show>
  );
}

export function DropdownMenuLabel(props: ParentProps<{ class?: string }>) {
  return (
    <div data-slot="dropdown-menu-label" class={cn('px-2 py-1.5 text-sm font-medium', props.class)}>
      {props.children}
    </div>
  );
}

export function DropdownMenuSeparator(props: { class?: string }) {
  return (
    <div
      role="separator"
      data-slot="dropdown-menu-separator"
      class={cn('-mx-1 my-1 h-px bg-border', props.class)}
    />
  );
}
