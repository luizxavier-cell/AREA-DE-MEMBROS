import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { For, Show, createMemo } from 'solid-js';
import { Info, Play, RotateCcw } from 'lucide';

import { Billboard, BillboardProgress, Eyebrow, billboardButton } from '../../components/billboard';
import { CourseCard, PosterCard } from '../../components/course-card';
import { Rail } from '../../components/rail';
import { Icon } from '../../components/ui/icon';
import { getCourses, getMember, getProgress } from '../../lib/api';
import { platform } from '../../lib/config';
import {
  courseStats,
  isModuleReleased,
  lessonKey,
  type CourseStats,
  type CourseStatus,
} from '../../lib/progress';
import type { Course, Progress } from '../../lib/types';
import { formatClock, formatDayMonth, formatDuration, plural } from '../../lib/utils';
import { paths } from '../../router';

export const route = {
  preload: () => {
    void getMember();
    void getCourses();
    void getProgress();
  },
} satisfies RouteDefinition;

// Courses in progress first, then not started, then finished.
const statusOrder: Record<CourseStatus, number> = {
  'em-andamento': 0,
  'nao-iniciado': 1,
  concluido: 2,
};

type Entry = { course: Course; stats: CourseStats };

export default function Home() {
  const member = createMemo(() => getMember());
  const courses = createMemo(() => getCourses());
  const progress = createMemo(() => getProgress());

  const enrolled = createMemo(() =>
    courses()
      .filter((course) => course.access === 'liberado')
      .map((course) => ({ course, stats: courseStats(course, progress()) }))
      .toSorted((a, b) => statusOrder[a.stats.status] - statusOrder[b.stats.status]),
  );

  // The billboard: the course studied last, else one in progress, else the
  // first not started, else the first of the plan.
  const featured = createMemo(() => {
    const list = enrolled();
    return (
      list.find(
        (entry) =>
          entry.course.id === progress().lastCourseId && entry.stats.status !== 'concluido',
      ) ??
      list.find((entry) => entry.stats.status !== 'concluido') ??
      list[0]
    );
  });

  // Last studied first, then the other courses in progress.
  const watching = createMemo(() => {
    const last = progress().lastCourseId;
    return enrolled()
      .filter((entry) => entry.stats.status === 'em-andamento')
      .toSorted((a, b) => Number(b.course.id === last) - Number(a.course.id === last));
  });

  const storefront = createMemo(() => courses().filter((course) => course.access !== 'liberado'));

  return (
    <>
      <Title>{`Início · ${platform.name}`}</Title>

      <Show when={featured()}>
        {(entry) => <HomeBillboard entry={entry()} firstName={member().name.split(' ')[0]!} />}
      </Show>

      <div class="flex flex-col gap-6 md:gap-8">
        <Show when={watching().length > 0}>
          <Rail title="Continuar assistindo">
            <For each={watching()} keyed={(entry) => entry.course.id}>
              {(entry) => (
                <CourseCard
                  course={entry().course}
                  stats={entry().stats}
                  class="w-64 sm:w-72 lg:w-80"
                  href={
                    entry().stats.resume
                      ? String(
                          paths.cursos(entry().course.id).aulas(entry().stats.resume!.lesson.id),
                        )
                      : undefined
                  }
                  meta={
                    entry().stats.resume
                      ? `Próxima: ${entry().stats.resume!.lesson.title}`
                      : undefined
                  }
                />
              )}
            </For>
          </Rail>
        </Show>

        <For each={enrolled()} keyed={(entry) => entry.course.id}>
          {(entry) => <CourseRail entry={entry()} progress={progress()} />}
        </For>

        <Show when={storefront().length > 0}>
          <Rail title="Disponíveis para você">
            <For each={storefront()} keyed={(course) => course.id}>
              {(course) => <CourseCard course={course()} class="w-64 sm:w-72 lg:w-80" />}
            </For>
          </Rail>
        </Show>
      </div>
    </>
  );
}

