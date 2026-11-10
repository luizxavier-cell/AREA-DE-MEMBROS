import type { ParentProps } from 'solid-js';

import authImage from '../assets/auth-panel.jpg?w=720;960;1440;1920&format=avif;webp;jpg&as=picture';
import { ThemeToggle } from './theme-toggle';

/**
 * Split sign-in layout (shadcn login "split brand"): the form column comes
 * first in the markup, so tab order starts at the form; the image panel is
 * decorative and hidden below lg.
 */
export function AuthLayout(props: ParentProps) {
  return (
    <div class="grid min-h-svh lg:grid-cols-2">
      <div class="flex flex-col gap-4 p-6 md:p-10">
        <div class="flex justify-end">
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

      {/* Variants are generated at build time and served hashed and immutable.
          Lazy loading keeps the image out of the critical path, and browsers
          skip it entirely below lg, where the panel is display:none. */}
      <div
        aria-hidden="true"
        class="relative hidden border-l bg-muted lg:col-start-2 lg:row-start-1 lg:block"
      >
        <picture>
          <source type="image/avif" srcset={authImage.sources.avif} sizes="50vw" />
          <source type="image/webp" srcset={authImage.sources.webp} sizes="50vw" />
          <img
            src={authImage.img.src}
            alt=""
            loading="lazy"
            decoding="async"
            class="absolute inset-0 size-full object-cover"
          />
        </picture>
      </div>
    </div>
  );
}
