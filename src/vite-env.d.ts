/// <reference types="vite/client" />

// Preklady rozdelené na jadro a appku (vite-plugin-i18n-split.ts, perf 7. 10. 2026).
declare module 'virtual:i18n/*' {
  const dict: Record<string, string>;
  export default dict;
}
