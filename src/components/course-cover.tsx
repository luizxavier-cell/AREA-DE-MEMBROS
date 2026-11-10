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

const coverGradient = (hue: number) =>
  `linear-gradient(135deg, oklch(0.6 0.1 ${hue}) 0%, oklch(0.3 0.06 ${(hue + 10) % 360}) 100%)`;

/**
 * Artwork for the n-th module or lesson of a course: the course hue, wobbling
 * a few degrees and in lightness per item, so a rail of posters reads as one
 * family, not clones, and never drifts out of the course's color.
 */
export const posterGradient = (hue: number, index: number) => {
  const h = (hue + ((index % 3) - 1) * 8 + 360) % 360;
  const light = 0.5 + ((index * 7) % 4) * 0.035;
  return `linear-gradient(160deg, oklch(${light} 0.1 ${h}) 0%, oklch(0.26 0.055 ${(h + 10) % 360}) 100%)`;
};

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
 * or the uploaded image when the course has a `coverUrl`. The chroma stays
 * low, so any hue the Creator picks sits in the dusty-blue palette.
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

/**
 * Full-bleed art behind a billboard (home and course page): the cover image,
 * or the generated gradient with a large icon, faded into the page so the
 * copy on top sits on the page background in both themes.
 */
export function CourseBackdrop(props: {
  course: Pick<Course, 'hue' | 'icon' | 'coverUrl'>;
  class?: string;
}) {
  return (
    <div aria-hidden="true" class={cn('pointer-events-none absolute inset-0 -z-10', props.class)}>
      <div
        class="billboard-fade absolute inset-x-0 top-0 h-72 overflow-hidden md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[72%]"
        style={{ 'background-image': coverGradient(props.course.hue) }}
      >
        <Show
          when={props.course.coverUrl}
          fallback={
            <>
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.28)_1px,transparent_0)] bg-size-[22px_22px]" />
              <Icon
                icon={courseIcons[props.course.icon]}
                strokeWidth={1}
                class="absolute top-[38%] right-[8%] size-40 -translate-y-1/2 text-white/25 md:top-1/2 md:right-[14%] md:size-72"
              />
            </>
          }
        >
          {(src) => <img src={src()} alt="" class="size-full object-cover" />}
        </Show>
      </div>
    </div>
  );
}
