import { Title } from '@solidjs/meta';
import type { RouteProps } from '@solidjs/router';
import { defineFileRoute } from '@solidjs/router/fs';
import { For, Match, Show, Switch, createMemo } from 'solid-js';
import { ArrowLeft, BellRing, Check, Layers, Play, RotateCcw, ShoppingBag } from 'lucide';

import {
  Billboard,
  BillboardProgress,
  Eyebrow,
  billboardButton,
} from '../../../../components/billboard';
import { CourseOutline } from '../../../../components/course-outline';
import { buttonVariants } from '../../../../components/ui/button';
import { Icon } from '../../../../components/ui/icon';
import { Empty } from '../../../../components/ui/misc';
import { getCourse, getProgress } from '../../../../lib/api';
import { platform } from '../../../../lib/config';
import { courseStats } from '../../../../lib/progress';
import type { Course, Progress as ProgressData } from '../../../../lib/types';
import { formatDate, formatDuration, plural } from '../../../../lib/utils';
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

      <Billboard course={props.course} class="md:min-h-[min(64svh,36rem)]">
        <Eyebrow>{props.course.category}</Eyebrow>
        <div class="space-y-3">
          <h1 class="text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
            {props.course.title}
          </h1>
          <p class="text-sm text-muted-foreground">
            {props.course.level} · {plural(props.course.modules.length, 'módulo', 'módulos')} ·{' '}
            {plural(lessonCount(), 'aula', 'aulas')} · {formatDuration(stats().durationSec)}
          </p>
        </div>
        <p class="text-base text-pretty text-foreground/85 md:text-lg">{props.course.subtitle}</p>

        <Switch>
          <Match when={props.course.access === 'bloqueado'}>
            <div class="space-y-3">
              <a href={props.course.offerUrl ?? '#'} class={billboardButton.primary}>
                <Icon icon={ShoppingBag} />
                Quero ter acesso
              </a>
              <p class="text-sm text-muted-foreground">Este curso não faz parte do seu plano.</p>
            </div>
          </Match>
          <Match when={props.course.access === 'em-breve'}>
            <p class="inline-flex items-center gap-2 rounded-md bg-foreground/10 px-4 py-2.5 text-sm font-medium">
              <Icon icon={BellRing} />
              Lançamento em {formatDate(props.course.launchAt ?? props.course.updatedAt)} — você
              será avisada(o)
            </p>
          </Match>
          <Match when={props.course.access === 'liberado' && stats().resume}>
            {(resume) => (
              <>
                <a
                  href={String(paths.cursos(props.course.id).aulas(resume().lesson.id))}
                  class={billboardButton.primary}
                >
                  <Switch>
                    <Match when={stats().status === 'concluido'}>
                      <Icon icon={RotateCcw} />
                      Rever o curso
                    </Match>
                    <Match when={stats().status === 'em-andamento'}>
                      <Icon icon={Play} class="fill-current" />
                      Continuar
                    </Match>
                    <Match when={stats().status === 'nao-iniciado'}>
                      <Icon icon={Play} class="fill-current" />
                      Começar o curso
                    </Match>
                  </Switch>
                </a>
                <Show when={stats().status !== 'nao-iniciado'}>
                  <div class="w-full space-y-2">
                    <BillboardProgress
                      percent={stats().percent}
                      caption={`${stats().done} de ${plural(stats().total, 'aula', 'aulas')}`}
                      label="Progresso do curso"
                    />
                    <Show when={stats().status === 'em-andamento'}>
                      <p class="truncate text-sm text-muted-foreground">
                        Próxima: <span class="text-foreground">{resume().lesson.title}</span>
                      </p>
                    </Show>
                  </div>
                </Show>
              </>
            )}
          </Match>
        </Switch>
      </Billboard>

      <div class="grid gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 lg:px-12">
        <section aria-labelledby="conteudo" class="space-y-4">
          <div class="flex items-baseline justify-between gap-3">
            <h2 id="conteudo" class="text-xl font-semibold tracking-tight">
              Conteúdo
            </h2>
            <p class="text-sm text-muted-foreground">
              {plural(props.course.modules.length, 'módulo', 'módulos')} ·{' '}
              {plural(lessonCount(), 'aula', 'aulas')}
            </p>
          </div>
          <CourseOutline course={props.course} progress={props.progress} />
        </section>

        <aside class="space-y-8 text-sm">
          <section aria-labelledby="sobre" class="space-y-2">
            <h2 id="sobre" class="text-base font-semibold">
              Sobre o curso
            </h2>
            <p class="leading-relaxed text-muted-foreground">{props.course.description}</p>
          </section>

          <section aria-labelledby="aprender" class="space-y-3">
            <h2 id="aprender" class="text-base font-semibold">
              O que você vai aprender
            </h2>
            <ul class="space-y-2">
              <For each={props.course.outcomes}>
                {(outcome) => (
                  <li class="flex gap-2.5">
                    <Icon icon={Check} class="mt-0.5 text-success" />
                    <span>{outcome}</span>
                  </li>
                )}
              </For>
            </ul>
          </section>

          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <dt class="text-muted-foreground">Instrutor(a)</dt>
            <dd>{props.course.instructor}</dd>
            <dt class="text-muted-foreground">Atualizado em</dt>
            <dd>{formatDate(props.course.updatedAt)}</dd>
            <Show when={props.course.certificate}>
              <dt class="text-muted-foreground">Certificado</dt>
              <dd>
                <Switch fallback="Ao concluir todas as aulas">
                  <Match
                    when={props.course.access === 'liberado' && stats().status === 'concluido'}
                  >
                    <a
                      href={String(paths.certificados())}
                      class="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Disponível — ver certificado
                    </a>
                  </Match>
                  <Match when={props.course.access === 'liberado'}>
                    Ao concluir todas as aulas (faltam {stats().total - stats().done})
                  </Match>
                </Switch>
              </dd>
            </Show>
          </dl>
        </aside>
      </div>
    </>
  );
}

function CourseNotFound() {
  return (
    <>
      <Title>{`Curso não encontrado · ${platform.name}`}</Title>
      <div class="flex flex-1 px-4 pt-6 sm:px-6 lg:px-12 lg:pt-10">
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
