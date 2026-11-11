// Registers the Video.js custom elements. VideoPlayer imports this on demand,
// in the browser only, so hls.js stays out of the server render and of the
// first bundle of every other page.
import '@videojs/html/i18n/locales/pt-BR/register';
import '@videojs/html/video/player';
import '@videojs/html/video/skin';
import '@videojs/html/media/hlsjs-video';
