import { For, Match, Switch } from 'solid-js';
import type { IconNode } from 'lucide';

import { cn } from '../../lib/utils';

// Lucide icons for Solid 2.0. The `lucide` package ships each icon as plain
// data ([tag, attrs][]), so it is framework-agnostic and tree-shakes per
// named import:
//
//   import { House } from 'lucide';
//   <Icon icon={House} class="size-5" />
//
// Lucide draws with these seven SVG shapes only; each node becomes the real
// SVG element, so icons render the same on the server and in the browser.

type Attrs = IconNode[number][1];

function Shape(props: { tag: string; attrs: Attrs }) {
  return (
    <Switch>
      <Match when={props.tag === 'path'}>
        <path {...props.attrs} />
      </Match>
      <Match when={props.tag === 'circle'}>
        <circle {...props.attrs} />
      </Match>
      <Match when={props.tag === 'rect'}>
        <rect {...props.attrs} />
      </Match>
      <Match when={props.tag === 'line'}>
        <line {...props.attrs} />
      </Match>
      <Match when={props.tag === 'polyline'}>
        <polyline {...props.attrs} />
      </Match>
      <Match when={props.tag === 'polygon'}>
        <polygon {...props.attrs} />
      </Match>
      <Match when={props.tag === 'ellipse'}>
        <ellipse {...props.attrs} />
      </Match>
    </Switch>
  );
}

export type IconProps = {
  icon: IconNode;
  class?: string;
  /** Accessible name; without one the icon is decorative (aria-hidden). */
  label?: string;
  strokeWidth?: number;
};

export function Icon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth ?? 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cn('size-4 shrink-0', props.class)}
      role={props.label ? 'img' : undefined}
      aria-label={props.label}
      aria-hidden={props.label ? undefined : 'true'}
    >
      <For each={props.icon}>{(node) => <Shape tag={node[0]} attrs={node[1]} />}</For>
    </svg>
  );
}
