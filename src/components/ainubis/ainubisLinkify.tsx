import type { ReactNode } from 'react';

// URL v texte správy → klikateľný odkaz (Matej 11. 10. 2026: správa o úprave výletu nesie
// https://dogypt.com/pack/map/...). Interný odkaz na dogypt.com/pack otvorí appku (router),
// cudzí ide do nového tabu. Text sa nikdy nevkladá ako HTML — len ako React uzly.
const URL_RE = /https?:\/\/[^\s<>"]+/g;
const TRAIL = /[.,;:!?)\]»”"']+$/;
/** Zobrazený text cudzieho odkazu sa skracuje (celá URL ostáva v `href`). */
const SHOW_MAX = 40;
const shortUrl = (u: string) => (u.length > SHOW_MAX ? `${u.slice(0, SHOW_MAX - 1)}…` : u);
/** Host MUSÍ mať bodku (`http://localhost`, `https://x` nie sú odkaz) a URL musí byť parsovateľná. */
function externalOk(raw: string): boolean {
  try {
    const u = new URL(raw);
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.');
  } catch {
    return false;
  }
}

/** Cesta v appke, ak je URL interná (dogypt.com/pack…), inak null. */
export function internalPath(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (!/^(www\.)?dogypt\.com$/i.test(u.hostname)) return null;
    if (u.pathname !== '/pack' && !u.pathname.startsWith('/pack/')) return null;
    return u.pathname + u.search + u.hash;
  } catch {
    return null;
  }
}

export function linkify(
  text: string,
  onInternal: (path: string) => void,
  className = 'ainubis-msg__link',
): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(URL_RE)) {
    const start = m.index ?? 0;
    const tail = m[0].match(TRAIL)?.[0] ?? '';
    const url = tail ? m[0].slice(0, -tail.length) : m[0];
    const path = internalPath(url);
    if (!path && !externalOk(url)) continue;               // nie je to odkaz → ostane ako holý text
    if (start > last) out.push(text.slice(last, start));
    out.push(
      path ? (
        <a
          key={`l${n++}`}
          className={className}
          href={path}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
            e.preventDefault();
            onInternal(path);
          }}
        >
          {url}
        </a>
      ) : (
        <a key={`l${n++}`} className={className} href={url} target="_blank" rel="noopener noreferrer nofollow ugc">
          {shortUrl(url)}
        </a>
      ),
    );
    last = start + url.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
