import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { For, Show, createMemo, createSignal, onSettled } from 'solid-js';
import { Check, Monitor, Moon, Sun, type IconNode } from 'lucide';

import { PageHeader } from '../../components/site-header';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input, Label, Switch, Textarea } from '../../components/ui/form';
import { Icon } from '../../components/ui/icon';
import { Avatar, Separator } from '../../components/ui/misc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { getMember, updateProfile } from '../../lib/api';
import { platform } from '../../lib/config';
import { getThemePreference, setThemePreference, type ThemePreference } from '../../lib/theme';
import { formatDate } from '../../lib/utils';

export const route = {
  preload: () => void getMember(),
} satisfies RouteDefinition;

export default function AccountPage() {
  return (
    <>
      <Title>{`Minha conta · ${platform.name}`}</Title>

      <div class="flex flex-1 flex-col gap-6 px-4 pt-6 sm:px-6 lg:px-12 lg:pt-10">
        <PageHeader
          title="Minha conta"
          description="Gerencie seus dados, sua senha e suas preferências."
        />

        <Tabs defaultValue="perfil" class="gap-6">
          <TabsList aria-label="Seções da conta" class="max-w-full overflow-x-auto">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          </TabsList>
          <TabsContent value="perfil">
            <ProfileSection />
          </TabsContent>
          <TabsContent value="seguranca">
            <SecuritySection />
          </TabsContent>
          <TabsContent value="notificacoes">
            <NotificationsSection />
          </TabsContent>
          <TabsContent value="aparencia">
            <AppearanceSection />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function SavedMessage(props: { show: boolean; children: string }) {
  return (
    <Show when={props.show}>
      <span role="status" class="flex items-center gap-1.5 text-sm text-success">
        <Icon icon={Check} />
        {props.children}
      </span>
    </Show>
  );
}

function ProfileSection() {
  const member = createMemo(() => getMember());
  const [saved, setSaved] = createSignal(false);

  const submit = async (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await updateProfile({
      name: String(form.get('nome') ?? '').trim() || member().name,
      email: String(form.get('email') ?? '').trim() || member().email,
    });
    setSaved(true);
  };

  return (
    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Essas informações aparecem nos seus certificados e na comunidade.
          </CardDescription>
        </CardHeader>
        <form class="flex flex-col gap-6" onSubmit={submit} onInput={() => setSaved(false)}>
          <CardContent class="grid gap-6">
            <div class="flex items-center gap-4">
              <Avatar
                name={member().name}
                src={member().avatarUrl}
                class="size-16"
                fallbackClass="bg-primary/10 text-lg text-primary"
              />
              <div class="space-y-1.5">
                <Label
                  for="foto"
                  class="cursor-pointer text-primary underline-offset-4 hover:underline"
                >
                  Alterar foto
                </Label>
                <input id="foto" name="foto" type="file" accept="image/*" class="sr-only" />
                <p class="text-xs text-muted-foreground">JPG ou PNG, até 2 MB.</p>
              </div>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="grid gap-2">
                <Label for="nome">Nome completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  autocomplete="name"
                  defaultValue={member().name}
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  defaultValue={member().email}
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="telefone">WhatsApp</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  autocomplete="tel"
                  placeholder="(11) 90000-0000"
                />
              </div>
              <div class="grid gap-2">
                <Label for="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  autocomplete="address-level2"
                  placeholder="São Paulo, SP"
                />
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="bio">Sobre você</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="Conte um pouco sobre você e seus objetivos."
              />
            </div>
          </CardContent>
          <CardFooter class="justify-end gap-3 border-t">
            <SavedMessage show={saved()}>Alterações salvas</SavedMessage>
            <Button type="submit">Salvar alterações</Button>
          </CardFooter>
        </form>
      </Card>

      <Card class="self-start">
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Seu acesso à área de membros.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Plano</span>
            <Badge>{member().plan}</Badge>
          </div>
          <Separator />
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Membro desde</span>
            <span class="font-medium">{formatDate(member().memberSince)}</span>
          </div>
          <Separator />
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Situação</span>
            <Badge variant="success">Ativa</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySection() {
  const [error, setError] = createSignal('');
  const [saved, setSaved] = createSignal(false);

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = String(form.get('nova') ?? '');
    if (next.length < 8) return setError('A nova senha precisa ter pelo menos 8 caracteres.');
    if (next !== String(form.get('confirmacao') ?? '')) return setError('As senhas não conferem.');
    setError('');
    setSaved(true);
    event.currentTarget.reset();
  };

  return (
    <Card class="max-w-2xl">
      <CardHeader>
        <CardTitle>Alterar senha</CardTitle>
        <CardDescription>Use pelo menos 8 caracteres, misturando letras e números.</CardDescription>
      </CardHeader>
      <form
        class="flex flex-col gap-6"
        onSubmit={submit}
        onInput={() => setSaved(false)}
        novalidate
      >
        <CardContent class="grid gap-4">
          <div class="grid gap-2">
            <Label for="atual">Senha atual</Label>
            <Input
              id="atual"
              name="atual"
              type="password"
              autocomplete="current-password"
              required
            />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="grid gap-2">
              <Label for="nova">Nova senha</Label>
              <Input
                id="nova"
                name="nova"
                type="password"
                autocomplete="new-password"
                aria-invalid={error() ? 'true' : undefined}
                aria-describedby="erro-senha"
                required
              />
            </div>
            <div class="grid gap-2">
              <Label for="confirmacao">Confirmar nova senha</Label>
              <Input
                id="confirmacao"
                name="confirmacao"
                type="password"
                autocomplete="new-password"
                aria-invalid={error() ? 'true' : undefined}
                aria-describedby="erro-senha"
                required
              />
            </div>
          </div>
          <p id="erro-senha" role="alert" class="min-h-5 text-sm text-destructive">
            {error()}
          </p>
        </CardContent>
        <CardFooter class="justify-end gap-3 border-t">
          <SavedMessage show={saved()}>Senha atualizada</SavedMessage>
          <Button type="submit">Atualizar senha</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

const notificationOptions = [
  {
    id: 'novas-aulas',
    label: 'Novas aulas e módulos',
    description: 'Aviso quando um conteúdo novo for liberado.',
    on: true,
  },
  {
    id: 'ao-vivo',
    label: 'Lembretes de mentorias ao vivo',
    description: 'Um dia antes e uma hora antes de cada encontro.',
    on: true,
  },
  {
    id: 'avisos',
    label: 'Avisos da criadora',
    description: 'Comunicados importantes sobre a plataforma.',
    on: true,
  },
  {
    id: 'resumo',
    label: 'Resumo semanal',
    description: 'Seu progresso da semana e sugestões do que estudar.',
    on: false,
  },
];

function NotificationsSection() {
  const [saved, setSaved] = createSignal(false);
  return (
    <Card class="max-w-2xl">
      <CardHeader>
        <CardTitle>Notificações por e-mail</CardTitle>
        <CardDescription>Escolha o que você quer receber.</CardDescription>
      </CardHeader>
      <CardContent class="divide-y">
        <For each={notificationOptions}>
          {(option) => (
            <div class="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div class="space-y-1">
                <Label for={`notif-${option.id}`}>{option.label}</Label>
                <p id={`notif-${option.id}-desc`} class="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
              <Switch
                id={`notif-${option.id}`}
                aria-describedby={`notif-${option.id}-desc`}
                defaultChecked={option.on}
                onChange={() => setSaved(false)}
              />
            </div>
          )}
        </For>
      </CardContent>
      <CardFooter class="justify-end gap-3 border-t">
        <SavedMessage show={saved()}>Preferências salvas</SavedMessage>
        <Button onClick={() => setSaved(true)}>Salvar preferências</Button>
      </CardFooter>
    </Card>
  );
}

const themeOptions: { value: ThemePreference; label: string; icon: IconNode }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Automático', icon: Monitor },
];

function AppearanceSection() {
  const [theme, setTheme] = createSignal<ThemePreference>('system');
  // The saved preference lives in this browser; read it once on screen.
  onSettled(() => {
    setTheme(getThemePreference());
  });

  return (
    <Card class="max-w-2xl">
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Escolha o tema neste dispositivo. No automático (padrão), a área de membros segue o
          tema claro ou escuro do aparelho.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset class="grid grid-cols-3 gap-3">
          <legend class="sr-only">Tema</legend>
          <For each={themeOptions}>
            {(option) => (
              <label class="flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50">
                <input
                  type="radio"
                  name="tema"
                  value={option.value}
                  checked={theme() === option.value}
                  class="sr-only"
                  onChange={() => {
                    setTheme(option.value);
                    setThemePreference(option.value);
                  }}
                />
                <Icon icon={option.icon} class="size-5" />
                {option.label}
              </label>
            )}
          </For>
        </fieldset>
      </CardContent>
    </Card>
  );
}
