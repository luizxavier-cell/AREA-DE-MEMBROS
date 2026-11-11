import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { mockAuth } from '../lib/mock-data';
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
type Canvas = ReturnType<typeof within>;

const EMAIL = 'ana.souza@email.com';
const NEW_PASSWORD = 'nova-senha-123';
const WAIT = { timeout: 5000 };

async function signInWith(canvas: Canvas, password: string) {
  await userEvent.type(await canvas.findByLabelText('E-mail'), EMAIL);
  await userEvent.type(canvas.getByLabelText('Senha'), password);
  await userEvent.click(canvas.getByRole('button', { name: 'Entrar' }));
}

/** Walks the reset flow up to the code screen and returns its field. */
async function reachCodeStep(canvas: Canvas) {
  await userEvent.type(await canvas.findByLabelText('E-mail'), EMAIL);
  await userEvent.click(canvas.getByRole('button', { name: 'Enviar código' }));
  return canvas.findByLabelText('Código de verificação', {}, WAIT);
}

/** Walks the reset flow up to the new password screen and returns its field. */
async function reachPasswordStep(canvas: Canvas) {
  await userEvent.type(await reachCodeStep(canvas), mockAuth.resetCode);
  await userEvent.click(canvas.getByRole('button', { name: 'Verificar código' }));
  return canvas.findByLabelText('Nova senha', {}, WAIT);
}

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

export const EntrarSenhaIncorreta: Story = {
  name: 'Entrar — senha incorreta',
  args: { url: '/entrar' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await signInWith(canvas, mockAuth.wrongPassword);
    await expect(await canvas.findByRole('alert', {}, WAIT)).toHaveTextContent(
      'E-mail ou senha incorretos.',
    );
    await expect(canvas.getByLabelText('Senha')).toHaveFocus();
  },
};

/** E-mail and password go straight to the member area: no confirmation step. */
export const EntrarComSucesso: Story = {
  name: 'Entrar — sucesso',
  args: { url: '/entrar' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await signInWith(canvas, 'senha-correta');
    await expect(
      await canvas.findByRole('button', { name: 'Menu da conta' }, WAIT),
    ).toBeInTheDocument();
  },
};

export const EntrarCelular: Story = {
  name: 'Entrar — celular',
  args: { url: '/entrar' },
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};

export const RecuperarSenha: Story = {
  name: 'Recuperar senha — e-mail',
  args: { url: '/recuperar-senha' },
};

export const RecuperarSenhaValidacao: Story = {
  name: 'Recuperar senha — e-mail inválido',
  args: { url: '/recuperar-senha' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Enviar código' }));
    await expect(await canvas.findByText('Informe um e-mail válido.')).toBeVisible();
    await expect(canvas.getByLabelText('E-mail')).toHaveFocus();
  },
};

export const RecuperarSenhaCodigo: Story = {
  name: 'Recuperar senha — código',
  args: { url: '/recuperar-senha' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await reachCodeStep(canvas)).toHaveFocus();
    await expect(canvas.getByRole('button', { name: /Reenviar código em/ })).toBeDisabled();
  },
};

export const RecuperarSenhaCodigoIncorreto: Story = {
  name: 'Recuperar senha — código incorreto',
  args: { url: '/recuperar-senha' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await reachCodeStep(canvas), '000000');
    await userEvent.click(canvas.getByRole('button', { name: 'Verificar código' }));
    await expect(await canvas.findByText(/Código incorreto ou expirado/, {}, WAIT)).toBeVisible();
    await expect(canvas.getByLabelText('Código de verificação')).toHaveValue('');
  },
};

export const RecuperarSenhaCodigoCelular: Story = {
  ...RecuperarSenhaCodigo,
  name: 'Recuperar senha — código no celular',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};

export const RecuperarSenhaNova: Story = {
  name: 'Recuperar senha — nova senha',
  args: { url: '/recuperar-senha' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await reachPasswordStep(canvas)).toHaveFocus();
  },
};

export const RecuperarSenhaDiferentes: Story = {
  name: 'Recuperar senha — senhas diferentes',
  args: { url: '/recuperar-senha' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await reachPasswordStep(canvas), NEW_PASSWORD);
    await userEvent.type(canvas.getByLabelText('Confirmar nova senha'), 'outra-senha-123');
    await userEvent.click(canvas.getByRole('button', { name: 'Salvar nova senha' }));
    await expect(await canvas.findByText('As senhas não conferem.')).toBeVisible();
    await expect(canvas.getByLabelText('Confirmar nova senha')).toHaveFocus();
  },
};

export const RecuperarSenhaConcluida: Story = {
  name: 'Recuperar senha — concluída',
  args: { url: '/recuperar-senha' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await reachPasswordStep(canvas), NEW_PASSWORD);
    await userEvent.type(canvas.getByLabelText('Confirmar nova senha'), NEW_PASSWORD);
    await userEvent.click(canvas.getByRole('button', { name: 'Salvar nova senha' }));
    await expect(
      await canvas.findByRole('heading', { name: 'Senha alterada' }, WAIT),
    ).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Ir para o login' })).toBeVisible();
  },
};

export const PaginaNaoEncontrada: Story = {
  name: 'Página não encontrada (404)',
  args: { url: '/pagina-que-nao-existe' },
};
