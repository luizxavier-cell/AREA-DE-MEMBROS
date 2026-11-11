import { Title } from '@solidjs/meta';
import type { RouteDefinition } from '@solidjs/router';
import { For, createMemo } from 'solid-js';
import { Clock, LifeBuoy, Mail } from 'lucide';

import { PageHeader } from '../../components/site-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { buttonVariants } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Icon } from '../../components/ui/icon';
import { getFaqs } from '../../lib/api';
import { platform } from '../../lib/config';
import { cn } from '../../lib/utils';

export const route = {
  preload: () => void getFaqs(),
} satisfies RouteDefinition;

export default function HelpPage() {
  const faqs = createMemo(() => getFaqs());

  return (
    <>
      <Title>{`Ajuda · ${platform.name}`}</Title>

      <div class="flex flex-1 flex-col gap-6 px-4 pt-6 sm:px-6 lg:px-12 lg:pt-10">
        <PageHeader
          title="Central de ajuda"
          description="Respostas rápidas para as dúvidas mais comuns."
        />

        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-labelledby="perguntas" class="space-y-4">
            <h2 id="perguntas" class="sr-only">
              Perguntas frequentes
            </h2>
            <Accordion class="rounded-xl border bg-card px-5">
              <For each={faqs()}>
                {(faq, index) => (
                  <AccordionItem name="faq" open={index() === 0}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent class="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                )}
              </For>
            </Accordion>
          </section>

          <aside class="flex flex-col gap-6">
            <Card class="gap-4">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Icon icon={LifeBuoy} class="text-primary" />
                  Fale com o suporte
                </CardTitle>
                <CardDescription>
                  Não encontrou o que procurava? Nossa equipe responde por e-mail.
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-2 text-sm text-muted-foreground">
                <p class="flex items-center gap-2">
                  <Icon icon={Mail} />
                  {platform.supportEmail}
                </p>
                <p class="flex items-center gap-2">
                  <Icon icon={Clock} />
                  Seg. a sex., das 9h às 18h
                </p>
              </CardContent>
              <CardFooter>
                <a href={`mailto:${platform.supportEmail}`} class={cn(buttonVariants(), 'w-full')}>
                  Enviar e-mail
                </a>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
