import { Title } from '@solidjs/meta';
import { Match, Show, Switch, createSignal, onSettled } from 'solid-js';
import type { ParentProps } from 'solid-js';
import { ArrowLeft, CircleCheck, LoaderCircle } from 'lucide';

import { AuthLayout } from '../components/auth-layout';
import { Button, buttonVariants } from '../components/ui/button';
import { Input, Label } from '../components/ui/form';
import { Icon } from '../components/ui/icon';
import { OtpInput } from '../components/ui/otp-input';
import { PasswordInput } from '../components/ui/password-input';
import { requestPasswordReset, resetPassword, verifyResetCode } from '../lib/api';
import { platform } from '../lib/config';
import { cn } from '../lib/utils';
import { paths } from '../router';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;

type FormSubmit = SubmitEvent & { currentTarget: HTMLFormElement };

/**
 * Password reset by one-time code: e-mail, then the code received there,
 * then the new password. Nothing in the e-mail is a clickable link.
 */
export default function RecoverPage() {
  const [step, setStep] = createSignal<'email' | 'codigo' | 'senha' | 'pronto'>('email');
  const [email, setEmail] = createSignal('');
  const [code, setCode] = createSignal('');

  return (
    <AuthLayout>
      <Title>{`Recuperar senha · ${platform.name}`}</Title>
      <Switch>
        <Match when={step() === 'email'}>
          <EmailStep
            email={email()}
            onSent={(address) => {
              setEmail(address);
              setStep('codigo');
            }}
          />
        </Match>
        <Match when={step() === 'codigo'}>
          <CodeStep
            email={email()}
            onVerified={(verified) => {
              setCode(verified);
              setStep('senha');
            }}
            onChangeEmail={() => setStep('email')}
          />
        </Match>
        <Match when={step() === 'senha'}>
          <PasswordStep email={email()} code={code()} onDone={() => setStep('pronto')} />
        </Match>
        <Match when={step() === 'pronto'}>
          <DoneStep />
        </Match>
      </Switch>
    </AuthLayout>
  );
}

function StepHeading(props: ParentProps<{ title: string }>) {
  return (
    <div class="flex flex-col gap-2 text-center">
      <h1 class="text-2xl font-semibold tracking-tight">{props.title}</h1>
      <p class="text-sm text-balance text-muted-foreground">{props.children}</p>
    </div>
  );
}

function SubmitButton(props: ParentProps<{ busy: boolean; busyLabel: string }>) {
  return (
    <Button type="submit" class="w-full" disabled={props.busy}>
      <Show when={props.busy}>
        <Icon icon={LoaderCircle} class="animate-spin" />
      </Show>
      {props.busy ? props.busyLabel : props.children}
    </Button>
  );
}

function BackToSignIn() {
  return (
    <a href={String(paths.entrar())} class={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}>
      <Icon icon={ArrowLeft} />
      Voltar para o login
    </a>
  );
}

function EmailStep(props: { email: string; onSent: (email: string) => void }) {
  const [error, setError] = createSignal('');
  const [submitting, setSubmitting] = createSignal(false);

  const submit = async (event: FormSubmit) => {
    event.preventDefault();
    const form = event.currentTarget;
    const address = String(new FormData(form).get('email') ?? '').trim();
    if (!EMAIL_PATTERN.test(address)) {
      setError('Informe um e-mail válido.');
      form.querySelector<HTMLInputElement>('#email')?.focus();
      return;
    }
    setError('');
    setSubmitting(true);
    await requestPasswordReset(address);
    setSubmitting(false);
    props.onSent(address);
  };

  return (
    <form class="flex flex-col gap-6" novalidate onSubmit={submit}>
      <StepHeading title="Esqueceu a senha?">
        Informe o e-mail da sua conta e enviaremos um código de {CODE_LENGTH} dígitos para criar uma
        nova senha.
      </StepHeading>
      <div class="grid gap-2">
        <Label for="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          placeholder="voce@email.com"
          value={props.email}
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
      <SubmitButton busy={submitting()} busyLabel="Enviando…">
        Enviar código
      </SubmitButton>
      <BackToSignIn />
    </form>
  );
}

