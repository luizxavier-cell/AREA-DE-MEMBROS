import { Title } from '@solidjs/meta';
import type { RouteProps } from '@solidjs/router';
import { defineFileRoute } from '@solidjs/router/fs';
import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  onFlush,
} from 'solid-js';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Download,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Link,
  ListVideo,
  Lock,
  Paperclip,
} from 'lucide';

import { CourseOutline, lessonKindLabel } from '../../../../../components/course-outline';
import { LessonNotes } from '../../../../../components/lesson-notes';
import { ThemeToggle } from '../../../../../components/theme-toggle';
import { Badge } from '../../../../../components/ui/badge';
import { Button, buttonVariants } from '../../../../../components/ui/button';
import { Icon } from '../../../../../components/ui/icon';
import { Empty, Progress, Separator } from '../../../../../components/ui/misc';
import { Sheet } from '../../../../../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs';
import { VideoPlayer } from '../../../../../components/video-player';
import {
  getCourse,
  getProgress,
  recordLessonVisit,
  setLessonCompleted,
} from '../../../../../lib/api';
import { platform } from '../../../../../lib/config';
import {
  adjacentLessons,
  courseStats,
  findLesson,
  isModuleReleased,
  lessonKey,
  type LessonRef,
} from '../../../../../lib/progress';
import type { Course, Material, Progress as ProgressData } from '../../../../../lib/types';
import { cn, formatClock, formatDate, plural } from '../../../../../lib/utils';
import { paths } from '../../../../../router';

// The lesson player. It sits in the (aula) group, outside the members
// sidebar: the page is the video, with the course outline beside it (a
// sheet on smaller screens).
export const route = defineFileRoute('/cursos/:curso/aulas/:aula', {
  preload: ({ params }) => {
    void getCourse(params.curso);
    void getProgress();
  },
});

export default function LessonPage(props: RouteProps<typeof route>) {
  const course = createMemo(() => getCourse(props.params.curso));
  const progress = createMemo(() => getProgress());
  const [outlineOpen, setOutlineOpen] = createSignal(false);

  // Remember where the member is, for "Continuar de onde parou".
  createEffect(
    () => [props.params.curso, props.params.aula] as const,
    ([courseId, lessonId]) => recordLessonVisit(courseId, lessonId),
  );

  const closeOutlineOnNavigate = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest('a[href]')) onFlush(() => setOutlineOpen(false));
  };

  return (
    <div class="flex min-h-svh flex-col bg-background">
      <Show when={course()} fallback={<PlayerMessage title="Curso não encontrado" />}>
        {(found) => (
          <>
            <PlayerHeader
              course={found()}
              progress={progress()}
              onOpenOutline={() => setOutlineOpen(true)}
            />
            <div class="flex flex-1">
              <main class="min-w-0 flex-1">
                <Lesson course={found()} lessonId={props.params.aula} progress={progress()} />
              </main>
              <aside
                aria-label="Conteúdo do curso"
                class="hidden w-96 shrink-0 border-l bg-sidebar/50 lg:block"
              >
                <div class="sticky top-14 max-h-[calc(100svh-3.5rem)] overflow-y-auto p-4">
                  <OutlinePanel
                    course={found()}
                    progress={progress()}
                    lessonId={props.params.aula}
                  />
                </div>
              </aside>
            </div>
            <Sheet
              open={outlineOpen()}
              onOpenChange={setOutlineOpen}
              side="right"
              title="Conteúdo do curso"
              class="w-full overflow-y-auto p-4 pt-12 sm:max-w-md"
            >
              <div onClick={closeOutlineOnNavigate}>
                <OutlinePanel course={found()} progress={progress()} lessonId={props.params.aula} />
              </div>
            </Sheet>
          </>
        )}
      </Show>
    </div>
  );
}

