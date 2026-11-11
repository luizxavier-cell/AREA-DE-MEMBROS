import type { ChatMessage } from './types';
import { dayKey, formatChatDay } from './utils';

/** Messages this close together, from the same person, read as one group. */
const GROUP_WINDOW_MS = 5 * 60 * 1000;

export type ChatRow = {
  message: ChatMessage;
  /** Separator shown above this message when it opens a new day. */
  day?: string;
  startsGroup: boolean;
  endsGroup: boolean;
};

const sameGroup = (a: ChatMessage, b: ChatMessage) =>
  a.from === b.from &&
  dayKey(a.sentAt) === dayKey(b.sentAt) &&
  Math.abs(Date.parse(b.sentAt) - Date.parse(a.sentAt)) <= GROUP_WINDOW_MS;

export function chatRows(messages: ChatMessage[], now = Date.now()): ChatRow[] {
  return messages.map((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];
    const newDay = !previous || dayKey(previous.sentAt) !== dayKey(message.sentAt);
    return {
      message,
      day: newDay ? formatChatDay(message.sentAt, now) : undefined,
      startsGroup: !previous || !sameGroup(previous, message),
      endsGroup: !next || !sameGroup(message, next),
    };
  });
}
