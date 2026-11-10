import { Title } from '@solidjs/meta';
import type { RouteProps } from '@solidjs/router';
import { defineFileRoute } from '@solidjs/router/fs';
import { For, Match, Show, Switch, createMemo } from 'solid-js';
import {
  ArrowLeft,
  Award,
  BellRing,
  CalendarClock,
  Check,
  CirclePlay,
  Clock,
  Layers,
  Play,
  RotateCcw,
  ShoppingBag,
  type IconNode,
} from 'lucide';

import { CourseCover } from '../../../../components/course-cover';
import { CourseOutline } from '../../../../components/course-outline';
import { SiteHeader } from '../../../../components/site-header';
import { Badge } from '../../../../components/ui/badge';
import { Button, buttonVariants } from '../../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Icon } from '../../../../components/ui/icon';
import { Avatar, Empty, Progress } from '../../../../components/ui/misc';
import { getCourse, getProgress } from '../../../../lib/api';
import { platform } from '../../../../lib/config';
import { courseStats } from '../../../../lib/progress';
import type { Course, Progress as ProgressData } from '../../../../lib/types';
import { cn, formatDate, formatDuration, plural } from '../../../../lib/utils';
import { paths } from '../../../../router';

export const route = defineFileRoute('/cursos/:curso', {
  preload: ({ params }) => {
    void getCourse(params.curso);
    void getProgress();
  },
});

export default function CoursePage(props: RouteProps<typeof route>) {
  const course = createMemo(() => getCourse(props.params.curso));
  const progress = createMemo(() => getProgress());

  return (
    <Show when={course()} fallback={<CourseNotFound />}>
      {(found) => <CourseView course={found()} progress={progress()} />}
    </Show>
  );
}

