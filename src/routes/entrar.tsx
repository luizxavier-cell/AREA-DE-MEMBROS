import { Title } from '@solidjs/meta';
import { useNavigate } from '@solidjs/router';
import { Show, createSignal } from 'solid-js';
import { LoaderCircle, Mail } from 'lucide';

import { AuthLayout } from '../components/auth-layout';
import { Button, buttonVariants } from '../components/ui/button';
import { Checkbox, Input, Label } from '../components/ui/form';
import { Icon } from '../components/ui/icon';
import { PasswordInput } from '../components/ui/password-input';
import { platform } from '../lib/config';
import { cn } from '../lib/utils';
import { paths } from '../router';

type Errors = { email?: string; password?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = createSignal<Errors>({});
  const [submitting, setSubmitting] = createSignal(false);

  const submit = async (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('senha') ?? '');

    const found: Errors = {};
    if (!EMAIL_PATTERN.test(email)) found.email = 'Informe um e-mail válido.';
    if (password.length < 6) found.password = 'A senha tem pelo menos 6 caracteres.';
    setErrors(found);

    if (found.email || found.password) {
      // Move focus to the first field with a problem.
      form.querySelector<HTMLInputElement>(found.email ? '#email' : '#senha')?.focus();
      return;
    }

    // Somente frontend: aqui entra a chamada de autenticação do backend.
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    navigate(String(paths()), { replace: true });
  };

  return (
    <AuthLayout>
      <Title>{`Entrar · ${platform.name}`}</Title>
      <form class="flex flex-col gap-6" novalidate onSubmit={submit}>
        <div class="flex flex-col gap-2 text-center">
          <h1 class="text-2xl font-semibold tracking-tight">Entre na sua conta</h1>
          <p class="text-sm text-balance text-muted-foreground">
            Use o e-mail cadastrado na compra para acessar a área de membros.
          </p>
        </div>

        <div class="grid gap-5">
          <div class="grid gap-2">
            <Label for="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="voce@email.com"
              aria-invalid={errors().email ? 'true' : undefined}
              aria-describedby={errors().email ? 'email-erro' : undefined}
              required
            />
            <Show when={errors().email}>
              <p id="email-erro" class="text-sm text-destructive">
                {errors().email}
              </p>
            </Show>
          </div>

          <div class="grid gap-2">
            <div class="flex items-center">
              <Label for="senha">Senha</Label>
              <a
                href={String(paths['recuperar-senha']())}
                class="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Esqueceu a senha?
              </a>
            </div>
            <PasswordInput
              id="senha"
              name="senha"
              autocomplete="current-password"
              aria-invalid={errors().password ? 'true' : undefined}
              aria-describedby={errors().password ? 'senha-erro' : undefined}
              required
            />
            <Show when={errors().password}>
              <p id="senha-erro" class="text-sm text-destructive">
                {errors().password}
              </p>
            </Show>
          </div>

          <div class="flex items-center gap-2">
            <Checkbox id="lembrar" name="lembrar" checked />
            <Label for="lembrar" class="font-normal">
              Manter conectado neste dispositivo
            </Label>
          </div>

          <Button type="submit" class="w-full" disabled={submitting()}>
            <Show when={submitting()}>
              <Icon icon={LoaderCircle} class="animate-spin" />
            </Show>
            {submitting() ? 'Entrando…' : 'Entrar'}
          </Button>

          <div class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:border-t">
            <span class="relative z-10 bg-background px-2 text-muted-foreground">ou</span>
          </div>

          <a
            href={String(paths['recuperar-senha']({ modo: 'link' }))}
            class={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            <Icon icon={Mail} />
            Receber link de acesso por e-mail
          </a>
        </div>

        <p class="text-center text-sm text-muted-foreground">
          Ainda não é membro?{' '}
          <a href="#" class="font-medium text-foreground underline underline-offset-4">
            Conheça os planos
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
