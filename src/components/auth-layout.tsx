import { For, type ParentProps } from 'solid-js';
import { GraduationCap, Quote } from 'lucide';

import { platform } from '../lib/config';
import { paths } from '../router';
import { ThemeToggle } from './theme-toggle';
import { Icon } from './ui/icon';
import { Avatar } from './ui/misc';

const highlights = [
  { value: '9', label: 'cursos e bônus' },
  { value: '1x/mês', label: 'mentoria ao vivo' },
  { value: '24/7', label: 'acesso de qualquer lugar' },
];

/**
 * Split sign-in layout (shadcn login "split brand"): the form column comes
 * first in the markup, so tab order starts at the form; the brand panel is
 * decorative and hidden below lg.
 */
export function AuthLayout(props: ParentProps) {
  return (
    <div class="grid min-h-svh lg:grid-cols-2">
      <div class="flex flex-col gap-4 p-6 md:p-10">
        <div class="flex items-center justify-between gap-2">
          <a href={String(paths.entrar())} class="flex items-center gap-2 font-medium">
            <span class="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Icon icon={GraduationCap} />
            </span>
            {platform.name}
          </a>
          <ThemeToggle />
        </div>
        <div class="flex flex-1 items-center justify-center">
          <div class="w-full max-w-sm">{props.children}</div>
        </div>
        <p class="text-center text-xs text-balance text-muted-foreground">
          Ao acessar, você concorda com os{' '}
          <a href="#" class="underline underline-offset-4 hover:text-primary">
            Termos de uso
          </a>{' '}
          e a{' '}
          <a href="#" class="underline underline-offset-4 hover:text-primary">
            Política de privacidade
          </a>
          .
        </p>
      </div>

      <div
        aria-hidden="true"
        class="hidden border-l lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:justify-between lg:p-12"
      >
        <div class="max-w-md space-y-4">
          <p class="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            {platform.tagline}
          </p>
          <p class="text-4xl leading-tight font-semibold tracking-tight text-balance">
            Aprenda no seu ritmo, com quem já fez acontecer.
          </p>
        </div>

        <div class="space-y-8">
          <figure class="max-w-md space-y-4 rounded-xl border bg-card p-6">
            <Icon icon={Quote} class="size-6 text-muted-foreground" />
            <blockquote class="text-lg leading-relaxed">
              “Em três meses saí do zero para uma audiência que compra de mim. O passo a passo das
              aulas e as mentorias mudaram meu jogo.”
            </blockquote>
            <figcaption class="flex items-center gap-3">
              <Avatar
                name="Juliana Prado"
                class="size-9"
                fallbackClass="bg-muted text-foreground"
              />
              <span class="text-sm leading-tight">
                <span class="block font-medium">Juliana Prado</span>
                <span class="text-muted-foreground">Membro desde 2025</span>
              </span>
            </figcaption>
          </figure>
          <dl class="grid max-w-md grid-cols-3 gap-4">
            <For each={highlights}>
              {(item) => (
                <div class="space-y-1">
                  <dt class="sr-only">{item.label}</dt>
                  <dd class="text-2xl font-semibold">{item.value}</dd>
                  <dd class="text-sm text-muted-foreground">{item.label}</dd>
                </div>
              )}
            </For>
          </dl>
        </div>
      </div>
    </div>
  );
}
