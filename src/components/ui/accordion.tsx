import type { ParentProps } from 'solid-js';
import { ChevronDown } from 'lucide';

import { cn } from '../../lib/utils';
import { Icon } from './icon';

// shadcn/ui Accordion on native <details>/<summary>: keyboard support and
// open/close work without JavaScript (and before hydration). Give every
// item of a group the same `name` for single-open ("type=single") behavior.

export function Accordion(props: ParentProps<{ class?: string }>) {
  return (
    <div data-slot="accordion" class={props.class}>
      {props.children}
    </div>
  );
}

export function AccordionItem(
  props: ParentProps<{ class?: string; open?: boolean; name?: string }>,
) {
  return (
    <details
      data-slot="accordion-item"
      name={props.name}
      open={props.open}
      class={cn('group/accordion border-b last:border-b-0', props.class)}
    >
      {props.children}
    </details>
  );
}

export function AccordionTrigger(props: ParentProps<{ class?: string }>) {
  return (
    <summary
      data-slot="accordion-trigger"
      class={cn(
        'flex flex-1 cursor-pointer list-none items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        props.class,
      )}
    >
      {props.children}
      <Icon
        icon={ChevronDown}
        class="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 group-open/accordion:rotate-180"
      />
    </summary>
  );
}

export function AccordionContent(props: ParentProps<{ class?: string }>) {
  return (
    <div data-slot="accordion-content" class={cn('pt-0 pb-4 text-sm', props.class)}>
      {props.children}
    </div>
  );
}
