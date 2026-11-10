import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Screen } from './screen';

// Sign-in screens and the 404 page, rendered by the real app.
const meta = {
  title: 'Telas/Acesso',
  component: Screen,
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: { url: { control: 'text' } },
} satisfies Meta<typeof Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Entrar: Story = { name: 'Entrar', args: { url: '/entrar' } };

/** Submitting empty fields shows the messages and focuses the first one. */
export const EntrarComErros: Story = {
  name: 'Entrar — validação',
  args: { url: '/entrar' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Entrar' }));
    await expect(await canvas.findByText('Informe um e-mail válido.')).toBeVisible();
    await expect(canvas.getByText('A senha tem pelo menos 6 caracteres.')).toBeVisible();
    await expect(canvas.getByLabelText('E-mail')).toHaveFocus();
  },
};

export const EntrarCelular: Story = {
  name: 'Entrar — celular',
  args: { url: '/entrar' },
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};

export const RecuperarSenha: Story = {
  name: 'Recuperar senha',
  args: { url: '/recuperar-senha' },
};

export const LinkDeAcesso: Story = {
  name: 'Receber link de acesso',
  args: { url: '/recuperar-senha?modo=link' },
};

export const PaginaNaoEncontrada: Story = {
  name: 'Página não encontrada (404)',
  args: { url: '/pagina-que-nao-existe' },
};
