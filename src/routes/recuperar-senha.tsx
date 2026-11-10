import { Title } from '@solidjs/meta';
import { useSearchParams } from '@solidjs/router';
import { Show, createSignal } from 'solid-js';
import { ArrowLeft, MailCheck } from 'lucide';

import { AuthLayout } from '../components/auth-layout';
import { Button, buttonVariants } from '../components/ui/button';
import { Input, Label } from '../components/ui/form';
import { Icon } from '../components/ui/icon';
import { platform } from '../lib/config';
import { cn } from '../lib/utils';
import { paths } from '../router';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password reset request — and, with ?modo=link, the passwordless
 * "magic link" request. Both only collect the e-mail on the frontend.
 */
export default function RecoverPage() {
  const [searchParams] = useSearchParams<{ modo?: string }>();
  const [sentTo, setSentTo] = createSignal('');
  const [error, setError] = createSignal('');
  const magicLink = () => searchParams.modo === 'link';

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    if (!EMAIL_PATTERN.test(email)) {
      setError('Informe um e-mail válido.');
      event.currentTarget.querySelector<HTMLInputElement>('#email')?.focus();
      return;
    }
    // Somente frontend: aqui entra a chamada que envia o e-mail.
    setError('');
    setSentTo(email);
  };

  return (
    <AuthLayout>
      <Title>{`${magicLink() ? 'Link de acesso' : 'Recuperar senha'} · ${platform.name}`}</Title>
      <Show
        when={sentTo()}
        fallback={
          <form class="flex flex-col gap-6" novalidate onSubmit={submit}>
            <div class="flex flex-col gap-2 text-center">
              <h1 class="text-2xl font-semibold tracking-tight">
                {magicLink() ? 'Acesse sem senha' : 'Esqueceu a senha?'}
              </h1>
              <p class="text-sm text-balance text-muted-foreground">
                {magicLink()
                  ? 'Enviaremos um link de acesso válido por 15 minutos para o seu e-mail.'
                  : 'Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.'}
              </p>
            </div>
            <div class="grid gap-2">
              <Label for="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                placeholder="voce@email.com"
                aria-invalid={error() ? 'true' : undefined}
                aria-describedby={error() ? 'email-erro' : undefined}
                required
              />
              <Show when={error()}>
                <p id="email-erro" class="text-sm text-destructive">
                  {error()}
                </p>
              </Show>
            </div>
            <Button type="submit" class="w-full">
              {magicLink() ? 'Enviar link de acesso' : 'Enviar link de recuperação'}
            </Button>
            <a
              href={String(paths.entrar())}
              class={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}
            >
              <Icon icon={ArrowLeft} />
              Voltar para o login
            </a>
          </form>
        }
      >
        <div class="flex flex-col items-center gap-6 text-center">
          <span class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon icon={MailCheck} class="size-6" />
          </span>
          <div class="space-y-2">
            <h1 class="text-2xl font-semibold tracking-tight">Verifique seu e-mail</h1>
            <p class="text-sm text-balance text-muted-foreground">
              Se existir uma conta para <span class="font-medium text-foreground">{sentTo()}</span>,
              você receberá o link em alguns minutos. Confira também a caixa de spam.
            </p>
          </div>
          <div class="grid w-full gap-2">
            <a href={String(paths.entrar())} class={cn(buttonVariants(), 'w-full')}>
              Voltar para o login
            </a>
            <Button variant="ghost" class="w-full" onClick={() => setSentTo('')}>
              Usar outro e-mail
            </Button>
          </div>
        </div>
      </Show>
    </AuthLayout>
  );
}
