import { Show } from 'solid-js';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Clapperboard,
  FingerprintPattern,
  Gift,
  Lock,
  Radio,
  Rocket,
  Sparkles,
  type IconNode,
} from 'lucide';

import type { Course, CourseIcon } from '../lib/types';
import { cn } from '../lib/utils';
import { Icon } from './ui/icon';

export const courseIcons: Record<CourseIcon, IconNode> = {
  sparkles: Sparkles,
  rocket: Rocket,
  clapperboard: Clapperboard,
  fingerprint: FingerprintPattern,
  radio: Radio,
  gift: Gift,
  'badge-check': BadgeCheck,
  briefcase: BriefcaseBusiness,
  camera: Camera,
};

/** The course's signature color, for dots and accents. */
export const courseColor = (hue: number) => `oklch(0.62 0.19 ${hue})`;

const coverGradient = (hue: number) =>
  `linear-gradient(135deg, oklch(0.62 0.2 ${hue}) 0%, oklch(0.36 0.15 ${(hue + 40) % 360}) 100%)`;

type CourseCoverProps = {
  course: Pick<Course, 'category' | 'hue' | 'icon' | 'coverUrl'>;
  class?: string;
  /** Darkens the cover and shows a lock (courses outside the plan). */
  locked?: boolean;
  /** Only the icon, centered — for covers that sit beside large titles. */
  compact?: boolean;
};

/**
 * Generated course artwork — a gradient in the course's hue with its icon —
 * or the uploaded image when the course has a `coverUrl`.
 */
export function CourseCover(props: CourseCoverProps) {
  return (
    <div
      class={cn('relative isolate overflow-hidden bg-muted', props.class)}
      style={{ 'background-image': coverGradient(props.course.hue) }}
    >
      <Show
        when={props.course.coverUrl}
        fallback={
          <>
            <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.3)_1px,transparent_0)] bg-size-[18px_18px] mask-[linear-gradient(to_bottom_left,black,transparent_70%)]" />
            <div class="absolute -right-10 -bottom-10 -z-10 size-44 rounded-full bg-white/10" />
            <div class="absolute -right-2 -bottom-2 -z-10 size-24 rounded-full bg-white/10" />
            <Icon
              icon={courseIcons[props.course.icon]}
              strokeWidth={1.5}
              class={cn(
                'absolute text-white/85 drop-shadow-sm',
                props.compact
                  ? 'top-1/2 left-1/2 size-14 -translate-1/2'
                  : 'right-5 bottom-5 size-11',
              )}
            />
            <Show when={!props.compact}>
              <span class="absolute top-4 left-5 text-[0.6875rem] font-medium tracking-widest text-white/80 uppercase">
                {props.course.category}
              </span>
            </Show>
          </>
        }
      >
        {(src) => <img src={src()} alt="" class="absolute inset-0 -z-10 size-full object-cover" />}
      </Show>

      <Show when={props.locked}>
        <div class="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-grayscale-[60%]">
          <span class="flex size-11 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/25">
            <Icon icon={Lock} class="size-5" />
          </span>
        </div>
      </Show>
    </div>
  );
}
