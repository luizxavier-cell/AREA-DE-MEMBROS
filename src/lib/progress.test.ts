import { describe, expect, test } from 'vitest';

import { adjacentLessons, courseStats, resumeLesson } from './progress';
import type { Course, Progress } from './types';
import { formatClock, formatDuration, initials } from './utils';

const lesson = (id: string, durationSec = 60) => ({
  id,
  title: id,
  kind: 'video' as const,
  durationSec,
  summary: '',
});

const course: Course = {
  id: 'curso',
  title: 'Curso',
  subtitle: '',
  description: '',
  category: '',
  level: 'Iniciante',
  instructor: '',
  hue: 0,
  icon: 'rocket',
  access: 'liberado',
  outcomes: [],
  certificate: true,
  updatedAt: '2026-01-01',
  modules: [
    { id: 'm1', title: 'M1', lessons: [lesson('a'), lesson('b')] },
    { id: 'm2', title: 'M2', lessons: [lesson('c'), lesson('d')] },
    { id: 'm3', title: 'M3', releaseAt: '2030-01-01T00:00:00Z', lessons: [lesson('e')] },
  ],
};

const NOW = Date.parse('2026-11-10T12:00:00Z');

const progress = (completed: string[], last?: string): Progress => ({
  completed: completed.map((id) => `curso/${id}`),
  lastLesson: last ? { curso: last } : {},
});

describe('courseStats', () => {
  test('counts completed lessons and derives the status', () => {
    expect(courseStats(course, progress([]), NOW)).toMatchObject({
      total: 5,
      done: 0,
      percent: 0,
      status: 'nao-iniciado',
    });
    expect(courseStats(course, progress(['a', 'b']), NOW)).toMatchObject({
      done: 2,
      percent: 40,
      doneSec: 120,
      status: 'em-andamento',
    });
    expect(courseStats(course, progress(['a', 'b', 'c', 'd', 'e']), NOW).status).toBe('concluido');
  });

  test('ignores progress from other courses', () => {
    const other: Progress = { completed: ['outro/a'], lastLesson: {} };
    expect(courseStats(course, other, NOW).done).toBe(0);
  });
});

describe('resumeLesson', () => {
  test('starts at the first lesson when nothing was watched', () => {
    expect(resumeLesson(course, progress([]), NOW)?.lesson.id).toBe('a');
  });

  test('continues with the first unfinished lesson from the last one opened', () => {
    expect(resumeLesson(course, progress(['a', 'b', 'c'], 'c'), NOW)?.lesson.id).toBe('d');
  });

  test('wraps around to lessons skipped earlier', () => {
    expect(resumeLesson(course, progress(['b', 'c', 'd'], 'd'), NOW)?.lesson.id).toBe('a');
  });

  test('never resumes into a module that is not released yet', () => {
    const allOpen = progress(['a', 'b', 'c', 'd'], 'd');
    expect(resumeLesson(course, allOpen, NOW)?.lesson.id).toBe('d');
    expect(resumeLesson(course, allOpen, Date.parse('2031-01-01'))?.lesson.id).toBe('e');
  });
});

describe('adjacentLessons', () => {
  test('crosses module boundaries', () => {
    const { prev, next } = adjacentLessons(course, 'b', NOW);
    expect(prev?.lesson.id).toBe('a');
    expect(next?.lesson.id).toBe('c');
  });

  test('stops before an unreleased module', () => {
    expect(adjacentLessons(course, 'd', NOW).next).toBeUndefined();
    expect(adjacentLessons(course, 'a', NOW).prev).toBeUndefined();
  });
});

describe('formatting', () => {
  test('clock and duration', () => {
    expect(formatClock(754)).toBe('12:34');
    expect(formatClock(3725)).toBe('1:02:05');
    expect(formatDuration(900)).toBe('15min');
    expect(formatDuration(5400)).toBe('1h 30min');
    expect(formatDuration(7200)).toBe('2h');
  });

  test('initials', () => {
    expect(initials('Ana Beatriz Souza')).toBe('AS');
    expect(initials('Marina')).toBe('M');
  });
});
