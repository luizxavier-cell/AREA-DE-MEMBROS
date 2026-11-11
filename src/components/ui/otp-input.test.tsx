import { fireEvent, render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { describe, expect, test } from 'vitest';

import { OtpInput } from './otp-input';

function setup() {
  const [code, setCode] = createSignal('');
  const view = render(() => (
    <OtpInput aria-label="Código" value={code()} onValueChange={setCode} length={6} />
  ));
  const input = view.getByLabelText('Código') as HTMLInputElement;
  const type = (text: string) => {
    fireEvent.input(input, { target: { value: text } });
    flush();
  };
  return { ...view, code, input, type };
}

describe('<OtpInput />', () => {
  test('renders one slot per digit and fills them in order', () => {
    const { container, type } = setup();
    const slots = () => [...container.querySelectorAll('[aria-hidden="true"]')];
    expect(slots()).toHaveLength(6);

    type('42');
    expect(slots().map((slot) => slot.textContent)).toEqual(['4', '2', '', '', '', '']);
  });

  test('keeps only digits, also from a formatted paste', () => {
    const { code, input, type } = setup();
    type('12a 34-56');
    expect(code()).toBe('123456');
    expect(input.value).toBe('123456');
  });

  test('ignores digits past the length', () => {
    const { code, type } = setup();
    type('12345678');
    expect(code()).toBe('123456');
  });

  test('rejected characters do not stay in the field', () => {
    const { code, input, type } = setup();
    type('1');
    type('1x');
    expect(code()).toBe('1');
    expect(input.value).toBe('1');
  });
});
