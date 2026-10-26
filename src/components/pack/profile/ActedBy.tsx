// K4 · ŠTÍTOK AUTORA (26. 10. 2026) — nákres `plany/nakresy/pawmate-k4-autor-2026-10-27/index.html` §1 B.
// Matej „ok": fotka + meno, BEZ slovesa — „pridala/pridal" chce pohlavie, ktoré o pawmatovi nevieme,
// a meno sa neskloňuje. Kto to urobil, zapisuje DB (`acted_by`), štítok ho len ukazuje.
// Meno berie `actor_cards()` — ukáže pawmata aj vtedy, keď ho pawtner v hlave profilu neukazuje.
// Tvar = PILULKA z katalógu (`.pk-pill`), nie nový blok; mení sa len hustota (je to štítok v riadku).
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sizedUrl } from '@/services/cloudinaryService';
import { FONT_TITLE, PACK_SPACE, PACK_TEXT, PILL_CSS } from '@/components/pack/packTheme';

type Card = { name: string; photo: string | null };

// Jedno meno = jedna otázka za session; štítky v mriežke sa pýtajú naraz.
const cache = new Map<string, Promise<Card | null>>();

// `actor_cards` nie je v generovaných typoch.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

function actorCard(id: string): Promise<Card | null> {
  let p = cache.get(id);
  if (!p) {
    p = Promise.resolve(db.rpc('actor_cards', { p_ids: [id] })).then(({ data }: { data: unknown }) => {
      const r = Array.isArray(data) ? (data[0] as Record<string, unknown> | undefined) : undefined;
      if (!r) return null;
      return { name: typeof r.name === 'string' ? r.name : '', photo: typeof r.photo === 'string' ? r.photo : null };
    }).catch(() => null);
    cache.set(id, p);
  }
  return p;
}

export const ACTED_BY_CSS = `${PILL_CSS}
.k4-by.pk-pill{gap:${PACK_SPACE.xs}px;padding:2px ${PACK_SPACE.sm}px 2px 2px;vertical-align:middle;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;line-height:1.4;} /* písmo: meno */
.k4-by img,.k4-by i{width:18px;height:18px;border-radius:999px;object-fit:cover;flex:none;}
.k4-by i{display:grid;place-items:center;font-style:normal;font-size:${PACK_TEXT.micro}px;color:#FFFDF7;background:#7a5a2a;}
`;

/** `name` = meno zapísané pri čine (`acted_name`) — štítok ostane, aj keď účet pawmata už zanikol. */
export function ActedBy({ id, name, fallback = 'pawmate' }: { id: string | null | undefined; name?: string | null; fallback?: string }) {
  const [card, setCard] = useState<Card | null>(null);
  useEffect(() => {
    if (!id) { setCard(null); return; }
    let alive = true;
    void actorCard(id).then((c) => { if (alive) setCard(c); });
    return () => { alive = false; };
  }, [id]);
  if (!card && !name) return null;
  const nm = card?.name || name || fallback;
  return (
    <>
      <style>{ACTED_BY_CSS}</style>
      <span className="pk-pill k4-by">
        {card?.photo ? <img src={sizedUrl(card.photo, 40)} alt="" /> : <i>{nm[0].toUpperCase()}</i>}
        {nm}
      </span>
    </>
  );
}