function HomeBillboard(props: { entry: Entry; firstName: string }) {
  const course = () => props.entry.course;
  const stats = () => props.entry.stats;
  const lessonCount = () => course().modules.reduce((n, module) => n + module.lessons.length, 0);

  return (
    <Billboard course={course()}>
      <Eyebrow>
        Olá, {props.firstName}!{' '}
        {stats().status === 'em-andamento' ? 'Continue de onde parou' : 'Bons estudos'}
      </Eyebrow>
      <div class="space-y-3">
        <h1 class="text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
          {course().title}
        </h1>
        <p class="text-sm text-muted-foreground">
          {course().level} · {plural(lessonCount(), 'aula', 'aulas')} ·{' '}
          {formatDuration(stats().durationSec)}
        </p>
      </div>
      <p class="text-base text-pretty text-foreground/85 md:text-lg">{course().subtitle}</p>
      <div class="flex flex-wrap gap-3">
        <Show when={stats().resume}>
          {(resume) => (
            <a
              href={String(paths.cursos(course().id).aulas(resume().lesson.id))}
              class={billboardButton.primary}
            >
              <Show
                when={stats().status === 'concluido'}
                fallback={<Icon icon={Play} class="fill-current" />}
              >
                <Icon icon={RotateCcw} />
              </Show>
              {stats().status === 'em-andamento'
                ? 'Continuar'
                : stats().status === 'concluido'
                  ? 'Rever'
                  : 'Começar'}
            </a>
          )}
        </Show>
        <a href={String(paths.cursos(course().id))} class={billboardButton.secondary}>
          <Icon icon={Info} />
          Mais informações
        </a>
      </div>
      <Show when={stats().status === 'em-andamento'}>
        <div class="w-full space-y-2">
          <BillboardProgress
            percent={stats().percent}
            caption={`${stats().done} de ${plural(stats().total, 'aula', 'aulas')}`}
            label={`Progresso em ${course().title}`}
          />
          <Show when={stats().resume}>
            {(resume) => (
              <p class="truncate text-sm text-muted-foreground">
                Próxima: <span class="text-foreground">{resume().lesson.title}</span>
              </p>
            )}
          </Show>
        </div>
      </Show>
    </Billboard>
  );
}

/**
 * One row per course, as in the reference streaming layout: its modules as
 * posters. A course with a single module shows that module's lessons.
 */
function CourseRail(props: { entry: Entry; progress: Progress }) {
  const course = () => props.entry.course;
  const done = createMemo(() => new Set(props.progress.completed));
  const isDone = (lessonId: string) => done().has(lessonKey(course().id, lessonId));
  const lessonHref = (lessonId: string) => String(paths.cursos(course().id).aulas(lessonId));

  const meta = () =>
    `${plural(course().modules.length, 'módulo', 'módulos')} · ${props.entry.stats.percent}% concluído`;

  return (
    <Rail title={course().title} meta={meta()} href={String(paths.cursos(course().id))}>
      <Show
        when={course().modules.length > 1}
        fallback={
          <For each={course().modules[0]?.lessons ?? []} keyed={(lesson) => lesson.id}>
            {(lesson, index) => (
              <PosterCard
                title={lesson().title}
                meta={formatClock(lesson().durationSec)}
                number={index() + 1}
                hue={course().hue}
                href={lessonHref(lesson().id)}
                done={isDone(lesson().id)}
              />
            )}
          </For>
        }
      >
        <For each={course().modules} keyed={(module) => module.id}>
          {(module, index) => {
            const released = () => isModuleReleased(module());
            const doneCount = () => module().lessons.filter((lesson) => isDone(lesson.id)).length;
            // Open the module where the member stopped: its first unfinished lesson.
            const target = () =>
              module().lessons.find((lesson) => !isDone(lesson.id)) ?? module().lessons[0];
            return (
              <PosterCard
                title={module().title}
                meta={
                  released()
                    ? plural(module().lessons.length, 'aula', 'aulas')
                    : `Libera em ${formatDayMonth(module().releaseAt!)}`
                }
                number={index() + 1}
                hue={course().hue}
                href={released() && target() ? lessonHref(target()!.id) : undefined}
                percent={Math.round((doneCount() / Math.max(1, module().lessons.length)) * 100)}
                done={module().lessons.length > 0 && doneCount() === module().lessons.length}
                locked={!released()}
              />
            );
          }}
        </For>
      </Show>
    </Rail>
  );
}
