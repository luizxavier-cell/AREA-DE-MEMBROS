import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { createSignal } from 'solid-js';
import { expect, userEvent, within } from 'storybook/test';
import { Award, ChevronsUpDown, LogOut, UserRound } from 'lucide';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Icon } from './icon';
import { Sheet } from './sheet';

const meta = {
  title: 'UI/Overlays',
  component: DropdownMenu,
  subcomponents: {
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    Sheet,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dropdown: Story = {
  render: () => (
    <div class="flex h-72 items-start justify-center pt-4">
      <DropdownMenu>
        <DropdownMenuTrigger class="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent">
          Ana Beatriz Souza
          <Icon icon={ChevronsUpDown} class="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-56">
          <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Icon icon={UserRound} />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon={Award} />
            Certificados
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Icon icon={LogOut} />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Ana Beatriz/ }));
    const menu = await canvas.findByRole('menu');
    await expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('menu')).toBeNull();
  },
};

export const SidePanel: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Abrir lista de aulas
        </Button>
        <Sheet
          open={open()}
          onOpenChange={setOpen}
          side="right"
          title="Conteúdo do curso"
          class="p-6"
        >
          <h2 class="font-semibold">Conteúdo do curso</h2>
          <p class="text-sm text-muted-foreground">
            Painel lateral modal. Fecha com Esc, com o botão ou clicando fora.
          </p>
        </Sheet>
      </>
    );
  },
};
