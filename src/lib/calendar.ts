import type { LiveEvent } from './types';

const stamp = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

/** "Add to Google Calendar" link for a live session. */
export function googleCalendarUrl(event: LiveEvent) {
  const start = new Date(event.startsAt);
  const end = new Date(start.getTime() + event.durationMin * 60_000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: `Encontro ao vivo com ${event.host}.`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
