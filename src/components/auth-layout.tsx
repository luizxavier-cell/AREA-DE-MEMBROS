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
        class="relative hidden overflow-hidden bg-[radial-gradient(120%_120%_at_100%_0%,oklch(0.55_0.25_293)_0%,oklch(0.3_0.14_285)_55%,oklch(0.18_0.06_280)_100%)] text-white lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:justify-between lg:p-12"
      >
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.16)_1px,transparent_0)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_at_top_right,black,transparent_75%)]" />
        <div class="absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />

        <div class="relative max-w-md space-y-4">
          <p class="text-sm font-medium tracking-widest text-white/70 uppercase">
            {platform.tagline}
          </p>
          <p class="text-4xl leading-tight font-semibold tracking-tight text-balance">
            Aprenda no seu ritmo, com quem já fez acontecer.
          </p>
        </div>

        <div class="relative space-y-8">
          <figure class="max-w-md space-y-4 rounded-xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
            <Icon icon={Quote} class="size-6 text-white/60" />
            <blockquote class="text-lg leading-relaxed">
              “Em três meses saí do zero para uma audiência que compra de mim. O passo a passo das
              aulas e as mentorias mudaram meu jogo.”
            </blockquote>
            <figcaption class="flex items-center gap-3">
              <Avatar name="Juliana Prado" class="size-9" fallbackClass="bg-white/20 text-white" />
              <span class="text-sm leading-tight">
                <span class="block font-medium">Juliana Prado</span>
                <span class="text-white/70">Membro desde 2025</span>
              </span>
            </figcaption>
          </figure>
          <dl class="grid max-w-md grid-cols-3 gap-4">
            <For each={highlights}>
              {(item) => (
                <div class="space-y-1">
                  <dt class="sr-only">{item.label}</dt>
                  <dd class="text-2xl font-semibold">{item.value}</dd>
                  <dd class="text-sm text-white/70">{item.label}</dd>
                </div>
              )}
            </For>
          </dl>
        </div>
      </div>
    </div>
  );
}
