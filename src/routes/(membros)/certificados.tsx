import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { For, Show, createMemo, createSignal } from 'solid-js';
import { Award, Check, Copy, GraduationCap, Share2 } from 'lucide';

import { PageHeader, SiteHeader } from '../../components/site-header';
import { Button, buttonVariants } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Icon } from '../../components/ui/icon';
import { Empty, Progress } from '../../components/ui/misc';
import { getCertificates, getCourses, getMember, getProgress } from '../../lib/api';
import { platform } from '../../lib/config';
import { courseStats } from '../../lib/progress';
import type { Certificate } from '../../lib/types';
import { cn, formatDate, formatDuration, plural } from '../../lib/utils';
import { paths } from '../../router';

export const route = {
  preload: () => {
    void getMember();
    void getCertificates();
    void getCourses();
    void getProgress();
  },
} satisfies RouteDefinition;

export default function CertificatesPage() {
  const member = createMemo(() => getMember());
  const certificates = createMemo(() => getCertificates());
  const courses = createMemo(() => getCourses());
  const progress = createMemo(() => getProgress());

  // Courses that award a certificate the member has not earned yet.
  const pending = createMemo(() => {
    const earned = new Set(certificates().map((certificate) => certificate.courseId));
    return courses()
      .filter(
        (course) => course.access === 'liberado' && course.certificate && !earned.has(course.id),
      )
      .map((course) => ({ course, stats: courseStats(course, progress()) }));
  });

  return (
    <>
      <Title>{`Certificados · ${platform.name}`}</Title>
      <SiteHeader
        breadcrumbs={[{ label: 'Início', href: String(paths()) }, { label: 'Certificados' }]}
      />

      <div class="flex flex-1 flex-col gap-8 p-4 lg:p-6">
        <PageHeader
          title="Certificados"
          description="Conclua 100% das aulas de um curso com certificado para recebê-lo aqui."
        />

        <Show
          when={certificates().length > 0}
          fallback={
            <Empty
              icon={<Icon icon={Award} />}
              title="Nenhum certificado ainda"
              description="Seu primeiro certificado aparece aqui assim que você concluir um curso."
            >
              <a href={String(paths.cursos())} class={buttonVariants({ size: 'sm' })}>
                Ir para meus cursos
              </a>
            </Empty>
          }
        >
          <div class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            <For each={certificates()} keyed={(certificate) => certificate.id}>
              {(certificate) => (
                <CertificateCard certificate={certificate()} memberName={member().name} />
              )}
            </For>
          </div>
        </Show>

        <Show when={pending().length > 0}>
          <section class="space-y-4" aria-labelledby="a-caminho">
            <div class="space-y-1">
              <h2 id="a-caminho" class="text-lg font-semibold tracking-tight">
                A caminho
              </h2>
              <p class="text-sm text-muted-foreground">
                Cursos com certificado que você ainda está fazendo.
              </p>
            </div>
            <div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              <For each={pending()} keyed={(entry) => entry.course.id}>
                {(entry) => (
                  <Card class="gap-4 py-5">
                    <CardHeader class="px-5">
                      <CardTitle class="leading-snug">
                        <a href={String(paths.cursos(entry().course.id))} class="hover:underline">
                          {entry().course.title}
                        </a>
                      </CardTitle>
                      <CardDescription>
                        <Show
                          when={entry().stats.status !== 'nao-iniciado'}
                          fallback="Você ainda não começou este curso."
                        >
                          Faltam {plural(entry().stats.total - entry().stats.done, 'aula', 'aulas')}{' '}
                          para o certificado.
                        </Show>
                      </CardDescription>
                    </CardHeader>
                    <CardContent class="flex items-center gap-3 px-5">
                      <Progress
                        value={entry().stats.percent}
                        class="h-1.5"
                        aria-label={`Progresso em ${entry().course.title}`}
                      />
                      <span class="w-10 text-right text-sm font-medium tabular-nums">
                        {entry().stats.percent}%
                      </span>
                    </CardContent>
                  </Card>
                )}
              </For>
            </div>
          </section>
        </Show>
      </div>
    </>
  );
}

function CertificateCard(props: { certificate: Certificate; memberName: string }) {
  const [copied, setCopied] = createSignal(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(props.certificate.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code stays visible for manual copy.
    }
  };

  // LinkedIn "Add to profile" link for the certification section.
  const linkedInUrl = () => {
    const issued = new Date(props.certificate.issuedAt);
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: props.certificate.courseTitle,
      organizationName: platform.name,
      issueYear: String(issued.getFullYear()),
      issueMonth: String(issued.getMonth() + 1),
      certId: props.certificate.code,
    });
    return `https://www.linkedin.com/profile/add?${params}`;
  };

  return (
    <Card class="gap-0 overflow-hidden p-0">
      {/* Certificate preview */}
      <div class="relative bg-linear-to-br from-primary/10 via-card to-card p-2">
        <div class="relative flex aspect-[1.414] flex-col items-center justify-center gap-2 rounded-lg border-2 border-double border-primary/30 bg-card px-6 text-center shadow-xs">
          <div
            class="absolute inset-x-0 top-0 h-1.5 rounded-t-md"
            style={{ background: `oklch(0.62 0.19 ${props.certificate.hue})` }}
          />
          <span class="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon icon={GraduationCap} />
          </span>
          <p class="text-[0.625rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Certificado de conclusão
          </p>
          <p class="text-lg font-semibold tracking-tight">{props.memberName}</p>
          <p class="max-w-[85%] text-xs text-muted-foreground">
            concluiu o curso{' '}
            <span class="font-medium text-foreground">{props.certificate.courseTitle}</span>, com
            carga horária de {formatDuration(props.certificate.workloadSec)}.
          </p>
          <p class="mt-1 text-[0.625rem] text-muted-foreground">
            {platform.name} · {formatDate(props.certificate.issuedAt)}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-3 border-t p-4">
        <div class="flex items-center justify-between gap-2 text-sm">
          <span class="text-muted-foreground">Código de validação</span>
          <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {props.certificate.code}
          </code>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={copyCode}>
            <Show
              when={copied()}
              fallback={
                <>
                  <Icon icon={Copy} />
                  Copiar código
                </>
              }
            >
              <Icon icon={Check} class="text-success" />
              Copiado
            </Show>
          </Button>
          <a
            href={linkedInUrl()}
            target="_blank"
            rel="noopener noreferrer"
            class={cn(buttonVariants({ size: 'sm' }))}
          >
            <Icon icon={Share2} />
            LinkedIn
          </a>
        </div>
      </div>
    </Card>
  );
}
