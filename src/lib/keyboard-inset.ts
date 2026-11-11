// How far a fixed surface has to lift to clear the iPhone's software keyboard.
// iOS doesn't resize the layout viewport for it, so `bottom: 0` stays behind
// the keyboard; only the visual viewport knows. Every constant below was
// measured on a real iPhone.
import { createSignal, flush, onSettled } from 'solid-js';

/** How long a lift waits for iOS to scroll the field up itself. */
const RISE_MS = 50;
/** How long a field letting go keeps asking whether the surface can come down. */
const LET_GO_MS = 300;
/** How long after taking the focus no iOS scroll is on its way. */
const TOOK_FOCUS_MS = 1000;
/** How long a lift made ahead of the keyboard waits to hear from iOS. */
const AHEAD_MS = 500;
/** How long a blur watches for the stale scroll iOS leaves behind. */
const SETTLE_MS = 1000;
/** Less than this off the visible area is the browser's bars, not a keyboard. */
const KEYBOARD_MIN_PX = 120;
const MEMORY_KEY = 'membros-keyboard';

const isTyping = () => document.activeElement instanceof HTMLTextAreaElement;

function recall(fixedHeight: number): number {
  try {
    const memory = JSON.parse(localStorage.getItem(MEMORY_KEY) ?? '{}');
    const inset = memory[Math.round(fixedHeight)];
    return typeof inset === 'number' && inset > 0 && inset < fixedHeight ? inset : 0;
  } catch {
    return 0; // Storage unavailable: the lift waits for iOS, as a first one does.
  }
}

