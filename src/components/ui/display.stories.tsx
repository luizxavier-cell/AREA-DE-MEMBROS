import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { BookOpen, SearchX } from 'lucide';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { Breadcrumbs } from './breadcrumb';
import { buttonVariants } from './button';
import { Icon } from './icon';
import { Avatar, Empty, Kbd, Progress, Separator, Skeleton } from './misc';

const meta = {
  title: 'UI/Display',
  component: Progress,
  subcomponents: { Avatar, Separator, Skeleton, Kbd, Empty, Breadcrumbs, Accordion },
  args: { value: 35 },
  argTypes: { value: { control: { type: 'range', min: 0, max: 100, step: 1 } } },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProgressBar: Story = {
  render: (args) => (
    <div class="w-80 space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">7 de 20 aulas concluídas</span>
        <span class="font-medium tabular-nums">{args.value}%</span>
      </div>
      <Progress {...args} aria-label="Progresso do curso" />
    </div>
  ),
};

export const Avatars: Story = {
  render: () => (
    <div class="flex items-center gap-3">
      <Avatar name="Ana Beatriz Souza" />
      <Avatar name="Marina Duarte" class="size-10" fallbackClass="bg-primary/10 text-primary" />
      <Avatar name="Rafael Lima" class="size-12 rounded-lg" fallbackClass="rounded-lg" />
    </div>
  ),
};

export const BreadcrumbTrail: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: 'Início', href: '#' },
        { label: 'Meus cursos', href: '#' },
        { label: 'Método Criador Essencial' },
      ]}
    />
  ),
};

export const FaqAccordion: Story = {
  render: () => (
    <Accordion class="w-[28rem] rounded-xl border px-5">
      <AccordionItem name="faq" open>
        <AccordionTrigger>Por quanto tempo terei acesso aos cursos?</AccordionTrigger>
        <AccordionContent class="text-muted-foreground">
          Enquanto o seu plano estiver ativo.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem name="faq">
        <AccordionTrigger>Posso assistir pelo celular?</AccordionTrigger>
        <AccordionContent class="text-muted-foreground">
          Sim, em qualquer navegador.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const LoadingSkeleton: Story = {
  render: () => (
    <div class="w-72 space-y-3 rounded-xl border p-3">
      <Skeleton class="aspect-video w-full" />
      <Skeleton class="h-4 w-3/4" />
      <Skeleton class="h-3 w-1/2" />
    </div>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <Empty
      class="w-[28rem]"
      icon={<Icon icon={SearchX} />}
      title="Nenhum curso encontrado"
      description="Tente outro termo de busca ou mude o filtro selecionado."
    >
      <a href="#" class={buttonVariants({ variant: 'outline', size: 'sm' })}>
        <Icon icon={BookOpen} />
        Ver meus cursos
      </a>
    </Empty>
  ),
};

export const Misc: Story = {
  render: () => (
    <div class="flex h-6 items-center gap-3 text-sm">
      <span>Alternar menu</span>
      <Kbd>⌘</Kbd>
      <Kbd>B</Kbd>
      <Separator orientation="vertical" />
      <span class="text-muted-foreground">Separador vertical</span>
    </div>
  ),
};
