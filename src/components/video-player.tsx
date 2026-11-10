import { Show } from 'solid-js';
import { FileText, Play } from 'lucide';

import type { Course, Lesson } from '../lib/types';
import { formatClock } from '../lib/utils';
import { courseIcons } from './course-cover';
import { Icon } from './ui/icon';

/**
 * The lesson's media area. With a `videoUrl` it embeds the host's player
 * (Vimeo, YouTube, Panda Video… — paste the provider's *embed* URL); without
 * one it shows a poster in the course colors, which is what the example data
 * renders.
 */
export function VideoPlayer(props: { course: Course; lesson: Lesson }) {
  return (
    <div class="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-sm ring-1 ring-border">
      <Show
        when={props.lesson.videoUrl}
        fallback={<Poster course={props.course} lesson={props.lesson} />}
      >
        {(src) => (
          <iframe
            src={src()}
            title={props.lesson.title}
            class="absolute inset-0 size-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowfullscreen
            loading="lazy"
          />
        )}
      </Show>
    </div>
  );
}

function Poster(props: { course: Course; lesson: Lesson }) {
  const isReading = () => props.lesson.kind === 'texto';
  return (
    <div
      class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white"
      style={{
        'background-image': `radial-gradient(120% 120% at 0% 0%, oklch(0.5 0.2 ${props.course.hue}) 0%, oklch(0.2 0.08 ${(props.course.hue + 40) % 360}) 70%)`,
      }}
    >
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.18)_1px,transparent_0)] bg-size-[22px_22px]" />
      <Icon
        icon={courseIcons[props.course.icon]}
        strokeWidth={1}
        class="absolute -right-6 -bottom-6 size-48 text-white/10"
      />
      <Show
        when={!isReading()}
        fallback={
          <span class="relative flex size-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur">
            <Icon icon={FileText} class="size-7" />
          </span>
        }
      >
        <span class="relative flex size-16 items-center justify-center rounded-full bg-white text-black shadow-lg sm:size-20">
          <Icon icon={Play} class="size-7 translate-x-0.5 fill-current sm:size-8" />
        </span>
      </Show>
      <div class="relative max-w-lg space-y-1">
        <p class="text-lg font-semibold text-balance sm:text-xl">{props.lesson.title}</p>
        <p class="text-sm text-white/70">
          {isReading()
            ? 'Aula em texto — leia o conteúdo abaixo'
            : `Vídeo · ${formatClock(props.lesson.durationSec)}`}
        </p>
      </div>
    </div>
  );
}