function CourseView(props: { course: Course; progress: ProgressData }) {
  const stats = createMemo(() => courseStats(props.course, props.progress));
  const lessonCount = () =>
    props.course.modules.reduce((n, module) => n + module.lessons.length, 0);

  return (
    <>
      <Title>{`${props.course.title} · ${platform.name}`}</Title>
      <SiteHeader
        breadcrumbs={[
          { label: 'Início', href: String(paths()) },
          { label: 'Meus cursos', href: String(paths.cursos()) },
          { label: props.course.title },
        ]}
      />

      {/* One grid: on large screens the side column spans both rows, so the
          hero and the course outline stack without a gap beside it. */}
      <div class="grid flex-1 content-start gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:p-6">
        <div class="flex flex-col gap-5 lg:col-start-1 lg:row-start-1">
          <div class="flex flex-wrap gap-2">
            <Badge variant="secondary">{props.course.category}</Badge>
            <Badge variant="outline">{props.course.level}</Badge>
            <Show when={props.course.certificate}>
              <Badge variant="outline">
                <Icon icon={Award} />
                Com certificado
              </Badge>
            </Show>
          </div>
          <div class="space-y-3">
            <h1 class="text-3xl font-semibold tracking-tight text-balance">{props.course.title}</h1>
            <p class="text-lg text-pretty text-muted-foreground">{props.course.subtitle}</p>
          </div>
          <div class="flex items-center gap-3">
            <Avatar
              name={props.course.instructor}
              class="size-9"
              fallbackClass="bg-primary/10 text-primary"
            />
            <div class="text-sm leading-tight">
              <p class="font-medium">{props.course.instructor}</p>
              <p class="text-muted-foreground">Instrutor(a)</p>
            </div>
          </div>
          <dl class="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 shadow-xs sm:grid-cols-4">
            <Fact icon={Layers} label="Módulos" value={String(props.course.modules.length)} />
            <Fact icon={CirclePlay} label="Aulas" value={String(lessonCount())} />
            <Fact icon={Clock} label="Duração" value={formatDuration(stats().durationSec)} />
            <Fact
              icon={CalendarClock}
              label="Atualizado em"
              value={formatDate(props.course.updatedAt)}
            />
          </dl>
        </div>

        <aside class="flex flex-col gap-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Card class="gap-0 overflow-hidden p-0">
            <CourseCover
              course={props.course}
              locked={props.course.access !== 'liberado'}
              compact
              class="aspect-[2/1] lg:aspect-video"
            />
            <div class="space-y-4 p-5">
              <Switch>
                <Match when={props.course.access === 'bloqueado'}>
                  <div class="space-y-1">
                    <p class="font-medium">Este curso não faz parte do seu plano</p>
                    <p class="text-sm text-muted-foreground">
                      Desbloqueie para assistir a todas as aulas e receber o certificado.
                    </p>
                  </div>
                  <a href={props.course.offerUrl ?? '#'} class={cn(buttonVariants(), 'w-full')}>
                    <Icon icon={ShoppingBag} />
                    Quero ter acesso
                  </a>
                </Match>
                <Match when={props.course.access === 'em-breve'}>
                  <div class="space-y-1">
                    <p class="font-medium">Em breve na plataforma</p>
                    <p class="text-sm text-muted-foreground">
                      Lançamento previsto para{' '}
                      {formatDate(props.course.launchAt ?? props.course.updatedAt)}.
                    </p>
                  </div>
                  <Button variant="outline" class="w-full" disabled>
                    <Icon icon={BellRing} />
                    Você será avisada(o) no lançamento
                  </Button>
                </Match>
                <Match when={props.course.access === 'liberado'}>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-muted-foreground">
                        {stats().done} de{' '}
                        {plural(stats().total, 'aula concluída', 'aulas concluídas')}
                      </span>
                      <span class="font-medium tabular-nums">{stats().percent}%</span>
                    </div>
                    <Progress value={stats().percent} aria-label="Progresso do curso" />
                  </div>
                  <Show when={stats().resume}>
                    {(resume) => (
                      <a
                        href={String(paths.cursos(props.course.id).aulas(resume().lesson.id))}
                        class={cn(buttonVariants(), 'w-full')}
                      >
                        <Switch>
                          <Match when={stats().status === 'concluido'}>
                            <Icon icon={RotateCcw} />
                            Rever o curso
                          </Match>
                          <Match when={stats().status === 'em-andamento'}>
                            <Icon icon={Play} class="fill-current" />
                            Continuar de onde parei
                          </Match>
                          <Match when={stats().status === 'nao-iniciado'}>
                            <Icon icon={Play} class="fill-current" />
                            Começar o curso
                          </Match>
                        </Switch>
                      </a>
                    )}
                  </Show>
                  <Show when={stats().status === 'em-andamento' && stats().resume}>
                    {(resume) => (
                      <p class="text-center text-xs text-muted-foreground">
                        Próxima: {resume().lesson.title}
                      </p>
                    )}
                  </Show>
                </Match>
              </Switch>
            </div>
          </Card>

          <Card class="gap-4">
            <CardHeader>
              <CardTitle>O que você vai aprender</CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-2.5 text-sm">
                <For each={props.course.outcomes}>
                  {(outcome) => (
                    <li class="flex gap-2.5">
                      <Icon icon={Check} class="mt-0.5 text-success" />
                      <span>{outcome}</span>
                    </li>
                  )}
                </For>
              </ul>
            </CardContent>
          </Card>

          <Card class="gap-4">
            <CardHeader>
              <CardTitle>Sobre este curso</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm/relaxed text-muted-foreground">{props.course.description}</p>
            </CardContent>
          </Card>

          <Show when={props.course.certificate && props.course.access === 'liberado'}>
            <Card class="gap-4 bg-linear-to-br from-primary/10 to-card">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Icon icon={Award} class="text-primary" />
                  Certificado de conclusão
                </CardTitle>
                <CardDescription>
                  <Show
                    when={stats().status === 'concluido'}
                    fallback={`Conclua todas as aulas para receber o seu certificado (faltam ${stats().total - stats().done}).`}
                  >
                    Parabéns! Seu certificado já está disponível.
                  </Show>
                </CardDescription>
              </CardHeader>
              <Show when={stats().status === 'concluido'}>
                <CardContent>
                  <a
                    href={String(paths.certificados())}
                    class={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                  >
                    Ver certificado
                  </a>
                </CardContent>
              </Show>
            </Card>
          </Show>
        </aside>

        <section class="space-y-4 lg:col-start-1 lg:row-start-2" aria-labelledby="conteudo">
          <div class="flex items-end justify-between gap-2">
            <h2 id="conteudo" class="text-lg font-semibold tracking-tight">
              Conteúdo do curso
            </h2>
            <p class="text-sm text-muted-foreground">
              {plural(props.course.modules.length, 'módulo', 'módulos')} ·{' '}
              {plural(lessonCount(), 'aula', 'aulas')}
            </p>
          </div>
          <CourseOutline course={props.course} progress={props.progress} />
        </section>
      </div>
    </>
  );
}

function Fact(props: { icon: IconNode; label: string; value: string }) {
  return (
    <div class="space-y-1">
      <dt class="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon icon={props.icon} class="size-3.5" />
        {props.label}
      </dt>
      <dd class="font-medium tabular-nums">{props.value}</dd>
    </div>
  );
}

function CourseNotFound() {
  return (
    <>
      <Title>{`Curso não encontrado · ${platform.name}`}</Title>
      <SiteHeader
        breadcrumbs={[
          { label: 'Início', href: String(paths()) },
          { label: 'Meus cursos', href: String(paths.cursos()) },
          { label: 'Curso não encontrado' },
        ]}
      />
      <div class="flex flex-1 p-4 lg:p-6">
        <Empty
          level={1}
          icon={<Icon icon={Layers} />}
          title="Curso não encontrado"
          description="O endereço pode ter mudado ou o curso não está mais disponível."
        >
          <a
            href={String(paths.cursos())}
            class={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <Icon icon={ArrowLeft} />
            Voltar para Meus cursos
          </a>
        </Empty>
      </div>
    </>
  );
}
