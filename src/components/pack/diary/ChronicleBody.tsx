// ════════════════════════════════════════════════════════════════════════════
// TELO KRONIKY — NAPÍSAŤ, filter psov, zápisy po mesiacoch → DŇOCH, úprava a zmazanie.
// Jedno telo pre dve miesta (audit appky 30. 10. 2026, D·10): obrazovka `/pack/dogs/chronicle`
// a záložka Denník na profile JA. Kronika sa nekopíruje — mení sa tu a platí na oboch.
// ⚠️ Zápis (`DiaryEntry`) je prekryv NAD stránkou (lock §4.2) — človek z kroniky neodíde.
// ════════════════════════════════════════════════════════════════════════════
import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  PACK_THEME, PACK_HEAD, PACK_SPACE, PACK_TEXT, PACK_R, GOLD_BTN, PACK_BOX,
  FONT_TITLE, /* písmo: cta */ FONT_UI, PILL_CSS, PHOTO_CSS,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { DiaryEntry, type DiaryEditTarget } from './DiaryEntry';
import { DiaryItem, DIARY_LIST_CSS, useDiaryRows, type DiaryRow } from './DiaryList';
import { loadPackDogs } from '@/lib/packDogsList';
import { APP_NEW } from '@/lib/packFlags';
import { loadZapisDays, KIND_EMOJI, type ZapisDay } from '@/components/pack/profile/zapisDnaModel';

/** V appke NAPÍSAŤ = TEN ISTÝ panel ako labka, len s pásom dní (Matej 31. 10. 2026: „áno“ nad nákresom
 *  `plany/nakresy/zapis-dna-2026-10-31/` · NAPÍSAŤ Z KRONIKY). Staré okno „Do denníka“ ostáva len webu. */
const ZapisDna = lazy(() => import('@/components/pack/profile/ZapisDna').then((m) => ({ default: m.ZapisDna })));

const T = PACK_THEME;
type Tx = (key: string, fallback: string) => string;
type ChronDog = { id: string; dog_name: string | null };