function remember(fixedHeight: number, inset: number) {
  try {
    const memory = JSON.parse(localStorage.getItem(MEMORY_KEY) ?? '{}');
    memory[Math.round(fixedHeight)] = inset;
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch {
    // Not remembered: the next lift waits for iOS.
  }
}

/**
 * Tracks the keyboard for one fixed surface. Give the surface `bottom: inset`,
 * `data-keyboard={keyboard}` and the `keyboard-glide` utility.
 *
 * A tapped field takes the focus with `preventScroll`, so iOS doesn't scroll
 * the page and the surface's top stays on screen. The lift then sets out ahead
 * of the keyboard, by the height it had last time: iOS only reports it when it
 * is already a third of the way up.
 */
export function createKeyboardInset() {
  const [inset, setInset] = createSignal(0);
  const [ahead, setAhead] = createSignal(false);

  onSettled(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    // Held to the edges `position: fixed` resolves against. `innerHeight`
    // shrinks once iOS scrolls for a field; this box is what `bottom` counts from.
    const box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText =
      'position:fixed;top:0;bottom:0;left:0;width:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(box);

    let fromVisibleArea = false;
    let lettingGo = false;
    let applied = 0;
    let rising = 0;
    let aheadTimer = 0;
    let aheadUntil = 0;
    let tookFocusAt = -Infinity;
    let finger = false;
    let letGoFrame = 0;
    let settleFrame = 0;

    const measure = () => {
      const rect = box.getBoundingClientRect();
      // iOS measures a fixed box from the visible area, so its top is minus the
      // scroll, and it is right half a second before `offsetTop` is.
      const scrolledBy = -rect.top || 0;
      if (scrolledBy >= 1) fromVisibleArea = true;
      // No field, no keyboard, once iOS has put the page back: it goes on
      // reporting the keyboard for 660ms after the field lets go.
      if (!isTyping() && (!lettingGo || scrolledBy < 1)) {
        return { inset: 0, scrolled: false, fixedHeight: 0 };
      }
      const fixedHeight = rect.height || window.innerHeight;
      const offset = fromVisibleArea ? scrolledBy : Math.max(viewport.offsetTop, scrolledBy);
      return {
        // Whole pixels: a third of a pixel "covered" would read as a keyboard.
        inset: Math.max(0, Math.round(fixedHeight - viewport.height - offset)),
        scrolled: offset >= 1,
        fixedHeight,
      };
    };

    const apply = (value: number, isAhead = false) => {
      applied = value;
      setInset(value);
      setAhead(value > 0 && isAhead);
    };

    const update = () => {
      const reading = measure();
      // Ahead of the keyboard: until iOS reports it, its "nothing" means nothing.
      if (reading.inset === 0 && performance.now() < aheadUntil && isTyping()) return;
      if (reading.inset > 0) aheadUntil = 0;
      if (reading.inset > KEYBOARD_MIN_PX && !reading.scrolled) {
        remember(reading.fixedHeight, reading.inset);
      }
      // A first lift waits a moment for iOS's own scroll, unless we took the focus.
      const scrollMayCome = performance.now() - tookFocusAt > TOOK_FOCUS_MS;
      if (reading.inset > 0 && applied === 0 && !reading.scrolled && scrollMayCome) {
        rising ||= window.setTimeout(() => {
          rising = 0;
          apply(measure().inset);
        }, RISE_MS);
        return;
      }
      window.clearTimeout(rising);
      rising = 0;
      apply(reading.inset);
    };

    const takeFocus = (target: EventTarget | null) => {
      if (!(target instanceof HTMLTextAreaElement) || target.disabled) return false;
      const fixedHeight = box.getBoundingClientRect().height || window.innerHeight;
      const focused = target === document.activeElement;
      // With the keyboard up, a tap on the field places the caret.
      if (focused && fixedHeight - viewport.height > KEYBOARD_MIN_PX) return false;
      if (focused) target.blur();
      tookFocusAt = performance.now();
      const remembered = applied > 0 ? 0 : recall(fixedHeight);
      if (remembered) {
        aheadUntil = performance.now() + AHEAD_MS;
        window.clearTimeout(aheadTimer);
        aheadTimer = window.setTimeout(update, AHEAD_MS);
        apply(remembered, true);
        // Committed first: focus() holds the thread ~60ms while iOS readies it.
        flush();
      }
      target.focus({ preventScroll: true });
      return true;
    };

    const onPointerDown = (event: PointerEvent) => {
      finger = event.pointerType === 'touch';
    };
    // iOS focuses the field on touchend; a non-cancelable one ended a scroll.
    const onTouchEnd = (event: TouchEvent) => {
      if (event.defaultPrevented || !event.cancelable) return;
      if (takeFocus(event.target)) event.preventDefault();
    };
    // Where WebKit aims the touch at the form, only mouse events reach the field.
    const onMouseDown = (event: MouseEvent) => {
      if (event.defaultPrevented || !finger) return;
      if (takeFocus(event.target)) event.preventDefault();
    };

    // A field letting go is the keyboard going, before the viewport says so.
    const onLetGo = () => {
      cancelAnimationFrame(letGoFrame);
      lettingGo = true;
      const since = performance.now();
      const step = () => {
        if (!isTyping()) update();
        if (!isTyping() && applied > 0 && performance.now() - since < LET_GO_MS) {
          letGoFrame = requestAnimationFrame(step);
          return;
        }
        lettingGo = false;
        if (!isTyping()) update();
      };
      letGoFrame = requestAnimationFrame(step);
    };

    // iOS can leave the page scrolled past its end once the keyboard goes, and
    // it hit-tests taps by that stale scroll. Nothing moves on screen.
    const settle = () => {
      cancelAnimationFrame(settleFrame);
      const since = performance.now();
      const step = () => {
        if (isTyping()) return;
        const end = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        if (window.scrollY > end) window.scrollTo(window.scrollX, end);
        else if (performance.now() - since < SETTLE_MS) settleFrame = requestAnimationFrame(step);
      };
      settleFrame = requestAnimationFrame(step);
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    document.addEventListener('focusout', settle);
    document.addEventListener('focusout', onLetGo);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('touchend', onTouchEnd, { capture: true, passive: false });
    document.addEventListener('mousedown', onMouseDown, true);

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
      document.removeEventListener('focusout', settle);
      document.removeEventListener('focusout', onLetGo);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('touchend', onTouchEnd, true);
      document.removeEventListener('mousedown', onMouseDown, true);
      cancelAnimationFrame(letGoFrame);
      cancelAnimationFrame(settleFrame);
      window.clearTimeout(rising);
      window.clearTimeout(aheadTimer);
      box.remove();
    };
  });

  return {
    inset,
    /** For `data-keyboard`: set while up, "ahead" when the lift set out before it. */
    keyboard: () => (inset() > 0 ? (ahead() ? 'ahead' : '') : undefined),
  };
}
