import {
  createContext,
  createSignal,
  createUniqueId,
  useContext,
  type Accessor,
  type ParentProps,
} from 'solid-js';

import { cn } from '../../lib/utils';

// shadcn/ui Tabs. Uncontrolled with `defaultValue`, or controlled with
// `value` + `onValueChange`. Inactive panels stay mounted (hidden), so form
// fields keep what was typed when the member switches tabs.

type TabsContextValue = {
  value: Accessor<string>;
  select: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue>();

type TabsProps = ParentProps<{
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  class?: string;
}>;

export function Tabs(props: TabsProps) {
  const [value, setValue] = createSignal(() => props.value ?? props.defaultValue ?? '');
  const baseId = createUniqueId();
  const context: TabsContextValue = {
    value,
    baseId,
    select: (next) => {
      setValue(next);
      props.onValueChange?.(next);
    },
  };

  return (
    <TabsContext value={context}>
      <div data-slot="tabs" class={cn('flex flex-col gap-2', props.class)}>
        {props.children}
      </div>
    </TabsContext>
  );
}

export function TabsList(props: ParentProps<{ class?: string; 'aria-label'?: string }>) {
  // Roving focus: arrow keys move between tabs and activate them.
  const onKeyDown = (event: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    );
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === 'ArrowLeft') next = current <= 0 ? tabs.length - 1 : current - 1;
    if (event.key === 'ArrowRight') next = current >= tabs.length - 1 ? 0 : current + 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    event.preventDefault();
    tabs[next]?.focus();
    tabs[next]?.click();
  };

  return (
    <div
      role="tablist"
      aria-label={props['aria-label']}
      data-slot="tabs-list"
      class={cn(
        'inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground',
        props.class,
      )}
      onKeyDown={onKeyDown}
    >
      {props.children}
    </div>
  );
}

export function TabsTrigger(
  props: ParentProps<{ value: string; class?: string; disabled?: boolean }>,
) {
  const tabs = useContext(TabsContext);
  const active = () => tabs.value() === props.value;

  return (
    <button
      type="button"
      role="tab"
      id={`${tabs.baseId}-tab-${props.value}`}
      aria-controls={`${tabs.baseId}-panel-${props.value}`}
      aria-selected={active() ? 'true' : 'false'}
      tabindex={active() ? 0 : -1}
      disabled={props.disabled}
      data-slot="tabs-trigger"
      data-state={active() ? 'active' : 'inactive'}
      class={cn(
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
      onClick={() => tabs.select(props.value)}
    >
      {props.children}
    </button>
  );
}

export function TabsContent(props: ParentProps<{ value: string; class?: string }>) {
  const tabs = useContext(TabsContext);
  const active = () => tabs.value() === props.value;

  return (
    <div
      role="tabpanel"
      id={`${tabs.baseId}-panel-${props.value}`}
      aria-labelledby={`${tabs.baseId}-tab-${props.value}`}
      hidden={!active()}
      tabindex={0}
      data-slot="tabs-content"
      data-state={active() ? 'active' : 'inactive'}
      class={cn('flex-1 outline-none', props.class)}
    >
      {props.children}
    </div>
  );
}
