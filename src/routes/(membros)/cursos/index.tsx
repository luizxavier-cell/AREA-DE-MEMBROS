import { Title } from '@solidjs/meta';
import { useSearchParams, type RouteDefinition } from '@solidjs/router';
import { For, Show, createMemo, createSignal } from 'solid-js';
import { Search, SearchX } from 'lucide';

import { CourseCard } from '../../../components/course-card';
import { PageHeader, SiteHeader } from '../../../components/site-header';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/form';
import { Icon } from '../../../components/ui/icon';
import { Empty } from '../../../components/ui/misc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { getCourses, getProgress } from '../../../lib/api';
import { platform } from '../../../lib/config';
import { courseStats, type CourseStatus } from '../../../lib/progress';
import { paths } from '../../../router';

export const route = {
  preload: () => {
    void getCourses();
    void getProgress();
  },
} satisfies RouteDefinition;

type Filter = 'todos' | CourseStatus;

const filters: { value: Filter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'em-andamento', label: 'Em andamento' },
  { value: 'nao-iniciado', label: 'Não iniciados' },
  { value: 'concluido', label: 'Concluídos' },
];

/** Case- and accent-insensitive comparison key. */
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export default function CoursesPage() {
  const [searchParams] = useSearchParams<{ busca?: string }>();
  const courses = createMemo(() => getCourses());
  const progress = createMemo(() => getProgress());

  // The header search lands here as ?busca=…; typing refines it locally.
  const [term, setTerm] = createSignal(() => searchParams.busca ?? '');
  const [filter, setFilter] = createSignal<Filter>('todos');

  const matches = (text: string) => fold(text).includes(fold(term().trim()));

  const enrolled = createMemo(() =>
    courses()
      .filter((course) => course.access === 'liberado')
      .map((course) => ({ course, stats: courseStats(course, progress()) })),
  );

  const counts = createMemo(() => {
    const result: Record<Filter, number> = {
      todos: 0,
      'em-andamento': 0,
      'nao-iniciado': 0,
      concluido: 0,
    };
    for (const entry of enrolled()) {
      result.todos += 1;
      result[entry.stats.status] += 1;
    }
    return result;
  });

  const visible = createMemo(() =>
    enrolled().filter(
      (entry) =>
        (filter() === 'todos' || entry.stats.status === filter()) &&
        matches(`${entry.course.title} ${entry.course.subtitle} ${entry.course.category}`),
    ),
  );

  const storefront = createMemo(() =>
    courses().filter(
      (course) => course.access !== 'liberado' && matches(`${course.title} ${course.subtitle}`),
    ),
  );

  return (
    <>
      <Title>{`Meus cursos · ${platform.name}`}</Title>
      <SiteHeader
        breadcrumbs={[{ label: 'Início', href: String(paths()) }, { label: 'Meus cursos' }]}
      />

      <div class="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Meus cursos"
          description="Todos os cursos incluídos no seu plano, com o seu progresso em cada um."
        />

        <Tabs value={filter()} onValueChange={(value) => setFilter(value as Filter)} class="gap-6">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <TabsList
              aria-label="Filtrar por situação"
              class="max-w-full justify-start overflow-x-auto"
            >
              <For each={filters}>
                {(item) => (
                  <TabsTrigger value={item.value}>
                    {item.label}
                    <span class="rounded-sm bg-muted-foreground/10 px-1.5 text-xs tabular-nums">
                      {counts()[item.value]}
                    </span>
                  </TabsTrigger>
                )}
              </For>
            </TabsList>

            <div class="relative lg:w-72">
              <label for="filtro-cursos" class="sr-only">
                Filtrar cursos
              </label>
              <Icon
                icon={Search}
                class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="filtro-cursos"
                type="search"
                placeholder="Filtrar por nome ou tema…"
                value={term()}
                onInput={(event) => setTerm(event.currentTarget.value)}
                class="pl-8"
              />
            </div>
          </div>

          {/* One panel, labelled by the active tab, lists that filter's courses. */}
          <TabsContent value={filter()}>
            <Show
              when={visible().length > 0}
              fallback={
                <Empty
                  icon={<Icon icon={SearchX} />}
                  title="Nenhum curso encontrado"
                  description="Tente outro termo de busca ou mude o filtro selecionado."
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTerm('');
                      setFilter('todos');
                    }}
                  >
                    Limpar filtros
                  </Button>
                </Empty>
              }
            >
              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                <For each={visible()} keyed={(entry) => entry.course.id}>
                  {(entry) => <CourseCard course={entry().course} stats={entry().stats} />}
                </For>
              </div>
            </Show>
          </TabsContent>
        </Tabs>

        <Show when={storefront().length > 0}>
          <section class="mt-4 space-y-4" aria-labelledby="disponiveis">
            <div class="space-y-1">
              <h2 id="disponiveis" class="text-lg font-semibold tracking-tight">
                Disponíveis para você
              </h2>
              <p class="text-sm text-muted-foreground">
                Conteúdos que ainda não fazem parte do seu plano ou que estão chegando.
              </p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <For each={storefront()} keyed={(course) => course.id}>
                {(course) => <CourseCard course={course()} />}
              </For>
            </div>
          </section>
        </Show>
      </div>
    </>
  );
}
