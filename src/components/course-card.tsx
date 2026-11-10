import { Match, Show, Switch } from 'solid-js';
import { CalendarClock, CircleCheck, Lock } from 'lucide';

import type { CourseStats } from '../lib/progress';
import type { Course } from '../lib/types';
import { formatDate, formatDuration, plural } from '../lib/utils';
import { paths } from '../router';
import { CourseCover } from './course-cover';
import { Badge } from './ui/badge';
import { Icon } from './ui/icon';
import { Progress } from './ui/misc';

type CourseCardProps = {
  course: Course;
  /** Progress for courses in the member's plan. */
  stats?: CourseStats;
};

/** Course tile for grids. The whole card is one link to the course page. */
export function CourseCard(props: CourseCardProps) {
  const lessonCount = () => props.course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const durationSec = () =>
    props.course.modules
      .flatMap((module) => module.lessons)
      .reduce((total, lesson) => total + lesson.durationSec, 0);

  return (
    <article class="group/course relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-[box-shadow,translate] duration-200 focus-within:ring-[3px] focus-within:ring-ring/50 hover:-translate-y-0.5 hover:shadow-md">
      <div class="relative">
        <CourseCover
          course={props.course}
          locked={props.course.access !== 'liberado'}
          class="aspect-[2/1]"
        />
        <Show when={props.stats?.status === 'concluido'}>
          <Badge class="absolute bottom-3 left-3 border-transparent bg-white/90 text-emerald-700 shadow-sm dark:bg-black/60 dark:text-emerald-300">
            <Icon icon={CircleCheck} />
            Concluído
          </Badge>
        </Show>
      </div>

      <div class="flex flex-1 flex-col gap-3 p-4">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Badge variant="secondary">{props.course.level}</Badge>
          <span>
            {plural(lessonCount(), 'aula', 'aulas')} · {formatDuration(durationSec())}
          </span>
        </div>

        <div class="space-y-1">
          <h3 class="leading-snug font-semibold tracking-tight">
            <a
              href={paths.cursos(props.course.id)}
              class="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {props.course.title}
            </a>
          </h3>
          <p class="line-clamp-2 text-sm text-muted-foreground">{props.course.subtitle}</p>
        </div>

        <div class="mt-auto pt-1 text-sm">
          <Switch>
            <Match when={props.course.access === 'bloqueado'}>
              <div class="flex items-center justify-between gap-2">
                <span class="flex items-center gap-1.5 text-muted-foreground">
                  <Icon icon={Lock} class="size-3.5" />
                  Não incluso no seu plano
                </span>
                <span class="font-medium text-primary">Saiba mais</span>
              </div>
            </Match>
            <Match when={props.course.access === 'em-breve' && props.course.launchAt}>
              {(launchAt) => (
                <span class="flex items-center gap-1.5 text-muted-foreground">
                  <Icon icon={CalendarClock} class="size-3.5" />
                  Lançamento em {formatDate(launchAt())}
                </span>
              )}
            </Match>
            <Match when={props.stats}>
              {(stats) => (
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-muted-foreground">
                      {stats().done} de {plural(stats().total, 'aula', 'aulas')}
                    </span>
                    <span class="font-medium tabular-nums">{stats().percent}%</span>
                  </div>
                  <Progress
                    value={stats().percent}
                    class="h-1.5"
                    aria-label={`Progresso em ${props.course.title}`}
                  />
                </div>
              )}
            </Match>
          </Switch>
        </div>
      </div>
    </article>
  );
}