export function ChronicleBody({ tx }: { tx: Tx }) {
  const [dogs, setDogs] = useState<ChronDog[] | null>(null);
  const [dogSel, setDogSel] = useState<string>('all');
  const [write, setWrite] = useState(false);
  const [editing, setEditing] = useState<DiaryEditTarget | null>(null);

  useEffect(() => {
    let alive = true;
    loadPackDogs<ChronDog>('id, dog_name').then((rows) => { if (alive) setDogs(rows); });
    return () => { alive = false; };
  }, []);

  const rows = useDiaryRows((dogs ?? []).map((d) => d.id), { weights: true });
  // Ťuky z „Zapíš dnešok" (`devotion_events`) — tá istá funkcia ako ✓ v kalendári DENNÍKA. Dovtedy ich človek
  // po zápise nevidel nikde (test 31. 10. 2026: 5 ťukov = len „+5" v bunke kalendára).
  const [zapis, setZapis] = useState<ZapisDay[]>([]);
  useEffect(() => {
    if (!APP_NEW) return;
    let alive = true;
    const load = () => { loadZapisDays().then((d) => { if (alive) setZapis(d); }).catch(() => {}); };
    load();
    window.addEventListener('dogypt:zapis', load);
    window.addEventListener('dogypt:devotion', load);
    return () => { alive = false; window.removeEventListener('dogypt:zapis', load); window.removeEventListener('dogypt:devotion', load); };
  }, []);
  const nameOf = (id: string) => dogs?.find((d) => d.id === id)?.dog_name ?? '';
  const many = (dogs?.length ?? 0) > 1;

  // Filter → MESIACE (kapitoly) → DNI. JEDEN DEŇ = JEDNA KARTA (Matej 31. 10. 2026 nad testom troch zápisov:
  // „tie zápisky by chceli opraviť" — tri karty „Poznámka" za ten istý deň). Ďalší zápis v ten deň sa pridá
  // do tej istej karty. Deň len s ťukmi (bez textu) má kartu tiež — inak by ťuky ostali neviditeľné.
  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
  const months = useMemo(() => {
    const list = (rows ?? []).filter((r) => dogSel === 'all' || r.dogId === dogSel);
    const days = new Map<string, { day: string; items: DiaryRow[]; emojis: string[] }>();
    for (const r of list) {
      const k = localDay(r.recordedAt);
      (days.get(k) ?? days.set(k, { day: k, items: [], emojis: [] }).get(k)!).items.push(r);
    }
    for (const z of zapis) {
      const e = z.kinds.map((k) => KIND_EMOJI[k]).filter(Boolean);
      if (!e.length) continue;
      (days.get(z.day) ?? days.set(z.day, { day: z.day, items: [], emojis: [] }).get(z.day)!).emojis = e;
    }
    // V karte dňa ráno → večer (podľa okamihu zápisu); dni najnovší hore.
    for (const d of days.values()) d.items.sort((a, b) => (a.createdAt ?? a.recordedAt).localeCompare(b.createdAt ?? b.recordedAt));
    const sorted = [...days.values()].sort((a, b) => b.day.localeCompare(a.day));
    const out: { label: string; days: typeof sorted }[] = [];
    for (const d of sorted) {
      const label = dayDate(d.day).toLocaleDateString(lang, { month: 'long', year: 'numeric' });
      const last = out[out.length - 1];
      if (last && last.label === label) last.days.push(d); else out.push({ label, days: [d] });
    }
    return out;
  }, [rows, zapis, dogSel, lang]);

  const cta: CSSProperties = {
    width: '100%', maxWidth: 320, borderRadius: PACK_R.field, padding: `${PACK_SPACE.md}px ${PACK_SPACE.lg}px`,
    fontFamily: FONT_TITLE, /* písmo: cta */
    fontSize: PACK_TEXT.label, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
    cursor: 'pointer', whiteSpace: 'nowrap', background: LAPIS.grad, border: `1px solid ${GOLD_BTN.edge}`,
    color: LAPIS.ink, boxShadow: LAPIS_BTN_SHADOW,
  };

  return (
    <>
      <style>{PILL_CSS}{PHOTO_CSS}{DIARY_LIST_CSS}{CHRONICLE_CSS}</style>
      {/* Jediné CTA NAPÍSAŤ (Matej 8. 10.: „bez CTA photo, iba write"). Kniha s packou nad ním
          zanikla 31. 10. 2026 — Matej: „nemusí tam byť tá kniha už" (`ChronicleBook.tsx` ostáva nepoužitý). */}
      <div className="chr-hero">
        <button type="button" style={cta} onClick={() => setWrite(true)}>{tx('pack.chronicle.write', 'Write')}</button>
      </div>

      {many && (
        <div className="chr-pills">
          <button type="button" className={`pk-pill pk-pill--tap chr-pill${dogSel === 'all' ? ' on' : ''}`} onClick={() => setDogSel('all')}>
            {tx('pack.chronicle.allDogs', 'All')}
          </button>
          {dogs!.map((d) => (
            <button key={d.id} type="button" className={`pk-pill pk-pill--tap chr-pill${dogSel === d.id ? ' on' : ''}`} onClick={() => setDogSel(d.id)}>
              {d.dog_name ?? '—'}
            </button>
          ))}
        </div>
      )}
      {/* Filter VŠETKO / FOTKY zanikol (Matej 8. 10.: „toto nechápem, everything a photos…
          tam nemusí byť nič zatiaľ"). Fotka je príloha zápisu, nie druh obsahu. */}

      {rows === null && <p className="chr-hint">{tx('pack.diary.loading', 'Loading…')}</p>}
      {rows !== null && months.length === 0 && (
        <p className="chr-hint">{tx('pack.diary.empty', 'Nothing written yet. The first entry starts the story.')}</p>
      )}
      {months.map((m) => (
        <div key={m.label} className="chr-month">
          <div style={{ ...PACK_HEAD.section, color: T.inkWarm }}>{m.label}</div>
          <div className="dl-list">
            {m.days.map((d) => {
              const dt = dayDate(d.day);
              return (
                <article key={d.day} className="chr-day" style={{ ...PACK_BOX.subblock }}>
                  <div className="chr-dayhead">
                    <div className="chr-daynum">
                      <b>{dt.getDate()}</b>
                      <small>{dt.toLocaleDateString(lang, { weekday: 'short' }).replace('.', '')}</small>
                    </div>
                    {d.emojis.length > 0
                      ? <div className="chr-dayemo" aria-label={tx('pack.chronicle.dayTaps', 'Logged that day')}>{d.emojis.map((e) => <span key={e}>{e}</span>)}</div>
                      : <div className="chr-daylbl">{dt.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' })}</div>}
                  </div>
                  {d.items.map((r) => (
                    <DiaryItem key={r.key} row={r} inDay dogName={many ? nameOf(r.dogId) : undefined} tx={tx}
                      onEdit={(row) => setEditing({ id: row.id, dogId: row.dogId, field: row.field, value: row.value, recordedAt: row.recordedAt })} />
                  ))}
                </article>
              );
            })}
          </div>
        </div>
      ))}

      {write && APP_NEW && (
        <Suspense fallback={null}><ZapisDna pickDay onClose={() => setWrite(false)} /></Suspense>
      )}
      {write && !APP_NEW && dogs && dogs.length > 0 && (
        <DiaryEntry
          dogs={dogs.map((d) => ({ id: d.id, name: d.dog_name ?? '—' }))}
          // Filter na jedného psa = NAPÍSAŤ ho predvyplní (audit 30. 10. 2026).
          dogId={dogSel !== 'all' ? dogSel : undefined}
          mode="write"
          onClose={() => setWrite(false)}
          tx={tx}
        />
      )}
      {editing && dogs && (
        <DiaryEntry
          dogs={dogs.map((d) => ({ id: d.id, name: d.dog_name ?? '—' }))}
          edit={editing}
          onClose={() => setEditing(null)}
          tx={tx}
        />
      )}
    </>
  );
}

/** `YYYY-MM-DD` miestneho dňa — kľúč karty dňa (ťuky nesú bratislavský `meta.day` v tom istom tvare). */
function localDay(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function dayDate(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

const CHRONICLE_CSS = `
.chr-pills{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;margin-bottom:${PACK_SPACE.lg}px}
.chr-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase}
.chr-pill.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.chr-hero{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.lg}px;margin:${PACK_SPACE.sm}px 0 ${PACK_SPACE.xl}px}
.chr-hint{font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkWarm};margin:0}
.chr-day{padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px ${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px}
.chr-dayhead{display:flex;align-items:center;gap:${PACK_SPACE.md}px}
.chr-daynum{flex:none;width:48px;height:48px;border-radius:${PACK_R.pill}px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${GOLD_BTN.grad};border:1px solid ${GOLD_BTN.edge};color:${T.inkStrong}}
.chr-daynum b{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.h2}px;line-height:1}
.chr-daynum small{font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:0.14em;text-transform:uppercase}
.chr-dayemo{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif;font-size:${PACK_TEXT.h2}px;line-height:1}
.chr-daylbl{font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;color:${T.inkWarm}}
.chr-daylbl::first-letter{text-transform:uppercase}
.chr-month{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;margin-bottom:${PACK_SPACE.xl}px}
`;
