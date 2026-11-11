// The platform's data model. Everything here is plain JSON: query results
// are serialized from the server render into the page for hydration, so no
// functions, classes or Dates — dates travel as ISO strings.

export type LessonKind = 'video' | 'texto' | 'ao-vivo';

export type Material = {
  name: string;
  format: 'PDF' | 'XLSX' | 'ZIP' | 'Link';
  size?: string;
  href: string;
};

export type Lesson = {
  /** Unique within its course; used in the URL. */
  id: string;
  title: string;
  kind: LessonKind;
  durationSec: number;
  summary: string;
  /** HLS manifest (`.m3u8`) URL sent by the API. */
  videoUrl?: string;
  materials?: Material[];
};

export type CourseModule = {
  id: string;
  title: string;
  /** Drip content: the module unlocks at this instant (ISO). */
  releaseAt?: string;
  lessons: Lesson[];
};

/**
 * `liberado`: part of the member's plan. `bloqueado`: shown in the
 * storefront section with an offer link. `em-breve`: announced, not out yet.
 */
export type CourseAccess = 'liberado' | 'bloqueado' | 'em-breve';

export type CourseIcon =
  | 'sparkles'
  | 'rocket'
  | 'clapperboard'
  | 'fingerprint'
  | 'radio'
  | 'gift'
  | 'badge-check'
  | 'briefcase'
  | 'camera';

export type Course = {
  /** Slug, used in the URL. */
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos os níveis';
  instructor: string;
  /** Hue (0–360) of the generated cover gradient. */
  hue: number;
  icon: CourseIcon;
  /** Optional cover image; replaces the generated cover when set. */
  coverUrl?: string;
  access: CourseAccess;
  /** For `bloqueado`: where the member buys access. */
  offerUrl?: string;
  /** For `em-breve`: launch date (ISO). */
  launchAt?: string;
  outcomes: string[];
  updatedAt: string;
  modules: CourseModule[];
};

export type Member = {
  name: string;
  email: string;
  avatarUrl?: string;
  plan: string;
  memberSince: string;
};

export type Progress = {
  /** Completed lessons as "courseId/lessonId". */
  completed: string[];
  /** Last lesson opened per course. */
  lastLesson: Record<string, string>;
  /** Course the member studied most recently. */
  lastCourseId?: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  pinned?: boolean;
};

export type LiveEvent = {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  host: string;
  joinUrl: string;
};

export type Faq = { question: string; answer: string };

/** One message of the 1:1 chat between the member and the Creator. */
export type ChatMessage = {
  id: string;
  from: 'member' | 'creator';
  text: string;
  sentAt: string;
};