function CodeStep(props: {
  email: string;
  onVerified: (code: string) => void;
  onChangeEmail: () => void;
}) {
  const [code, setCode] = createSignal('');
  const [error, setError] = createSignal('');
  const [notice, setNotice] = createSignal('');
  const [submitting, setSubmitting] = createSignal(false);
  const [cooldown, setCooldown] = createSignal(RESEND_COOLDOWN_SEC);
  let field: HTMLInputElement | undefined;

  onSettled(() => {
    field?.focus();
    const timer = setInterval(() => setCooldown((left) => Math.max(0, left - 1)), 1000);
    return () => clearInterval(timer);
  });

  const submit = async (event: FormSubmit) => {
    event.preventDefault();
    const typed = code();
    if (typed.length < CODE_LENGTH) {
      setError(`Digite os ${CODE_LENGTH} dígitos do código.`);
      field?.focus();
      return;
    }
    setError('');
    setNotice('');
    setSubmitting(true);
    const valid = await verifyResetCode(props.email, typed);
    setSubmitting(false);
    if (!valid) {
      setError('Código incorreto ou expirado. Confira o e-mail ou peça um novo código.');
      setCode('');
      field?.focus();
      return;
    }
    props.onVerified(typed);
  };

  const resend = async () => {
    setError('');
    setCode('');
    setCooldown(RESEND_COOLDOWN_SEC);
    await requestPasswordReset(props.email);
    setNotice('Enviamos um novo código para o seu e-mail.');
    field?.focus();
  };

  return (
    <form class="flex flex-col gap-6" novalidate onSubmit={submit}>
      <StepHeading title="Digite o código">
        Se existir uma conta para <span class="font-medium text-foreground">{props.email}</span>,
        você receberá um código de {CODE_LENGTH} dígitos em alguns minutos. Confira também a caixa
        de spam.
      </StepHeading>
      <div class="grid gap-2">
        <Label for="codigo">Código de verificação</Label>
        <OtpInput
          ref={field}
          id="codigo"
          name="codigo"
          length={CODE_LENGTH}
          value={code()}
          onValueChange={(value) => {
            setCode(value);
            setError('');
          }}
          aria-invalid={error() ? 'true' : undefined}
          aria-describedby={error() ? 'codigo-erro' : undefined}
          required
        />
        <Show when={error()}>
          <p id="codigo-erro" class="text-sm text-destructive">
            {error()}
          </p>
        </Show>
        <p role="status" class="text-sm text-muted-foreground empty:hidden">
          {notice()}
        </p>
      </div>
      <SubmitButton busy={submitting()} busyLabel="Verificando…">
        Verificar código
      </SubmitButton>
      <div class="grid gap-2">
        <Button
          type="button"
          variant="ghost"
          class="w-full"
          disabled={cooldown() > 0}
          onClick={resend}
        >
          {cooldown() > 0 ? `Reenviar código em ${cooldown()}s` : 'Reenviar código'}
        </Button>
        <Button type="button" variant="ghost" class="w-full" onClick={() => props.onChangeEmail()}>
          Usar outro e-mail
        </Button>
      </div>
    </form>
  );
}

function PasswordStep(props: { email: string; code: string; onDone: () => void }) {
  const [errors, setErrors] = createSignal<{ password?: string; confirmation?: string }>({});
  const [submitting, setSubmitting] = createSignal(false);
  let field: HTMLInputElement | undefined;

  onSettled(() => {
    field?.focus();
  });

  const submit = async (event: FormSubmit) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get('nova') ?? '');

    if (password.length < 8) {
      setErrors({ password: 'A nova senha precisa ter pelo menos 8 caracteres.' });
      form.querySelector<HTMLInputElement>('#nova')?.focus();
      return;
    }
    if (password !== String(data.get('confirmacao') ?? '')) {
      setErrors({ confirmation: 'As senhas não conferem.' });
      form.querySelector<HTMLInputElement>('#confirmacao')?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    await resetPassword(props.email, props.code, password);
    setSubmitting(false);
    props.onDone();
  };

  return (
    <form class="flex flex-col gap-6" novalidate onSubmit={submit}>
      <StepHeading title="Crie uma nova senha">
        Use pelo menos 8 caracteres. Depois é só entrar com ela.
      </StepHeading>
      {/* Lets password managers save the new password under the right account. */}
      <input type="text" autocomplete="username" value={props.email} readonly hidden />
      <div class="grid gap-5">
        <div class="grid gap-2">
          <Label for="nova">Nova senha</Label>
          <PasswordInput
            ref={field}
            id="nova"
            name="nova"
            autocomplete="new-password"
            aria-invalid={errors().password ? 'true' : undefined}
            aria-describedby={errors().password ? 'nova-erro' : undefined}
            required
          />
          <Show when={errors().password}>
            <p id="nova-erro" class="text-sm text-destructive">
              {errors().password}
            </p>
          </Show>
        </div>
        <div class="grid gap-2">
          <Label for="confirmacao">Confirmar nova senha</Label>
          <PasswordInput
            id="confirmacao"
            name="confirmacao"
            autocomplete="new-password"
            aria-invalid={errors().confirmation ? 'true' : undefined}
            aria-describedby={errors().confirmation ? 'confirmacao-erro' : undefined}
            required
          />
          <Show when={errors().confirmation}>
            <p id="confirmacao-erro" class="text-sm text-destructive">
              {errors().confirmation}
            </p>
          </Show>
        </div>
      </div>
      <SubmitButton busy={submitting()} busyLabel="Salvando…">
        Salvar nova senha
      </SubmitButton>
      <BackToSignIn />
    </form>
  );
}

function DoneStep() {
  return (
    <div class="flex flex-col items-center gap-6 text-center">
      <span class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon icon={CircleCheck} class="size-6" />
      </span>
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">Senha alterada</h1>
        <p class="text-sm text-balance text-muted-foreground">
          Agora é só entrar com o seu e-mail e a nova senha.
        </p>
      </div>
      <a href={String(paths.entrar())} class={cn(buttonVariants(), 'w-full')}>
        Ir para o login
      </a>
    </div>
  );
}
