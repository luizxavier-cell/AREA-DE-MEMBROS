import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { For, Show, createMemo } from 'solid-js';
import type { JSX } from '@solidjs/web';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarClock,
  CalendarPlus,
  CircleCheck,
  Clock,
  Megaphone,
  Pin,
  Play,
  type IconNode,
} from 'lucide';

import { CourseCard } from '../../components/course-card';
import { CourseCover } from '../../components/course-cover';
import { PageHeader, SiteHeader } from '../../components/site-header';
import { Badge } from '../../components/ui/badge';
import { buttonVariants } from '../../components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Icon } from '../../components/ui/icon';
import { Progress } from '../../components/ui/misc';
import {
  getAnnouncements,
  getCertificates,
  getCourses,
  getMember,
  getNextLive,
  getProgress,
} from '../../lib/api';
import { googleCalendarUrl } from '../../lib/calendar';
import { platform } from '../../lib/config';
import { courseStats, type CourseStatus } from '../../lib/progress';
import { cn, formatDate, formatDateTime, formatDuration, plural } from '../../lib/utils';
import { paths } from '../../router';

export const route = {
  preload: () => {
    void getMember();
    void getCourses();
    void getProgress();
    void getAnnouncements();
    void getNextLive();
    void getCertificates();
  },
} satisfies RouteDefinition;

// Courses in progress first, then not started, then finished.
const statusOrder: Record<CourseStatus, number> = {
  'em-andamento': 0,
  'nao-iniciado': 1,
  concluido: 2,
};

