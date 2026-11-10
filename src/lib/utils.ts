import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn's class combiner: later Tailwind utilities win over earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Ana Beatriz Souza" -> "AS" */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]![0] : '';
  return (first + last).toUpperCase();
}

/** Lesson length: 754 -> "12:34", 3725 -> "1:02:05". */
export function formatClock(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return [h > 0 ? String(h) : null, mm, String(s).padStart(2, '0')]
    .filter((part) => part !== null)
    .join(':');
}

/** Course length: 5400 -> "1h 30min", 900 -> "15min". */
export function formatDuration(seconds: number) {
  const totalMinutes = Math.round(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
});

const dayMonthFormat = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  timeZone: 'America/Sao_Paulo',
});

const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

/** "2026-11-03" -> "03 de nov. de 2026" */
export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

/** "2026-12-01" -> "1 de dez." — for tight spots such as a poster. */
export function formatDayMonth(iso: string) {
  return dayMonthFormat.format(new Date(iso));
}

/** "2026-11-12T20:00:00-03:00" -> "quinta-feira, 12 de novembro às 20:00" */
export function formatDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso));
}

/** Portuguese plural: plural(3, 'aula', 'aulas') -> "3 aulas" */
export function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}
