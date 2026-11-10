import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { ArrowRight, Download, Play } from 'lucide';

import { Button, buttonVariants } from './button';
import { Icon } from './icon';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Continuar aula',
    variant: 'default',
    size: 'default',
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm'],
    },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: 'secondary', children: 'Ver curso' } };

export const Outline: Story = { args: { variant: 'outline', children: 'Ver conteúdo do curso' } };

export const Ghost: Story = { args: { variant: 'ghost', children: 'Ver todos' } };

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Cancelar assinatura' },
};

export const Link: Story = { args: { variant: 'link', children: 'Esqueceu a senha?' } };

export const Disabled: Story = { args: { disabled: true } };

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Icon icon={Play} class="fill-current" />
      Continuar aula
    </Button>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div class="flex items-center gap-3">
      <Button size="sm">Pequeno</Button>
      <Button>Padrão</Button>
      <Button size="lg">Grande</Button>
      <Button size="icon" aria-label="Baixar">
        <Icon icon={Download} />
      </Button>
    </div>
  ),
};

/** For links styled as buttons, put `buttonVariants()` on a plain `<a>`. */
export const AsLink: Story = {
  render: () => (
    <a href="#" class={buttonVariants({ variant: 'outline' })}>
      Ver meus cursos
      <Icon icon={ArrowRight} />
    </a>
  ),
};
