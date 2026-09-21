// ============================================================================
// KTO TADIAĽ PREŠIEL — zoznam pod „Prešlo N Dogypťanov" v článku výletu
//
// Matej 21. 9. 2026: „potrebujem, aby ku každému tripu bola tabuľka (kto prešiel)
// a označil ako prejdené". Tabuľka `trip_walked` existovala od júla, ale appka z nej
// ukazovala len číslo — a to navyše len seed + môj hlas (RLS púšťa len vlastné riadky).
//
// Dáta: RPC `trip_walkers(slug)` (migrácia `20260921_trip_crowd.sql`). Identita je
// v rovnakom rozsahu ako recenzie (`list_trip_reviews`): KRSTNÉ meno + psy s ich
// VLASTNÝM psím číslom. Číslo majiteľa sa tu zámerne nerátá (CLAUDE.md, Identita).
//
// Riadok = RIADOK z katalógu `PACK_BLOCKS`, pes = PILULKA (štítok, nie voľba).
// ============================================================================
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME as T, FONT_TITLE, FONT_UI, PACK_R, PACK_SPACE, PACK_TEXT, PILL_CSS } from '@/components/pack/packTheme';

interface Walker { isMine: boolean; ownerFirst: string | null; dogs: { name: string; n: number | null }[] }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
/** Koľko riadkov je vidno hneď; zvyšok za „Zobraziť všetkých" — 50 chodcov nesmie zavaliť článok. */
const FIRST = 8;

const CSS = `
.twk-list{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.md}px;}
.twk-row{display:flex;flex-wrap:wrap;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${T.hairline};}
.twk-name{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;color:${T.inkStrong};}
.twk-me{font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;color:${T.inkWarm};}
.twk-dogs{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.xs}px;}
.twk-dogs .pk-pill{padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;font-size:${PACK_TEXT.label}px;}
.twk-dog{font-family:${FONT_TITLE};font-weight:700;}
.twk-num{font-family:${FONT_UI};font-weight:600;}
.twk-more{align-self:flex-start;background:none;border:none;padding:${PACK_SPACE.xs}px 0;cursor:pointer;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkWarm};text-decoration:underline;}
`;

export function TripWalkers({ tripSlug, reloadKey }: { tripSlug: string; reloadKey?: unknown }) {
  const t = useT();
  const [rows, setRows] = useState<Walker[] | null>(null);
  const [all, setAll] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const { data, error } = await db.rpc('trip_walkers', { p_trip_slug: tripSlug });
        if (!live || error || !Array.isArray(data)) return;
        setRows(data.map((r: { is_mine: boolean; owner_first: string | null; dogs: { name: string; n: number | null }[] }) => ({
          isMine: !!r.is_mine, ownerFirst: r.owner_first, dogs: Array.isArray(r.dogs) ? r.dogs : [],
        })));
      } catch {
        // bez RPC (neprihlásený / výpadok) sa zoznam jednoducho neukáže — číslo nad ním ostáva
      }
    })();
    return () => { live = false; };
  }, [tripSlug, reloadKey]);

  if (!rows || rows.length === 0) return null;
  const shown = all ? rows : rows.slice(0, FIRST);
  return (
    <div className="twk-list">
      <style>{PILL_CSS + CSS}</style>
      {shown.map((w, i) => (
        <div className="twk-row" key={i}>
          <span className="twk-name">{w.ownerFirst ?? t('pack.trip.cm.dogyptian')}</span>
          {w.isMine && <span className="twk-me">{t('pack.trip.walkers.you')}</span>}
          <span className="twk-dogs">
            {w.dogs.map((d, j) => (
              <span className="pk-pill" key={j}>
                <span className="twk-dog">{d.name}</span>
                {d.n != null && <span className="twk-num">#{d.n}</span>}
              </span>
            ))}
          </span>
        </div>
      ))}
      {!all && rows.length > FIRST && (
        <button type="button" className="twk-more" onClick={() => setAll(true)}>
          {t('pack.trip.walkers.showAll', { n: rows.length })}
        </button>
      )}
    </div>
  );
}
