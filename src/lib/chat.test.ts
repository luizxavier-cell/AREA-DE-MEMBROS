import { describe, expect, it } from 'vitest';

import { chatRows } from './chat';
import type { ChatMessage } from './types';

const message = (id: string, from: ChatMessage['from'], sentAt: string): ChatMessage => ({
  id,
  from,
  text: id,
  sentAt,
});

const NOW = Date.parse('2026-11-11T12:00:00-03:00');

describe('chatRows', () => {
  it('groups messages from the same person sent close together', () => {
    const rows = chatRows(
      [
        message('a', 'member', '2026-11-11T10:00:00-03:00'),
        message('b', 'member', '2026-11-11T10:04:00-03:00'),
        message('c', 'creator', '2026-11-11T10:05:00-03:00'),
      ],
      NOW,
    );
    expect(rows.map((row) => [row.startsGroup, row.endsGroup])).toEqual([
      [true, false],
      [false, true],
      [true, true],
    ]);
  });

  it('splits a group after a long pause', () => {
    const rows = chatRows(
      [
        message('a', 'member', '2026-11-11T10:00:00-03:00'),
        message('b', 'member', '2026-11-11T10:06:00-03:00'),
      ],
      NOW,
    );
    expect(rows[1]?.startsGroup).toBe(true);
  });

  it('labels each new day in the platform time zone', () => {
    const rows = chatRows(
      [
        message('a', 'member', '2026-11-09T10:00:00-03:00'),
        message('b', 'member', '2026-11-10T23:30:00-03:00'),
        message('c', 'member', '2026-11-11T00:30:00-03:00'),
        message('d', 'creator', '2026-11-11T09:00:00-03:00'),
      ],
      NOW,
    );
    expect(rows.map((row) => row.day)).toEqual(['9 de nov.', 'Ontem', 'Hoje', undefined]);
  });
});
