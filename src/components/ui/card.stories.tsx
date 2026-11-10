import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { Award } from 'lucide';

import { Badge } from './badge';
import { Button } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Icon } from './icon';
import { Progress } from './misc';

const meta = {
  title: 'UI/Card',
  component: Card,
  subcomponents: { CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card class="w-96">
      <CardHeader>
        <CardTitle>Certificado de conclusão</CardTitle>
        <CardDescription>Conclua todas as aulas para receber o seu certificado.</CardDescription>
        <CardAction>
          <Icon icon={Award} class="size-5 text-primary" />
        </CardAction>
      </CardHeader>
      <CardContent class="flex items-center gap-3">
        <Progress value={65} aria-label="Progresso" />
        <span class="text-sm font-medium tabular-nums">65%</span>
      </CardContent>
      <CardFooter class="justify-end gap-2">
        <Button variant="outline">Ver curso</Button>
        <Button>Continuar</Button>
      </CardFooter>
    </Card>
  ),
};

/** The KPI tile used on the home page. */
export const Stat: Story = {
  render: () => (
    <Card class="@container/card w-64 gap-3 py-5">
      <CardHeader class="px-5">
        <CardDescription>Aulas concluídas</CardDescription>
        <CardTitle class="text-3xl font-semibold tabular-nums">19</CardTitle>
        <CardAction>
          <Badge variant="success">+3 esta semana</Badge>
        </CardAction>
      </CardHeader>
      <CardFooter class="px-5 text-sm text-muted-foreground">de 57 aulas disponíveis</CardFooter>
    </Card>
  ),
};
