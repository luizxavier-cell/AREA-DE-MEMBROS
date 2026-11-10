import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact, expectNoDiagnostics } from '@solidjs/diagnostics';
import { flush } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

function Example(props: { onChange?: (value: string) => void }) {
  return (
    <Tabs defaultValue="perfil" onValueChange={props.onChange}>
      <TabsList aria-label="Seções">
        <TabsTrigger value="perfil">Perfil</TabsTrigger>
        <TabsTrigger value="seguranca">Segurança</TabsTrigger>
      </TabsList>
      <TabsContent value="perfil">Dados do perfil</TabsContent>
      <TabsContent value="seguranca">Troca de senha</TabsContent>
    </Tabs>
  );
}

describe('<Tabs />', () => {
  test('shows the default panel and switches on click', () => {
    const changes: string[] = [];
    const { getByRole, getByText } = render(() => <Example onChange={(v) => changes.push(v)} />);

    expect(getByRole('tab', { name: 'Perfil' })).toHaveAttribute('aria-selected', 'true');
    expect(getByText('Dados do perfil')).toBeVisible();
    expect(getByText('Troca de senha')).not.toBeVisible();

    fireEvent.click(getByRole('tab', { name: 'Segurança' }));
    flush();

    expect(getByRole('tab', { name: 'Segurança' })).toHaveAttribute('aria-selected', 'true');
    expect(getByText('Troca de senha')).toBeVisible();
    expect(getByText('Dados do perfil')).not.toBeVisible();
    expect(changes).toEqual(['seguranca']);
  });

  test('arrow keys move between tabs', () => {
    const { getByRole } = render(() => <Example />);
    const first = getByRole('tab', { name: 'Perfil' });
    first.focus();

    fireEvent.keyDown(getByRole('tablist'), { key: 'ArrowRight' });
    flush();

    const second = getByRole('tab', { name: 'Segurança' });
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute('aria-selected', 'true');
  });

  test('switching tabs trips no reactivity diagnostic', async () => {
    const { artifact } = await captureArtifact(
      () => {
        const { getByRole } = render(() => <Example />);
        fireEvent.click(getByRole('tab', { name: 'Segurança' }));
        flush();
      },
      { scenario: 'tabs-switch' },
    );
    expectNoDiagnostics(artifact);
  });
});
