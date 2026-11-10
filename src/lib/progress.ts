// Pure progress math over the data model — no reactivity, no I/O, so it is
// shared by every page and unit-tested on its own (progress.test.ts).
import type { Course, CourseModule, Lesson, Progress } from './types';

export type CourseStatus = 'nao-iniciado' | 'em-andamento' | 'concluido';

export type LessonRef = { lesson: Lesson; module: CourseModule; index: number };

export const lessonKey = (courseId: string, lessonId: string) => `${courseId}/${lessonId}`;

export function isModuleReleased(module: CourseModule, now = Date.now()) {
  return !module.releaseAt || Date.parse(module.releaseAt) <= now;
}

/** Every lesson of the course in order, with its module and position. */
export function flattenLessons(course: Course): LessonRef[] {
  const refs: LessonRef[] = [];
  for (const module of course.modules) {
    for (const lesson of module.lessons) refs.push({ lesson, module, index: refs.length });
  }
  return refs;
}

export function findLesson(course: Course, lessonId: string) {
  return flattenLessons(course).find((ref) => ref.lesson.id === lessonId);
}

/** Previous/next lessons the member can open (skips modules not yet released). */
export function adjacentLessons(course: Course, lessonId: string, now = Date.now()) {
  const open = flattenLessons(course).filter((ref) => isModuleReleased(ref.module, now));
  const at = open.findIndex((ref) => ref.lesson.id === lessonId);
  return {
    prev: at > 0 ? open[at - 1] : undefined,
    next: at >= 0 && at < open.length - 1 ? open[at + 1] : undefined,
  };
}

export type CourseStats = {
  total: number;
  done: number;
  percent: number;
  durationSec: number;
  doneSec: number;
  status: CourseStatus;
  /** Where "Continuar" should take the member. */
  resume?: LessonRef;
};

export function courseStats(course: Course, progress: Progress, now = Date.now()): CourseStats {
  const done = new Set(progress.completed);
  const lessons = flattenLessons(course);
  let doneCount = 0;
  let durationSec = 0;
  let doneSec = 0;
  for (const { lesson } of lessons) {
    durationSec += lesson.durationSec;
    if (done.has(lessonKey(course.id, lesson.id))) {
      doneCount += 1;
      doneSec += lesson.durationSec;
    }
  }

  const total = lessons.length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const status: CourseStatus =
    doneCount === 0 ? 'nao-iniciado' : doneCount === total ? 'concluido' : 'em-andamento';

  return {
    total,
    done: doneCount,
    percent,
    durationSec,
    doneSec,
    status,
    resume: resumeLesson(course, progress, now),
  };
}

/**
 * The lesson to resume: the first unfinished, released lesson at or after
 * the last one opened (wrapping to the start), else the last one opened.
 */
export function resumeLesson(course: Course, progress: Progress, now = Date.now()) {
  const done = new Set(progress.completed);
  const open = flattenLessons(course).filter((ref) => isModuleReleased(ref.module, now));
  if (open.length === 0) return undefined;

  const lastId = progress.lastLesson[course.id];
  const start = Math.max(
    0,
    open.findIndex((ref) => ref.lesson.id === lastId),
  );
  const ordered = [...open.slice(start), ...open.slice(0, start)];
  return (
    ordered.find((ref) => !done.has(lessonKey(course.id, ref.lesson.id))) ??
    open.find((ref) => ref.lesson.id === lastId) ??
    open[0]
  );
}

export const statusLabel: Record<CourseStatus, string> = {
  'nao-iniciado': 'Não iniciado',
  'em-andamento': 'Em andamento',
  concluido: 'Concluído',
};
