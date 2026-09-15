// DOČASNÝ — kolo 2 prevodu /pack, po kontrole zmazať.
import base from './vite.config';
export default async (env: Parameters<typeof base>[0]) => {
  const cfg = await (base as (e: unknown) => unknown)(env) as Record<string, unknown>;
  return { ...cfg, cacheDir: 'node_modules/.vite-qa',
           server: { ...(cfg.server as object), port: 5178, strictPort: true } };
};
