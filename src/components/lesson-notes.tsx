import { Show, createEffect, createSignal } from 'solid-js';
import { Check } from 'lucide';

import { Button } from './ui/button';
import { Textarea } from './ui/form';
import { Icon } from './ui/icon';

/**
 * Private notes per lesson, kept in this browser (localStorage) until the
 * backend stores them. Loaded after hydration, so the server and the first
 * client render agree on an empty field.
 */
export function LessonNotes(props: { storageKey: string }) {
  const [text, setText] = createSignal('');
  const [status, setStatus] = createSignal<'idle' | 'saved'>('idle');

  createEffect(
    () => props.storageKey,
    (key) => {
      let saved = '';
      try {
        saved = localStorage.getItem(key) ?? '';
      } catch {
        // Storage unavailable: notes simply start empty.
      }
      setText(saved);
      setStatus('idle');
    },
  );

  const save = (event: SubmitEvent) => {
    event.preventDefault();
    try {
      if (text().trim()) localStorage.setItem(props.storageKey, text());
      else localStorage.removeItem(props.storageKey);
    } catch {
      // Not persisted; keep the text on screen.
    }
    setStatus('saved');
  };

  return (
    <form class="space-y-3" onSubmit={save}>
      <label for="anotacoes" class="sr-only">
        Suas anotações
      </label>
      <Textarea
        id="anotacoes"
        rows={6}
        placeholder="Escreva aqui os seus insights, dúvidas e próximos passos desta aula…"
        value={text()}
        onInput={(event) => {
          setText(event.currentTarget.value);
          setStatus('idle');
        }}
        class="min-h-32"
      />
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs text-muted-foreground">Suas anotações ficam salvas neste navegador.</p>
        <div class="flex items-center gap-3">
          <Show when={status() === 'saved'}>
            <span role="status" class="flex items-center gap-1 text-sm text-success">
              <Icon icon={Check} />
              Salvo
            </span>
          </Show>
          <Button type="submit" size="sm">
            Salvar anotação
          </Button>
        </div>
      </div>
    </form>
  );
}
