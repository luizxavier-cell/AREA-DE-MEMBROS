import type { Meta, StoryObj } from 'storybook-solidjs-vite';

import { Screen } from './screen';

// Full screens of the members area, rendered by the real app at each URL.
// Links work inside the story (in-memory router); data comes from
// src/lib/mock-data.ts through src/lib/api.ts.
const meta = {
  title: 'Telas/Área de membros',
  id: 'telas-area-de-membros',
  component: Screen,
  // One router per story: keep these out of the multi-story Docs page.
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: { url: { control: 'text' } },
} satisfies Meta<typeof Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inicio: Story = { name: 'Início', args: { url: '/' } };

export const MeusCursos: Story = { name: 'Meus cursos', args: { url: '/cursos' } };

export const BuscaSemResultado: Story = {
  name: 'Meus cursos — busca sem resultado',
  args: { url: '/cursos?busca=astronomia' },
};

export const CursoEmAndamento: Story = {
  name: 'Curso — em andamento',
  args: { url: '/cursos/metodo-criador' },
};

export const CursoConcluido: Story = {
  name: 'Curso — concluído',
  args: { url: '/cursos/bio-que-converte' },
};

export const CursoBloqueado: Story = {
  name: 'Curso — fora do plano',
  args: { url: '/cursos/masterclass-negocio-digital' },
};

export const CursoEmBreve: Story = {
  name: 'Curso — em breve',
  args: { url: '/cursos/fotografia-mobile' },
};

export const CursoNaoEncontrado: Story = {
  name: 'Curso — não encontrado',
  args: { url: '/cursos/curso-que-nao-existe' },
};

export const Certificados: Story = { name: 'Certificados', args: { url: '/certificados' } };

export const MinhaConta: Story = { name: 'Minha conta', args: { url: '/conta' } };

export const Ajuda: Story = { name: 'Ajuda', args: { url: '/ajuda' } };

export const InicioCelular: Story = {
  name: 'Início — celular',
  args: { url: '/' },
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};