export default function Home() {
  const member = createMemo(() => getMember());
  const courses = createMemo(() => getCourses());
  const progress = createMemo(() => getProgress());
  const certificates = createMemo(() => getCertificates());

  const enrolled = createMemo(() =>
    courses()
      .filter((course) => course.access === 'liberado')
      .map((course) => ({ course, stats: courseStats(course, progress()) })),
  );

  const current = createMemo(() => {
    const list = enrolled();
    return (
      list.find(
        (entry) =>
          entry.course.id === progress().lastCourseId && entry.stats.status !== 'concluido',
      ) ??
      list.find((entry) => entry.stats.status === 'em-andamento') ??
      list.find((entry) => entry.stats.status === 'nao-iniciado')
    );
  });

  const featured = createMemo(() =>
    enrolled()
      .toSorted((a, b) => statusOrder[a.stats.status] - statusOrder[b.stats.status])
      .slice(0, 4),
  );

  const totals = createMemo(() => {
    const list = enrolled();
    return {
      courses: list.length,
      studying: list.filter((entry) => entry.stats.status === 'em-andamento').length,
      lessons: list.reduce((n, entry) => n + entry.stats.total, 0),
      lessonsDone: list.reduce((n, entry) => n + entry.stats.done, 0),
      doneSec: list.reduce((n, entry) => n + entry.stats.doneSec, 0),
      completed: list.filter((entry) => entry.stats.status === 'concluido').length,
    };
  });

  return (
    <>
      <Title>{`Início · ${platform.name}`}</Title>
      <SiteHeader breadcrumbs={[{ label: 'Início' }]} />

      <div class="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title={`Olá, ${member().name.split(' ')[0]}!`}
          description="Que bom ter você de volta. Continue de onde parou."
        />

        <Show when={current()}>
          {(entry) => (
            <Card class="gap-0 overflow-hidden p-0 md:flex-row">
              <CourseCover
                course={entry().course}
                compact
                class="aspect-[2/1] shrink-0 md:aspect-auto md:w-64 lg:w-72"
              />
              <div class="flex flex-1 flex-col gap-5 p-5 lg:p-6">
                <div class="space-y-1.5">
                  <p class="text-xs font-medium tracking-wider text-primary uppercase">
                    Continue de onde parou
                  </p>
                  <h2 class="text-xl font-semibold tracking-tight">{entry().course.title}</h2>
                  <Show when={entry().stats.resume}>
                    {(resume) => (
                      <p class="text-sm text-muted-foreground">
                        Próxima aula:{' '}
                        <span class="font-medium text-foreground">{resume().lesson.title}</span>
                        {' · '}
                        {resume().module.title}
                      </p>
                    )}
                  </Show>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">
                      {entry().stats.done} de{' '}
                      {plural(entry().stats.total, 'aula concluída', 'aulas concluídas')}
                    </span>
                    <span class="font-medium tabular-nums">{entry().stats.percent}%</span>
                  </div>
                  <Progress value={entry().stats.percent} aria-label="Progresso do curso" />
                </div>
                <div class="mt-auto flex flex-wrap gap-2">
                  <Show when={entry().stats.resume}>
                    {(resume) => (
                      <a
                        class={buttonVariants()}
                        href={String(paths.cursos(entry().course.id).aulas(resume().lesson.id))}
                      >
                        <Icon icon={Play} class="fill-current" />
                        {entry().stats.done > 0 ? 'Continuar aula' : 'Começar curso'}
                      </a>
                    )}
                  </Show>
                  <a
                    class={buttonVariants({ variant: 'outline' })}
                    href={String(paths.cursos(entry().course.id))}
                  >
                    Ver conteúdo do curso
                  </a>
                </div>
              </div>
            </Card>
          )}
        </Show>

        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
          <StatCard
            label="Cursos em andamento"
            value={String(totals().studying)}
            icon={BookOpen}
            footer={`${plural(totals().courses, 'curso liberado', 'cursos liberados')} no seu plano`}
          />
          <StatCard
            label="Aulas concluídas"
            value={String(totals().lessonsDone)}
            icon={CircleCheck}
            footer={`de ${plural(totals().lessons, 'aula disponível', 'aulas disponíveis')}`}
          />
          <StatCard
            label="Tempo de estudo"
            value={formatDuration(totals().doneSec)}
            icon={Clock}
            footer="em aulas concluídas"
          />
          <StatCard
            label="Certificados"
            value={String(certificates().length)}
            icon={Award}
            footer={
              <a
                href={String(paths.certificados())}
                class="underline-offset-4 hover:text-foreground hover:underline"
              >
                Ver certificados
              </a>
            }
          />
        </div>

        <div class="grid gap-6 xl:grid-cols-3">
          <section class="space-y-4 xl:col-span-2" aria-labelledby="meus-cursos">
            <div class="flex items-center justify-between gap-2">
              <h2 id="meus-cursos" class="text-lg font-semibold tracking-tight">
                Meus cursos
              </h2>
              <a
                href={String(paths.cursos())}
                class={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                Ver todos
                <Icon icon={ArrowRight} />
              </a>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <For each={featured()} keyed={(entry) => entry.course.id}>
                {(entry) => <CourseCard course={entry().course} stats={entry().stats} />}
              </For>
            </div>
          </section>

          <aside class="flex flex-col gap-6">
            <LiveCard />
            <AnnouncementsCard />
          </aside>
        </div>
      </div>
    </>
  );
}

function StatCard(props: { label: string; value: string; icon: IconNode; footer: JSX.Element }) {
  return (
    <Card class="@container/card gap-3 py-5">
      <CardHeader class="px-5">
        <CardDescription>{props.label}</CardDescription>
        <CardTitle class="text-2xl font-semibold tabular-nums @[200px]/card:text-3xl">
          {props.value}
        </CardTitle>
        <CardAction>
          <span class="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon icon={props.icon} />
          </span>
        </CardAction>
      </CardHeader>
      <CardFooter class="px-5 text-sm text-muted-foreground">{props.footer}</CardFooter>
    </Card>
  );
}

function LiveCard() {
  const live = createMemo(() => getNextLive());
  return (
    <Card class="gap-4">
      <CardHeader>
        <CardDescription class="flex items-center gap-2">
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span class="relative inline-flex size-2 rounded-full bg-red-500" />
          </span>
          Próxima mentoria ao vivo
        </CardDescription>
        <CardTitle class="text-base leading-snug">{live().title}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm text-muted-foreground">
        <p class="flex items-center gap-2">
          <Icon icon={CalendarClock} />
          <span class="inline-block first-letter:uppercase">{formatDateTime(live().startsAt)}</span>
        </p>
        <p class="flex items-center gap-2">
          <Icon icon={Clock} />
          {live().durationMin} min · com {live().host}
        </p>
      </CardContent>
      <CardFooter class="gap-2">
        <a
          href={googleCalendarUrl(live())}
          target="_blank"
          rel="noopener noreferrer"
          class={cn(buttonVariants({ size: 'sm' }), 'flex-1')}
        >
          <Icon icon={CalendarPlus} />
          Adicionar à agenda
        </a>
      </CardFooter>
    </Card>
  );
}

function AnnouncementsCard() {
  const announcements = createMemo(() => getAnnouncements());
  return (
    <Card class="gap-4">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Icon icon={Megaphone} class="text-muted-foreground" />
          Avisos de {platform.creator.name.split(' ')[0]}
        </CardTitle>
        <CardDescription>Novidades e comunicados da plataforma.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul class="space-y-4">
          <For each={announcements()}>
            {(item) => (
              <li
                class="space-y-1 border-l-2 pl-3 data-pinned:border-primary"
                data-pinned={item.pinned || undefined}
              >
                <div class="flex items-center gap-2">
                  <p class="text-sm leading-snug font-medium">{item.title}</p>
                  <Show when={item.pinned}>
                    <Badge variant="outline" class="ml-auto">
                      <Icon icon={Pin} />
                      Fixado
                    </Badge>
                  </Show>
                </div>
                <p class="text-sm text-muted-foreground">{item.body}</p>
                <p class="text-xs text-muted-foreground">{formatDate(item.publishedAt)}</p>
              </li>
            )}
          </For>
        </ul>
      </CardContent>
    </Card>
  );
}
