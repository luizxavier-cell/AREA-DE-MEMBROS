// Text measurement with Pretext: sizes that depend on a text's content, worked
// out from the font itself instead of being read back from the DOM. Everything
// here needs a canvas, so call it in the browser only, after hydration.
import { layout, measureLineStats, prepare, type PreparedText } from '@chenglou/pretext';

/** Must match the element's CSS: font, line-height, and `white-space: pre-wrap`. */
export type TextStyle = { font: string; lineHeight: number };

const PRE_WRAP = { whiteSpace: 'pre-wrap' } as const;

/** Waits for the glyphs this text needs, then does Pretext's one-time pass. */
export async function prepareText(text: string, style: TextStyle): Promise<PreparedText> {
  await document.fonts.load(style.font, text);
  return prepare(text, style.font, PRE_WRAP);
}

/**
 * The tightest box for a text within `maxWidth`. CSS alone leaves a wrapped
 * text's box at `maxWidth`, however short its longest line ends up.
 */
export function shrinkWrap(prepared: PreparedText, maxWidth: number, lineHeight: number) {
  const { lineCount, maxLineWidth } = measureLineStats(prepared, maxWidth);
  return { width: Math.min(Math.ceil(maxLineWidth), maxWidth), height: lineCount * lineHeight };
}

/** How many lines a <textarea> shows for this value at this content width. */
export function fieldLineCount(value: string, style: TextStyle, width: number) {
  if (!value) return 1;
  const { lineCount } = layout(prepare(value, style.font, PRE_WRAP), width, style.lineHeight);
  return lineCount + (value.endsWith('\n') ? 1 : 0);
}
