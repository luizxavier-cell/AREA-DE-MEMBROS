import type { Meta, StoryObj } from 'storybook-solidjs-vite';

import { Screen } from './screen';

// The lesson player in each of its states, rendered by the real app.
const meta = {
  title: 'Telas/Player de aula',
  component: Screen,
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: { url: { control: 'text' } },
} satisfies Meta<typeof Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AulaEmVideo: Story = {
  name: 'Aula em vídeo',
  args: { url: '/cursos/metodo-criador/aulas/reaproveitar' },
};

export const AulaComMateriais: Story = {
  name: 'Aula em texto com materiais',
  args: { url: '/cursos/kit-de-templates/aulas/midia-kit' },
};

export const GravacaoAoVivo: Story = {
  name: 'Gravação de mentoria ao vivo',
  args: { url: '/cursos/mentorias-ao-vivo/aulas/mentoria-10' },
};

export const ModuloNaoLiberado: Story = {
  name: 'Módulo ainda não liberado',
  args: { url: '/cursos/metodo-criador/aulas/precificacao' },
};

export const CursoForaDoPlano: Story = {
  name: 'Curso fora do plano',
  args: { url: '/cursos/masterclass-negocio-digital/aulas/funil' },
};

export const AulaNaoEncontrada: Story = {
  name: 'Aula não encontrada',
  args: { url: '/cursos/metodo-criador/aulas/aula-que-nao-existe' },
};

export const PlayerCelular: Story = {
  name: 'Aula em vídeo — celular',
  args: { url: '/cursos/metodo-criador/aulas/reaproveitar' },
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};
