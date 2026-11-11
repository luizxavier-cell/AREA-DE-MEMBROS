import type { JSX as SolidJSX } from '@solidjs/web';

// The Video.js custom elements used in JSX (see components/video-player.tsx).
declare module '@solidjs/web' {
  namespace JSX {
    interface IntrinsicElements {
      'media-i18n': SolidJSX.HTMLAttributes<HTMLElement>;
      'video-player': SolidJSX.HTMLAttributes<HTMLElement>;
      'video-skin': SolidJSX.HTMLAttributes<HTMLElement>;
      'hlsjs-video': SolidJSX.VideoHTMLAttributes<HTMLVideoElement>;
    }
  }
}
