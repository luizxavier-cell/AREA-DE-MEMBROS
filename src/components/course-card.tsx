import { Show } from 'solid-js';
import { Check, Lock } from 'lucide';

import type { CourseStats } from '../lib/progress';
import type { Course } from '../lib/types';
import { cn, formatDate, formatDuration, plural } from '../lib/utils';
import { paths } from '../router';
import { CourseCover, posterGradient } from './course-cover';
import { Icon } from './ui/icon';

const tileClass =
  'relative block overflow-hidden rounded-md bg-muted shadow-sm ring-offset-2 ring-offset-background transition-transform duration-300 ease-out';

/** Thin progress line along a tile's bottom edge. */
function TileProgress(props: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={props.value}
      aria-label={props.label}
      class="absolute inset-x-0 bottom-0 h-1 bg-white/25"
    >
      <div class="h-full bg-primary" style={{ width: `${props.value}%` }} />
    </div>
  );
}

/** Round state mark in a tile's top-right corner. */
function TileMark(props: { done?: boolean; locked?: boolean }) {
  return (
    <Show when={props.done || props.locked}>
      <span class="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur-sm">
        <Icon icon={props.done ? Check : Lock} class="size-3.5" strokeWidth={2.5} />
        <span class="sr-only">{props.done ? 'Concluído' : 'Bloqueado'}</span>
      </span>
    </Show>
  );
}

type CourseCardProps = {
  course: Course;
  /** Progress for courses in the member's plan. */
  stats?: CourseStats;
  /** Where the tile leads; the course page by default. */
  href?: string;
  /** Line under the title; derived from access and progress by default. */
  meta?: string;
  class?: string;
};

/** Landscape course tile: cover art with the title on it. One link. */
export function CourseCard(props: CourseCardProps) {
  const locked = () => props.course.access !== 'liberado';
  const lessonCount = () => props.course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const durationSec = () =>
    props.course.modules
      .flatMap((module) => module.lessons)
      .reduce((total, lesson) => total + lesson.durationSec, 0);

  const meta = () => {
    if (props.meta) return props.meta;
    if (props.course.access === 'bloqueado') return 'Não incluso no seu plano';
    if (props.course.access === 'em-breve' && props.course.launchAt)
      return `Lançamento em ${formatDate(props.course.launchAt)}`;
    if (props.stats?.status === 'concluido') return 'Concluído';
    if (props.stats?.status === 'em-andamento') return `${props.stats.percent}% concluído`;
    return `${plural(lessonCount(), 'aula', 'aulas')} · ${formatDuration(durationSec())}`;
  };

  return (
    <a
      href={props.href ?? String(paths.cursos(props.course.id))}
      class={cn('group/tile block outline-none', props.class)}
    >
      <div
        class={cn(
          tileClass,
          'group-hover/tile:scale-[1.03] group-focus-visible/tile:ring-[3px] group-focus-visible/tile:ring-ring',
        )}
      >
        <CourseCover course={props.course} compact class="aspect-video [&>svg]:top-[40%]" />
        <Show when={locked()}>
          <div class="absolute inset-0 bg-black/45 backdrop-grayscale-[60%]" />
        </Show>
        <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent px-3 pt-10 pb-3">
          <h3 class="line-clamp-2 text-sm leading-snug font-semibold text-white">
            {props.course.title}
          </h3>
          <p class="mt-0.5 truncate text-xs text-white/80">{meta()}</p>
        </div>
        <TileMark done={props.stats?.status === 'concluido'} locked={locked()} />
        <Show when={props.stats?.status === 'em-andamento' ? props.stats : undefined}>
          {(stats) => (
            <TileProgress
              value={stats().percent}
              label={`Progresso em ${props.course.title}`}
            />
          )}
        </Show>
      </div>
    </a>
  );
}

type PosterCardProps = {
  title: string;
  meta: string;
  /** 1-based position in its course, drawn large on generated art. */
  number: number;
  /** Course hue for the generated art. */
  hue: number;
  coverUrl?: string;
  /** Absent when the item cannot be opened yet. */
  href?: string;
  /** 0–100; shown as a line while in progress. */
  percent?: number;
  done?: boolean;
  locked?: boolean;
  class?: string;
};

/**
 * Portrait tile for a module (or a lesson, in single-module courses), as in
 * a streaming app's rows. A link when `href` is set.
 */
export function PosterCard(props: PosterCardProps) {
  const body = () => (
    <div
      class={cn(
        tileClass,
        'aspect-[3/4]',
        props.href &&
          'group-hover/poster:scale-[1.04] group-focus-visible/poster:ring-[3px] group-focus-visible/poster:ring-ring',
      )}
      style={{ 'background-image': posterGradient(props.hue, props.number - 1) }}
    >
      <Show
        when={props.coverUrl}
        fallback={
          <span
            aria-hidden="true"
            class="absolute top-1 left-3 text-6xl font-black tracking-tighter text-white/25 tabular-nums"
          >
            {String(props.number).padStart(2, '0')}
          </span>
        }
      >
        {(src) => <img src={src()} alt="" class="absolute inset-0 size-full object-cover" />}
      </Show>
      <Show when={props.locked}>
        <div class="absolute inset-0 bg-black/45" />
      </Show>
      <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent px-3 pt-12 pb-3">
        <h3 class="line-clamp-3 text-sm leading-snug font-semibold text-white">{props.title}</h3>
        <p class="mt-0.5 truncate text-xs text-white/80">{props.meta}</p>
      </div>
      <TileMark done={props.done} locked={props.locked} />
      <Show when={!props.done && props.percent ? props.percent : undefined}>
        {(percent) => <TileProgress value={percent()} label={`Progresso em ${props.title}`} />}
      </Show>
    </div>
  );

  return (
    <Show
      when={props.href}
      fallback={<div class={cn('w-36 sm:w-40 lg:w-44', props.class)}>{body()}</div>}
    >
      {(href) => (
        <a
          href={href()}
          class={cn('group/poster block w-36 outline-none sm:w-40 lg:w-44', props.class)}
        >
          {body()}
        </a>
      )}
    </Show>
  );
}