function PlayerHeader(props: {
  course: Course;
  progress: ProgressData;
  onOpenOutline: () => void;
}) {
  const stats = createMemo(() => courseStats(props.course, props.progress));
  return (
    <header class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4">
      <a
        href={String(paths.cursos(props.course.id))}
        class={buttonVariants({ variant: 'ghost', size: 'sm' })}
      >
        <Icon icon={ArrowLeft} />
        <span class="max-sm:sr-only">Voltar ao curso</span>
      </a>
      <Separator orientation="vertical" class="data-[orientation=vertical]:h-4" />
      <p class="min-w-0 flex-1 truncate px-1 text-sm font-medium">{props.course.title}</p>
      <div class="hidden w-44 items-center gap-2 md:flex">
        <Progress value={stats().percent} class="h-1.5" aria-label="Progresso do curso" />
        <span class="text-xs text-muted-foreground tabular-nums">{stats().percent}%</span>
      </div>
      <Button variant="outline" size="sm" class="lg:hidden" onClick={() => props.onOpenOutline()}>
        <Icon icon={ListVideo} />
        <span class="max-sm:sr-only">Aulas</span>
      </Button>
      <ThemeToggle />
    </header>
  );
}

function OutlinePanel(props: { course: Course; progress: ProgressData; lessonId: string }) {
  const stats = createMemo(() => courseStats(props.course, props.progress));
  return (
    <div class="space-y-4">
      <div class="space-y-2">
        <h2 class="font-semibold tracking-tight">Conteúdo do curso</h2>
        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {stats().done} de {plural(stats().total, 'aula concluída', 'aulas concluídas')}
          </span>
          <span class="tabular-nums">{stats().percent}%</span>
        </div>
        <Progress value={stats().percent} class="h-1.5" aria-label="Progresso do curso" />
      </div>
      <CourseOutline
        course={props.course}
        progress={props.progress}
        currentLessonId={props.lessonId}
      />
    </div>
  );
}

function Lesson(props: { course: Course; lessonId: string; progress: ProgressData }) {
  const ref = createMemo(() => findLesson(props.course, props.lessonId));
  const unreleased = createMemo(() => {
    const found = ref();
    return found && !isModuleReleased(found.module) ? found : undefined;
  });

  return (
    <Switch>
      <Match when={!ref()}>
        <PlayerMessage title="Aula não encontrada" courseId={props.course.id} />
      </Match>
      <Match when={props.course.access !== 'liberado'}>
        <PlayerMessage
          title="Conteúdo bloqueado"
          description="Este curso não faz parte do seu plano. Veja as opções de acesso na página do curso."
          courseId={props.course.id}
          locked
        />
      </Match>
      <Match when={unreleased()}>
        {(locked) => (
          <PlayerMessage
            title="Esta aula ainda não foi liberada"
            description={`O módulo “${locked().module.title}” será liberado em ${formatDate(locked().module.releaseAt!)}.`}
            courseId={props.course.id}
            locked
          />
        )}
      </Match>
      <Match when={ref()}>
        {(current) => (
          <LessonView course={props.course} current={current()} progress={props.progress} />
        )}
      </Match>
    </Switch>
  );
}

