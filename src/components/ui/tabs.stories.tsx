import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  subcomponents: { TabsList, TabsTrigger, TabsContent },
  args: { defaultValue: 'visao-geral' },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs {...args} class="w-[28rem]">
      <TabsList aria-label="Detalhes da aula">
        <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
        <TabsTrigger value="materiais">Materiais</TabsTrigger>
        <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
      </TabsList>
      <TabsContent value="visao-geral" class="pt-2 text-sm text-muted-foreground">
        Nesta aula você vai entender o conceito na prática, com exemplos reais.
      </TabsContent>
      <TabsContent value="materiais" class="pt-2 text-sm text-muted-foreground">
        Template de persona (PDF · 1,2 MB)
      </TabsContent>
      <TabsContent value="anotacoes" class="pt-2 text-sm text-muted-foreground">
        Suas anotações aparecem aqui.
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Materiais' }));
    await expect(canvas.getByRole('tab', { name: 'Materiais' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByText(/Template de persona/)).toBeVisible();
  },
};
