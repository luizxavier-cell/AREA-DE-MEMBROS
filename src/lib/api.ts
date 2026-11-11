// Camada de dados da área de membros — o único módulo que as páginas usam
// para ler e gravar dados.
//
// Por enquanto (somente frontend) as funções leem src/lib/mock-data.ts e o
// progresso vive em memória: no navegador ele dura até recarregar a página;
// no servidor, cada render parte do progresso inicial. Para ligar o backend,
// troque o corpo de cada função por uma chamada à API (fetch, ou uma server
// function com 'use server') mantendo as assinaturas — páginas e componentes
// não mudam. As leituras passam por query() do router: cache por chave,
// deduplicação entre preload e render, e revalidação após mutações.
import { query, revalidate } from '@solidjs/router';

import { lessonKey } from './progress';
import * as data from './mock-data';
import type { Certificate, Course, Member } from './types';

let progress = data.initialProgress();
let member = data.member;

/** Plain copies, so callers can never mutate the source of truth. */
const clone = <T>(value: T): T => structuredClone(value);

export const getMember = query(async (): Promise<Member> => clone(member), 'member');

export const getCourses = query(async (): Promise<Course[]> => clone(data.courses), 'courses');

export const getCourse = query(
  async (id: string): Promise<Course | null> =>
    clone(data.courses.find((course) => course.id === id) ?? null),
  'course',
);

export const getProgress = query(async () => clone(progress), 'progress');

export const getAnnouncements = query(async () => clone(data.announcements), 'announcements');

export const getNextLive = query(async () => clone(data.nextLive), 'next-live');

export const getFaqs = query(async () => clone(data.faqs), 'faqs');

/** Certificates are issued for finished courses that offer one. */
export const getCertificates = query(async (): Promise<Certificate[]> => {
  const done = new Set(progress.completed);
  return data.courses
    .filter((course) => course.access === 'liberado' && course.certificate)
    .filter((course) =>
      course.modules.every((module) =>
        module.lessons.every((lesson) => done.has(lessonKey(course.id, lesson.id))),
      ),
    )
    .map((course) => {
      const workloadSec = course.modules
        .flatMap((module) => module.lessons)
        .reduce((total, lesson) => total + lesson.durationSec, 0);
      return {
        id: `cert-${course.id}`,
        courseId: course.id,
        courseTitle: course.title,
        hue: course.hue,
        issuedAt: data.certificateIssuedAt[course.id] ?? new Date().toISOString().slice(0, 10),
        workloadSec,
        code: `CRT-${course.id.slice(0, 4).toUpperCase()}-${String(workloadSec).padStart(5, '0')}`,
      };
    });
}, 'certificates');

/** Marks a lesson as done (or not done) and refreshes what depends on it. */
export async function setLessonCompleted(courseId: string, lessonId: string, completed: boolean) {
  const key = lessonKey(courseId, lessonId);
  const rest = progress.completed.filter((entry) => entry !== key);
  progress = { ...progress, completed: completed ? [...rest, key] : rest };
  revalidate([getProgress.key, getCertificates.key]);
}

/**
 * Remembers the lesson the member opened, for "Continuar de onde parou".
 * Quiet on purpose: nothing on the lesson page depends on it, and the next
 * navigation to another page reads it fresh.
 */
export function recordLessonVisit(courseId: string, lessonId: string) {
  progress = {
    ...progress,
    lastCourseId: courseId,
    lastLesson: { ...progress.lastLesson, [courseId]: lessonId },
  };
}

export async function updateProfile(changes: Pick<Member, 'name' | 'email'>) {
  member = { ...member, ...changes };
  revalidate(getMember.key);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** E-mail and password sign-in, with no e-mail confirmation. False when they don't match. */
export async function signIn(_email: string, password: string): Promise<boolean> {
  await wait(600);
  return password !== data.mockAuth.wrongPassword;
}

/**
 * E-mails a one-time code to reset the password. Resolves the same whether
 * or not the account exists, so the form can't be used to discover accounts.
 */
export async function requestPasswordReset(_email: string): Promise<void> {
  await wait(400);
}

/** Checks the code without using it up. False when wrong or expired. */
export async function verifyResetCode(_email: string, code: string): Promise<boolean> {
  await wait(400);
  return code === data.mockAuth.resetCode;
}

/** Sets the new password. The backend must validate the code again here. */
export async function resetPassword(
  _email: string,
  _code: string,
  _password: string,
): Promise<void> {
  await wait(400);
}
