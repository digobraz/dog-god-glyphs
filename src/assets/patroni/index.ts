// Auto-collected list of all patron SVGs in this folder.
// Vite's import.meta.glob with eager + url returns the resolved asset URLs.
const modules = import.meta.glob('./*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const patroniImages: string[] = Object.values(modules);