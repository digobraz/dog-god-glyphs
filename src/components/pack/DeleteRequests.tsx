// K4c · ŽIADOSTI O ZMAZANIE (26. 10. 2026) — nákres `plany/nakresy/pawmate-k4-autor-2026-10-27/index.html` §3.
// Matej: *„ona len označí ale zmazať ich nemôže"* ⇒ o každej fotke rozhoduje pawtner: NECHAŤ / ZMAZAŤ.
// Nevybavená žiadosť tu ostáva aj po zániku pawmatovho účtu; nič sa nemaže samo.
// Stojí na začiatku Moja svorka (`PawmatesSection`) — kým nie je čo rozhodnúť, neexistuje.
import { useEffect, useState } from 'react';
import { useT, useLang } from '@/i18n/LanguageContext';
import { sizedUrl } from '@/services/cloudinaryService';
import { PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_THEME as T, FONT_TITLE, FONT_UI, PILL_CSS } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { fetchDeleteRequests, decideDeleteRequest, type DeleteRequest } from '@/lib/pawmateDeparture';

const CSS = `${PILL_CSS}
.dr-row{display:flex;align-items:center;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.sm}px 0;border-top:1px solid ${T.border};}
.dr-row:first-of-type{border-top:0;}
.dr-th{width:48px;height:48px;border-radius:${PACK_R.tile}px;object-fit:cover;flex:none;background:${T.border};}
.dr-txt{flex:1;min-width:0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dr-go{border:none;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;}
.dr-go:disabled,.dr-keep:disabled{opacity:.45;cursor:default;}
.dr-keep{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;}
`;

export function DeleteRequests() {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [rows, setRows] = useState<DeleteRequest[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void fetchDeleteRequests().then((r) => { if (alive) setRows(r); });
    return () => { alive = false; };
  }, []);

  if (!rows.length) return null;

  const decide = async (id: string, del: boolean) => {
    setBusy(id);
    try {
      await decideDeleteRequest(id, del);
      setRows((r) => r.filter((x) => x.id !== id));
    } finally { setBusy(null); }
  };
  const who = rows[0].requesterName || 'Pawmate';
  const date = (iso: string) => {
    try { return new Date(iso).toLocaleDateString(lang, { day: 'numeric', month: 'short' }); } catch { return ''; }
  };

  return (
    <div style={{ ...PACK_BOX.subblock, padding: PACK_SPACE.lg, marginBottom: PACK_SPACE.lg }}>
      <style>{CSS}</style>
      <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: PACK_TEXT.body, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkStrong, marginBottom: PACK_SPACE.sm }}>{/* písmo: nadpis */}
        {tx('pack.leave.ownerTitle', '{name} asks to delete {n}').split('{name}').join(who).split('{n}').join(String(rows.length))}
      </div>
      {rows.map((r) => (
        <div key={r.id} className="dr-row">
          {r.photos[0] ? <img className="dr-th" src={sizedUrl(r.photos[0], 120)} alt="" loading="lazy" /> : <span className="dr-th" />}
          <span className="dr-txt">{date(r.postCreatedAt)}{r.body ? ` · ${r.body}` : ''}</span>
          <button type="button" className="pk-pill pk-pill--tap dr-keep" disabled={busy === r.id} onClick={() => decide(r.id, false)}>
            {tx('pack.leave.keep', 'Keep')}
          </button>
          <button type="button" className="dr-go" disabled={busy === r.id} onClick={() => decide(r.id, true)}>
            {tx('pack.leave.delete', 'Delete')}
          </button>
        </div>
      ))}
      <p style={{ fontFamily: FONT_UI, fontSize: PACK_TEXT.label, color: T.inkWarm, margin: `${PACK_SPACE.sm}px 0 0` }}>
        {tx('pack.leave.ownerNote', 'Nothing is deleted until you decide.')}
      </p>
    </div>
  );
}
