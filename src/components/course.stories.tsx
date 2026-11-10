import { createJSXDecorator, type Meta, type StoryObj } from 'storybook-solidjs-vite';
import { For } from 'solid-js';

import { courses, initialProgress } from '../lib/mock-data';
import { courseStats, findLesson } from '../lib/progress';
import type { Course } from '../lib/types';
import { CourseCard } from './course-card';
import { CourseCover } from './course-cover';
import { CourseOutline } from './course-outline';
import { LessonNotes } from './lesson-notes';
import { VideoPlayer } from './video-player';

// Course components fed with the example data in src/lib/mock-data.ts —
// the same shapes the API will return.

const course = (id: string): Course => {
  const found = courses.find((item) => item.id === id);
  if (!found) throw new Error(`Curso de exemplo "${id}" não existe em mock-data.ts`);
  return found;
};

const progress = initialProgress();
const statsFor = (id: string) => courseStats(course(id), progress);

const meta = {
  title: 'Cursos/CourseCard',
  component: CourseCard,
  subcomponents: { CourseCover, CourseOutline, VideoPlayer, LessonNotes },
  decorators: [
    createJSXDecorator((Story) => (
      <div class="w-80">
        <Story />
      </div>
    )),
  ],
} satisfies Meta<typeof CourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: { course: course('metodo-criador'), stats: statsFor('metodo-criador') },
};

export const NotStarted: Story = {
  args: { course: course('marca-pessoal'), stats: statsFor('marca-pessoal') },
};

export const Completed: Story = {
  args: { course: course('bio-que-converte'), stats: statsFor('bio-que-converte') },
};

/** Not in the member's plan: shown in "Disponíveis para você". */
export const Locked: Story = {
  args: { course: course('masterclass-negocio-digital') },
};

export const ComingSoon: Story = {
  args: { course: course('fotografia-mobile') },
};

export const Grid: Story = {
  decorators: [],
  parameters: { layout: 'padded' },
  args: { course: course('metodo-criador') },
  render: () => (
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <CourseCard course={course('metodo-criador')} stats={statsFor('metodo-criador')} />
      <CourseCard course={course('edicao-de-video')} stats={statsFor('edicao-de-video')} />
      <CourseCard course={course('bio-que-converte')} stats={statsFor('bio-que-converte')} />
      <CourseCard course={course('masterclass-negocio-digital')} />
    </div>
  ),
};

/** Modules and lessons, with a module that unlocks later (drip). */
export const Outline: Story = {
  decorators: [],
  parameters: { layout: 'padded' },
  args: { course: course('metodo-criador') },
  render: () => (
    <div class="max-w-2xl">
      <CourseOutline
        course={course('metodo-criador')}
        progress={progress}
        currentLessonId="reaproveitar"
      />
    </div>
  ),
};

/** Poster shown while a lesson has no `videoUrl` from the API yet. */
export const Player: Story = {
  decorators: [],
  parameters: { layout: 'padded' },
  args: { course: course('metodo-criador') },
  render: () => (
    <div class="max-w-3xl">
      <VideoPlayer
        course={course('metodo-criador')}
        lesson={findLesson(course('metodo-criador'), 'reaproveitar')!.lesson}
      />
    </div>
  ),
};

export const Notes: Story = {
  decorators: [],
  parameters: { layout: 'padded' },
  args: { course: course('metodo-criador') },
  render: () => (
    <div class="max-w-xl">
      <LessonNotes storageKey="storybook:notas" />
    </div>
  ),
};

export const Covers: Story = {
  decorators: [],
  parameters: { layout: 'padded' },
  args: { course: course('metodo-criador') },
  render: () => (
    <div class="grid max-w-3xl grid-cols-3 gap-3">
      <For each={courses}>
        {(item) => (
          <CourseCover
            course={item}
            locked={item.access !== 'liberado'}
            class="aspect-[2/1] rounded-lg"
          />
        )}
      </For>
    </div>
  ),
};
