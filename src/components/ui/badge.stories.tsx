import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { CircleCheck, Pin } from 'lucide';

import { Badge } from './badge';
import { Icon } from './icon';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  args: { children: 'Iniciante', variant: 'default' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'destructive', 'success'],
    },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Badge>Padrão</Badge>
      <Badge variant="secondary">Conteúdo</Badge>
      <Badge variant="outline">
        <Icon icon={Pin} />
        Fixado
      </Badge>
      <Badge variant="success">
        <Icon icon={CircleCheck} />
        Concluída
      </Badge>
      <Badge variant="destructive">Expirado</Badge>
    </div>
  ),
};