function LessonView(props: { course: Course; current: LessonRef; progress: ProgressData }) {
  const lesson = () => props.current.lesson;
  const key = () => lessonKey(props.course.id, lesson().id);
  const done = createMemo(() => props.progress.completed.includes(key()));
  const total = () => props.course.modules.reduce((n, module) => n + module.lessons.length, 0);
  const siblings = createMemo(() => adjacentLessons(props.course, lesson().id));
  const lessonHref = (target: LessonRef) =>
    String(paths.cursos(props.course.id).aulas(target.lesson.id));

  return (
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 lg:p-6">
      <Title>{`${lesson().title} · ${props.course.title} · ${platform.name}`}</Title>
      <VideoPlayer course={props.course} lesson={lesson()} />

      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="min-w-0 space-y-1.5">
          <p class="text-sm text-muted-foreground">
            {props.current.module.title} · Aula {props.current.index + 1} de {total()}
          </p>
          <h1 class="text-2xl font-semibold tracking-tight text-balance">{lesson().title}</h1>
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="secondary">{lessonKindLabel[lesson().kind]}</Badge>
            <Badge variant="outline">{formatClock(lesson().durationSec)}</Badge>
            <Show when={done()}>
              <Badge variant="success">
                <Icon icon={CircleCheck} />
                Concluída
              </Badge>
            </Show>
          </div>
        </div>
        <Button
          variant={done() ? 'outline' : 'default'}
          class="shrink-0"
          aria-pressed={done() ? 'true' : 'false'}
          onClick={() => void setLessonCompleted(props.course.id, lesson().id, !done())}
        >
          <Show
            when={done()}
            fallback={
              <>
                <Icon icon={Check} />
                Marcar como concluída
              </>
            }
          >
            <Icon icon={CircleCheck} class="text-success" />
            Concluída — desmarcar
          </Show>
        </Button>
      </div>

      <Tabs defaultValue="visao-geral">
        <TabsList aria-label="Detalhes da aula">
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="materiais">
            Materiais
            <Show when={lesson().materials?.length}>
              <span class="rounded-sm bg-muted-foreground/10 px-1.5 text-xs tabular-nums">
                {lesson().materials!.length}
              </span>
            </Show>
          </TabsTrigger>
          <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
        </TabsList>
        <TabsContent value="visao-geral" class="pt-2">
          <div class="max-w-3xl space-y-3 text-sm/relaxed text-muted-foreground">
            <p>{lesson().summary}</p>
            <p>
              Ministrada por{' '}
              <span class="font-medium text-foreground">{props.course.instructor}</span>. Dúvidas?
              Fale com a gente pela página de Ajuda.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="materiais" class="pt-2">
          <Show
            when={lesson().materials?.length}
            fallback={
              <Empty
                icon={<Icon icon={Paperclip} />}
                title="Sem materiais nesta aula"
                description="Quando houver arquivos de apoio, eles aparecem aqui para download."
                class="md:p-8"
              />
            }
          >
            <ul class="divide-y rounded-xl border">
              <For each={lesson().materials}>
                {(material) => <MaterialRow material={material} />}
              </For>
            </ul>
          </Show>
        </TabsContent>
        <TabsContent value="anotacoes" class="pt-2">
          <LessonNotes storageKey={`notas:${key()}`} />
        </TabsContent>
      </Tabs>

      <Separator />

      <nav aria-label="Navegação entre aulas" class="grid grid-cols-2 gap-3">
        <div>
          <Show when={siblings().prev}>
            {(prev) => (
              <a
                href={lessonHref(prev())}
                class="group flex h-full items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
              >
                <Icon icon={ChevronLeft} class="text-muted-foreground" />
                <span class="min-w-0">
                  <span class="block text-xs text-muted-foreground">Anterior</span>
                  <span class="block truncate font-medium">{prev().lesson.title}</span>
                </span>
              </a>
            )}
          </Show>
        </div>
        <div>
          <Show when={siblings().next}>
            {(next) => (
              <a
                href={lessonHref(next())}
                class="group flex h-full items-center justify-end gap-3 rounded-lg border p-3 text-right text-sm transition-colors hover:bg-accent"
              >
                <span class="min-w-0">
                  <span class="block text-xs text-muted-foreground">Próxima aula</span>
                  <span class="block truncate font-medium">{next().lesson.title}</span>
                </span>
                <Icon icon={ChevronRight} class="text-muted-foreground" />
              </a>
            )}
          </Show>
        </div>
      </nav>
    </div>
  );
}

const materialIcon = { PDF: FileText, XLSX: FileSpreadsheet, ZIP: FileArchive, Link } as const;

function MaterialRow(props: { material: Material }) {
  return (
    <li class="flex items-center gap-3 p-3">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon icon={materialIcon[props.material.format]} class="text-muted-foreground" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-medium">{props.material.name}</span>
        <span class="text-xs text-muted-foreground">
          {props.material.format}
          {props.material.size ? ` · ${props.material.size}` : ''}
        </span>
      </span>
      <a
        href={props.material.href}
        download
        class={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        <Icon icon={Download} />
        <span class="max-sm:sr-only">Baixar</span>
      </a>
    </li>
  );
}

function PlayerMessage(props: {
  title: string;
  description?: string;
  courseId?: string;
  locked?: boolean;
}) {
  return (
    <div class="flex flex-1 p-4 lg:p-6">
      <Title>{`${props.title} · ${platform.name}`}</Title>
      <Empty
        icon={<Icon icon={props.locked ? Lock : ListVideo} />}
        title={props.title}
        description={props.description ?? 'Confira o endereço ou volte para a lista de aulas.'}
      >
        <a
          href={String(props.courseId ? paths.cursos(props.courseId) : paths.cursos())}
          class={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          <Icon icon={ArrowLeft} />
          {props.courseId ? 'Voltar ao curso' : 'Ver meus cursos'}
        </a>
      </Empty>
    </div>
  );
}
