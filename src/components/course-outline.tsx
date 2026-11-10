import { For, Match, Show, Switch, createMemo } from 'solid-js';
import { Circle, CircleCheck, CirclePlay, FileText, Lock, Radio, Video } from 'lucide';

import { isModuleReleased, lessonKey, resumeLesson } from '../lib/progress';
import type { Course, CourseModule, Lesson, LessonKind, Progress } from '../lib/types';
import { cn, formatClock, formatDate, formatDuration } from '../lib/utils';
import { paths } from '../router';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Icon } from './ui/icon';

export const lessonKindLabel: Record<LessonKind, string> = {
  video: 'Vídeo',
  texto: 'Leitura',
  'ao-vivo': 'Gravação ao vivo',
};

const lessonKindIcon = { video: Video, texto: FileText, 'ao-vivo': Radio } as const;

type CourseOutlineProps = {
  course: Course;
  progress: Progress;
  /** The lesson on screen (player): highlighted and its module open. */
  currentLessonId?: string;
  class?: string;
};

/**
 * Modules and lessons of a course as an accordion (course page and the
 * player's side panel). Lessons of locked courses or modules that are not
 * released yet are listed but not linked.
 */
export function CourseOutline(props: CourseOutlineProps) {
  const done = createMemo(() => new Set(props.progress.completed));
  // Open the module being watched, or the one the member would resume.
  const focusModuleId = createMemo(() => {
    const course = props.course;
    if (props.currentLessonId) {
      return course.modules.find((m) => m.lessons.some((l) => l.id === props.currentLessonId))?.id;
    }
    return resumeLesson(course, props.progress)?.module.id ?? course.modules[0]?.id;
  });

  return (
    <Accordion class={cn('divide-y rounded-xl border bg-card', props.class)}>
      <For each={props.course.modules} keyed={(module) => module.id}>
        {(module, index) => (
          <ModuleItem
            course={props.course}
            module={module()}
            number={index() + 1}
            done={done()}
            open={module().id === focusModuleId()}
            currentLessonId={props.currentLessonId}
          />
        )}
      </For>
    </Accordion>
  );
}

type ModuleItemProps = {
  course: Course;
  module: CourseModule;
  number: number;
  done: Set<string>;
  open: boolean;
  currentLessonId?: string;
};

function ModuleItem(props: ModuleItemProps) {
  const released = () => isModuleReleased(props.module);
  const available = () => props.course.access === 'liberado' && released();
  const doneCount = () =>
    props.module.lessons.filter((lesson) => props.done.has(lessonKey(props.course.id, lesson.id)))
      .length;
  const durationSec = () =>
    props.module.lessons.reduce((total, lesson) => total + lesson.durationSec, 0);

  return (
    <AccordionItem open={props.open} class="border-b-0 px-4">
      <AccordionTrigger class="items-center hover:no-underline">
        <span class="flex min-w-0 flex-1 flex-col gap-1">
          <span class="text-xs font-normal text-muted-foreground">Módulo {props.number}</span>
          <span class="leading-snug">{props.module.title}</span>
        </span>
        <Show
          when={released()}
          fallback={
            <Badge variant="outline" class="font-normal text-muted-foreground">
              <Icon icon={Lock} />
              Libera em {formatDate(props.module.releaseAt!)}
            </Badge>
          }
        >
          <span class="shrink-0 text-right text-xs font-normal text-muted-foreground tabular-nums">
            {doneCount()}/{props.module.lessons.length} · {formatDuration(durationSec())}
          </span>
        </Show>
      </AccordionTrigger>
      <AccordionContent class="-mx-2 pb-3">
        <ol class="space-y-0.5">
          <For each={props.module.lessons} keyed={(lesson) => lesson.id}>
            {(lesson) => (
              <li>
                <LessonRow
                  course={props.course}
                  lesson={lesson()}
                  done={props.done.has(lessonKey(props.course.id, lesson().id))}
                  current={lesson().id === props.currentLessonId}
                  available={available()}
                />
              </li>
            )}
          </For>
        </ol>
      </AccordionContent>
    </AccordionItem>
  );
}

type LessonRowProps = {
  course: Course;
  lesson: Lesson;
  done: boolean;
  current: boolean;
  available: boolean;
};

function LessonRow(props: LessonRowProps) {
  const body = () => (
    <>
      <Switch fallback={<Icon icon={Circle} class="text-muted-foreground/50" />}>
        <Match when={!props.available}>
          <Icon icon={Lock} class="text-muted-foreground" />
        </Match>
        <Match when={props.current}>
          <Icon icon={CirclePlay} class="text-primary" />
        </Match>
        <Match when={props.done}>
          <Icon icon={CircleCheck} class="text-success" />
        </Match>
      </Switch>
      <span class="min-w-0 flex-1">
        <span class="block text-sm leading-snug">{props.lesson.title}</span>
        <span class="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon icon={lessonKindIcon[props.lesson.kind]} class="size-3" />
          {lessonKindLabel[props.lesson.kind]} · {formatClock(props.lesson.durationSec)}
        </span>
      </span>
    </>
  );

  return (
    <Show
      when={props.available}
      fallback={
        <div class="flex items-start gap-3 rounded-md px-2 py-2 text-muted-foreground [&>svg]:mt-0.5">
          {body()}
        </div>
      }
    >
      <a
        href={String(paths.cursos(props.course.id).aulas(props.lesson.id))}
        class="flex items-start gap-3 rounded-md px-2 py-2 transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-accent aria-[current=page]:font-medium [&>svg]:mt-0.5"
      >
        {body()}
      </a>
    </Show>
  );
}
