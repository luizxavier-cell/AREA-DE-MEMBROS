/// <reference types="vite/client" />
/// <reference types="@solidjs/vite-plugin/boundary-modules" />
/// <reference types="../file-routes.d.ts" />

declare module '*&as=picture' {
  const picture: import('vite-imagetools').Picture;
  export default picture;
}
