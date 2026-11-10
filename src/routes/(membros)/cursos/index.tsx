import { Title } from '@solidjs/meta';
import { useSearchParams, type RouteDefinition } from '@solidjs/router';
import { For, Show, createMemo, createSignal } from 'solid-js';
import { Search, SearchX } from 'lucide';

import { CourseCard } from '../../../components/course-card';
import { Button } from '../../../components/ui/button';
import { Icon } from '../../../components/ui/icon';
import { Empty } from '../../../components/ui/misc';
import { getCourses, getProgress } from '../../../lib/api';
import { platform } from '../../../lib/config';
import { courseStats, type CourseStatus } from '../../../lib/progress';

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

const grid = 'grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5';

export default function CoursesPage() {
  const [searchParams] = useSearchParams<{ busca?: string }>();
  const courses = createMemo(() => getCourses());
  const progress = createMemo(() => getProgress());

  // The header search lands here as ?busca=…; typing refines it locally.
  const [term, setTerm] = createSignal(() => searchParams.busca ?? '');
  const [filter, setFilter] = createSignal<Filter>('todos');

  const matches = (text: string) => fold(text).includes(fold(term().trim()));

  const visible = createMemo(() =>
    courses()
      .filter((course) => course.access === 'liberado')
      .map((course) => ({ course, stats: courseStats(course, progress()) }))
      .filter(
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

      <div class="flex flex-1 flex-col gap-8 px-4 pt-6 sm:px-6 lg:px-12 lg:pt-10">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h1 class="text-3xl font-semibold tracking-tight">Meus cursos</h1>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              role="group"
              aria-label="Filtrar por situação"
              class="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
            >
              <For each={filters}>
                {(item) => (
                  <button
                    type="button"
                    aria-pressed={filter() === item.value ? 'true' : 'false'}
                    class="h-9 shrink-0 rounded-full bg-foreground/5 px-4 text-sm font-medium whitespace-nowrap text-foreground/80 transition-colors outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-foreground aria-pressed:text-background"
                    onClick={() => setFilter(item.value)}
                  >
                    {item.label}
                  </button>
                )}
              </For>
            </div>
            <div class="relative sm:w-64">
              <label for="filtro-cursos" class="sr-only">
                Filtrar cursos
              </label>
              <Icon
                icon={Search}
                class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="filtro-cursos"
                type="search"
                placeholder="Filtrar por nome ou tema…"
                value={term()}
                onInput={(event) => setTerm(event.currentTarget.value)}
                class="h-9 w-full rounded-full border border-input bg-transparent pr-4 pl-10 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>
          </div>
        </div>

        <section aria-labelledby="do-plano">
          <h2 id="do-plano" class="sr-only">
            Cursos do seu plano
          </h2>
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
            <div class={grid}>
              <For each={visible()} keyed={(entry) => entry.course.id}>
                {(entry) => <CourseCard course={entry().course} stats={entry().stats} />}
              </For>
            </div>
          </Show>
        </section>

        <Show when={storefront().length > 0}>
          <section class="space-y-4" aria-labelledby="disponiveis">
            <h2 id="disponiveis" class="text-lg font-semibold tracking-tight md:text-xl">
              Disponíveis para você
            </h2>
            <div class={grid}>
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
