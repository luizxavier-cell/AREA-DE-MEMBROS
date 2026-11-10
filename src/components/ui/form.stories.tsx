import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Checkbox, Input, Label, NativeSelect, Switch, Textarea } from './form';
import { PasswordInput } from './password-input';

const meta = {
  title: 'UI/Form',
  component: Input,
  subcomponents: { Label, Textarea, NativeSelect, Checkbox, Switch, PasswordInput },
  args: {
    placeholder: 'voce@email.com',
    type: 'email',
    disabled: false,
    class: 'w-80',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {};

export const Invalid: Story = {
  render: () => (
    <div class="grid w-80 gap-2">
      <Label for="email-invalido">E-mail</Label>
      <Input
        id="email-invalido"
        type="email"
        value="ana@"
        aria-invalid="true"
        aria-describedby="email-invalido-erro"
      />
      <p id="email-invalido-erro" class="text-sm text-destructive">
        Informe um e-mail válido.
      </p>
    </div>
  ),
};

export const Password: Story = {
  render: () => (
    <div class="grid w-80 gap-2">
      <Label for="senha">Senha</Label>
      <PasswordInput id="senha" value="segredo123" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Senha');
    await expect(field).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getByRole('button', { name: 'Mostrar senha' }));
    await expect(field).toHaveAttribute('type', 'text');
  },
};

export const TextareaField: Story = {
  render: () => (
    <div class="grid w-80 gap-2">
      <Label for="bio">Sobre você</Label>
      <Textarea id="bio" rows={3} placeholder="Conte um pouco sobre você e seus objetivos." />
    </div>
  ),
};

export const Select: Story = {
  render: () => (
    <div class="grid w-80 gap-2">
      <Label for="periodo">Período</Label>
      <NativeSelect id="periodo">
        <option>Últimos 7 dias</option>
        <option>Últimos 30 dias</option>
        <option>Últimos 90 dias</option>
      </NativeSelect>
    </div>
  ),
};

export const CheckboxAndSwitch: Story = {
  render: () => (
    <div class="grid w-80 gap-5">
      <div class="flex items-center gap-2">
        <Checkbox id="lembrar" checked />
        <Label for="lembrar" class="font-normal">
          Manter conectado neste dispositivo
        </Label>
      </div>
      <div class="flex items-center justify-between gap-4">
        <Label for="avisos">Lembretes de mentorias ao vivo</Label>
        <Switch id="avisos" defaultChecked />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  },
};
