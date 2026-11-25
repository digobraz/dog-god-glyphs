// KARTA DŇA — obrazovka po zápise dňa (25. 11. 2026). Zadanie `plany/zadanie-karta-dna-2026-11-25.md`.
// Matej: *„po zápise ide obrazovka so sumárom a ten sumár bude na zdieľanie, možnosť vymeniť foto, nejaká správa
// a vymenovanie výberov“* · karta po KAŽDOM zápise · Story 9:16 · vrch D · veta voliteľná z piatich
// (*„vetu by som dal voliteľnú a tak zistíme akú ľudia používajú“* → PostHog `share_clicked.veta`).
//
// Vrstva v TOM ISTOM šuplíku ako pečať (ZapisDna.tsx): hore náhľad karty a voľby, dole ZDIEĽAŤ (lapis) + Hotovo.
// Panel sa musí vojsť bez scrollu aj na iPhone SE — pri nedostatku miesta ustúpi NÁHĽAD (výška = zvyšok), nie voľby.
//
// ⚠️ Obrázok sa vyrába VOPRED po každej zmene (iOS pustí `navigator.share` len priamo v ťuknutí, vzor TripShareSheet).
// ⚠️ Hodnotenie dňa = `dog_events` pole `diary.rating` (1–5, jeden riadok na psa, deň = `recorded_at`). Tabuľka má voľné
//    `field`, migrácia netreba. Zapíše sa pri odchode z karty (Zdieľať aj Hotovo), nie pri každom ťuku.
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePackUser } from '@/hooks/usePackUser';
import { useMemberProfile, memberDisplayName } from './memberProfile';
import { servantImg, useServantSpan } from './rankBadge';
import { appendDogEvents } from '@/lib/dogEvents';
import { dayToRecordedAt } from '@/components/pack/diary/diaryModel';
import { sizedUrl } from '@/services/cloudinaryService';
import { IS_APP } from '@/lib/isApp';
import { shareFile } from '@/lib/shareFile';
import { canvasToBlob } from '@/lib/canvasBlob';
import { pluralKey } from '@/lib/plural';
import { track } from '@/lib/analytics';
import { toast } from '@/hooks/use-toast';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { PACK_THEME, PACK_R, PACK_SHADOW, PACK_SPACE, PACK_TEXT, FONT_UI, PF_FIELD_CSS } from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { sysSrc } from '@/components/pack/SysIcon';
import hlava from '@/assets/dogypt-hlava-2026.webp';
import { drawKarta, loadImg, loadKartaFonts, KD_W, type KartaData } from './kartaDnaKresba';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

/** Päť viet dole (Matej 25. 11.). Text v slovníku nesie zlaté slovo v zložených zátvorkách: „Veríme v {psa}.“
 *  (hviezdička nie — SK claim z webu je „Každé h*vno sa POČÍTA.“). Claim = `pages/appWeb/claim.ts` h1a·h1b·h1c. */
export const KARTA_VETY = ['jedna', 'offline', 'hovno', 'verime', 'god'] as const;
type Veta = typeof KARTA_VETY[number];
const VETA_EN: Record<Veta, string> = {
  jedna: 'Life with your dog in {one app}',
  offline: 'Offline adventures, online {badges}',
  hovno: 'Every poop {COUNTS.}',
  verime: 'In {Dog} We Trust.',
  god: 'The place where {Dog} is God.',
};
const splitGold = (s: string) => {
  const m = s.match(/^(.*?)\{(.+?)\}(.*)$/s);
  return m ? { pre: m[1], gold: m[2], post: m[3] } : { pre: s, gold: '', post: '' };
};

export interface KartaDnaDog { id: string; name: string | null; photo: string | null }
export interface KartaDnaAct { id: string; name: string; n: number }

const CSS = `
.kd[hidden]{display:none;}
.kd{position:absolute;inset:0;z-index:7;display:flex;flex-direction:column;gap:${S.sm}px;padding:0 ${S.lg}px;background:${T.cardGrad};color:${T.inkStrong};font-family:${FONT_UI};}
.kd-top{flex:1;min-height:0;display:flex;gap:${S.md}px;}
.kd-prev{flex:none;height:100%;aspect-ratio:9/16;max-width:48%;border-radius:${PACK_R.tile}px;box-shadow:${PACK_SHADOW.panel};background:${T.tileBg};}
.kd-side{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:${S.md}px;}
.kd-t{margin:0;font-family:'LT Museum',serif;font-weight:400;font-size:${TX.h1}px;line-height:1;color:${T.inkStrong};} /* písmo: nadpis */
.kd-lbl{display:block;margin:0 0 ${S.xs}px;font-weight:500;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.kd-ph{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.kd-ph button,.kd-ph label{appearance:none;position:relative;display:grid;place-items:center;width:40px;height:40px;padding:0;border-radius:${PACK_R.field}px;overflow:hidden;cursor:pointer;
  border:2px solid ${T.border};background:${T.tileBg};font:500 ${TX.micro}px/1.1 ${FONT_UI};color:${T.inkWarm};text-align:center;}
.kd-ph img{width:100%;height:100%;object-fit:cover;display:block;}
.kd-ph .on{border-color:${LAPIS.edge};}
.kd-ph input{position:absolute;inset:0;opacity:0;cursor:pointer;}
.kd-paws{display:flex;gap:${S.xs}px;}
.kd-paws button{appearance:none;width:28px;height:28px;padding:0;border:0;background:none;cursor:pointer;}
.kd-paws img{width:28px;height:28px;display:block;}
.kd-dogs{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.kd-dogs button{appearance:none;width:36px;height:36px;padding:0;border-radius:${PACK_R.pill}px;overflow:hidden;cursor:pointer;border:2px solid ${T.border};background:${T.tileBg};opacity:.45;}
.kd-dogs button.on{opacity:1;border-color:${LAPIS.edge};}
.kd-dogs img{width:100%;height:100%;object-fit:cover;display:block;}
.kd-dogs i{font-style:normal;font-weight:600;font-size:${TX.body}px;}
.kd-msg{width:100%;height:56px;resize:none;padding:${S.sm}px ${S.md}px;font-size:${TX.body}px;line-height:1.35;}
.kd-row{display:flex;gap:${S.sm}px;overflow-x:auto;margin:0 -${S.lg}px;padding:2px ${S.lg}px;scrollbar-width:none;}
.kd-row::-webkit-scrollbar{display:none;}
.kd-chip{appearance:none;flex:none;display:inline-flex;align-items:center;gap:${S.xs}px;height:36px;padding:0 ${S.md}px 0 ${S.sm}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1px solid ${T.border};background:${T.tileBg};font:500 ${TX.label}px/1 ${FONT_UI};color:${T.inkStrong};white-space:nowrap;opacity:.55;}
.kd-chip img{width:24px;height:24px;}
.kd-chip.on{opacity:1;${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.kd-chip.v{padding:0 ${S.md}px;}
.kd-chip b{font-weight:600;color:var(--p3d-gold-ink,${T.inkWarm});}
.kd-foot{flex:none;display:flex;gap:${S.sm}px;padding:${S.xs}px 0 calc(env(safe-area-inset-bottom,0px) + ${S.md}px);}
.kd-foot .zd-save{flex:1;}
.kd-done{appearance:none;flex:none;padding:0 ${S.lg}px;border:0;background:none;cursor:pointer;font:500 ${TX.body}px/1 ${FONT_UI};color:${T.inkWarm};}
@media (max-height:700px){
  .kd{gap:${S.xs}px;}
  .kd-t{font-size:${TX.h2}px;}
  .kd-side{gap:${S.sm}px;}
  .kd-msg{height:48px;}
}
`;

/** `hidden` = skladá sa počas pečate (načíta meno, Služobníka, obrázky), ukáže sa až po nej. */
export function KartaDna({ day, dogs, photos, text, acts, onDone, doneRef, hidden = false }: {
  day: string; dogs: KartaDnaDog[]; photos: string[]; text: string; acts: KartaDnaAct[]; onDone: () => void; hidden?: boolean;
  doneRef?: { current: (() => void) | null };
}) {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };

  // ── kto som (to isté meno a fotka, ako ma vidia ostatní; dni = Služobník, nič sa nepočíta nanovo)
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => { void supabase.auth.getSession().then(({ data }) => setUid(data.session?.user?.id ?? null)); }, []);
  const { dogs: all, avatarUrl } = usePackUser(uid);
  const own = all.filter((d) => !d.user_id || d.user_id === uid);
  const { years, days } = useServantSpan(own, true);
  const myNumber = own.map((d) => d.pack_number).filter((n): n is number => n != null).sort((a, b) => a - b)[0] ?? null;
  const member = useMemberProfile(myNumber);
  const humanName = memberDisplayName(member, own.map((d) => d.owner_name?.trim()).find(Boolean) ?? '');
  const humanPhoto = member?.avatarUrl ?? avatarUrl ?? null;
  const numberOf = (id: string) => all.find((d) => d.id === id)?.pack_number ?? null;

  // ── voľby karty
  const [photoIx, setPhotoIx] = useState(photos.length ? 0 : -1);   // -1 = bez fotky
  const [own_, setOwn] = useState<string | null>(null);               // vlastná z galérie (len na canvas, nikam sa nenahrá)
  const [rating, setRating] = useState(0);
  const [msg, setMsg] = useState(text.trim());
  const [off, setOff] = useState<Set<string>>(new Set());
  const [dogOff, setDogOff] = useState<Set<string>>(new Set());
  const [veta, setVeta] = useState<Veta>('jedna');
  useEffect(() => () => { if (own_) URL.revokeObjectURL(own_); }, [own_]);

  const shownDogs = dogs.filter((g) => !dogOff.has(g.id));
  const shownActs = acts.filter((a) => !off.has(a.id));
  const photoSrc = photoIx === -2 ? own_ : photoIx >= 0 ? photos[photoIx] : null;
  const vetaText = (v: Veta) => tx(`pack.zd.card.v.${v}`, VETA_EN[v]);

  const dateText = useMemo(() => {
    const [y, m, d] = day.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    try {
      const loc = intlLocale(lang);
      const wd = new Intl.DateTimeFormat(loc, { weekday: 'long' }).format(dt);
      return `${wd.charAt(0).toUpperCase()}${wd.slice(1)} · ${new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'numeric', year: 'numeric' }).format(dt)}`;
    } catch { return day; }
  }, [day, lang]);
  const daysText = days == null ? null : tx(`pack.zd.card.${shownDogs.length > 1 ? 'daysDogs' : 'daysDog'}${pluralKey(days)}`, shownDogs.length > 1 ? '{n} days with dogs' : '{n} days with a dog')
    .replace('{n}', days.toLocaleString(intlLocale(lang)));

  // ── kreslenie: náhľad + hotový obrázok vopred
  const cvRef = useRef<HTMLCanvasElement>(null);
  const blobRef = useRef<Blob | null>(null);
  const [fontsOk, setFontsOk] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { void loadKartaFonts().finally(() => setFontsOk(true)); }, []);
  const key = JSON.stringify([photoSrc, shownDogs.map((g) => g.id), humanName, humanPhoto, years, daysText, dateText, rating, msg, shownActs.map((a) => a.id), veta, lang]);
  useEffect(() => {
    if (!fontsOk) return;
    let live = true;
    setReady(false);
    const big = (u: string | null) => (u && /^https?:/.test(u) ? sizedUrl(u, 1200) : u);
    void (async () => {
      const [photo, human, badge, on, offImg, head, dogImgs, actImgs] = await Promise.all([
        loadImg(big(photoSrc)), loadImg(humanPhoto ? sizedUrl(humanPhoto, 400) : null), loadImg(servantImg(years)),
        loadImg(sysSrc('hodnotenie-packa')), loadImg(sysSrc('hodnotenie-packa-prazdna')), loadImg(hlava),
        Promise.all(shownDogs.map((g) => loadImg(g.photo ? sizedUrl(g.photo, 600) : null))),
        Promise.all(shownActs.map((a) => loadImg(sysSrc(`den-${a.id}`)))),
      ]);
      if (!live) return;
      const data: KartaData = {
        photo,
        dogs: shownDogs.map((g, i) => ({ name: g.name ?? '', number: numberOf(g.id), img: dogImgs[i] })),
        human: { name: humanName, img: human, initial: (humanName || '?').slice(0, 1).toUpperCase(), badge, days: daysText },
        date: dateText, rating, paw: { on, off: offImg }, msg,
        acts: shownActs.map((a, i) => ({ img: actImgs[i], name: a.name, n: a.n })),
        more: tx('pack.zd.card.more', 'more'),
        veta: splitGold(vetaText(veta)), head,
      };
      const cv = cvRef.current;
      if (cv) drawKarta(cv, data, 540);
      let b: Blob | null = null;
      try { const c = document.createElement('canvas'); drawKarta(c, data, KD_W); b = await canvasToBlob(c); } catch { /* bez obrázka ostane Hotovo */ }
      if (live) { blobRef.current = b; setReady(!!b); }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsOk, key]);

  // ── odchod z karty: hodnotenie dňa do DB + meranie
  const savedRating = useRef(0);
  const shared = useRef(false);
  const props = () => ({ veta, psov: shownDogs.length, aktivit: shownActs.length, foto: !!photoSrc, hodnotenie: rating });
  const saveRating = () => {
    if (!rating || rating === savedRating.current) return;
    savedRating.current = rating;
    void appendDogEvents(shownDogs.map((g) => ({ dogId: g.id, field: 'diary.rating', value: rating, source: 'profile', recordedAt: dayToRecordedAt(day) })))
      .catch(() => { savedRating.current = 0; });
  };
  const fileName = (b: Blob) => `dogypt-${day}.${b.type === 'image/jpeg' ? 'jpg' : 'png'}`;
  const download = (b: Blob) => {
    const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = fileName(b);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  };
  // ⚠️ Žiadny `await` pred zdieľaním — gesto by vypršalo (iOS).
  const share = () => {
    const b = blobRef.current;
    if (!b) return;
    saveRating();
    shared.current = true;
    const done = (channel: string) => track('share_clicked', { channel, type: 'karta_dna', location: 'zapis', ...props() });
    if (IS_APP) {
      void shareFile(b, fileName(b)).then((ok) => { if (ok) done('native'); else { download(b); done('download'); } }).catch(() => undefined);
      return;
    }
    const file = new File([b], fileName(b), { type: b.type });
    const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
    if (window.matchMedia?.('(pointer: coarse)').matches && typeof navigator.share === 'function' && nav.canShare?.({ files: [file] })) {
      navigator.share({ files: [file] }).then(() => done('native')).catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        download(b); done('download');
      });
      return;
    }
    download(b); done('download');
    toast({ description: tx('pack.zd.card.saved', 'The image is saved.') });
  };
  const finish = () => {
    saveRating();
    track('karta_dna_done', { zdielane: shared.current, ...props() });
    onDone();
  };
  // Späť / Escape / stiahnutie šuplíka = Hotovo (šuplík zápisu volá cez `doneRef`).
  if (doneRef) doneRef.current = finish;

  const toggle = (set: Set<string>, id: string) => { const n = new Set(set); if (n.has(id)) n.delete(id); else n.add(id); return n; };

  return (
    <div className="kd" hidden={hidden} role="dialog" aria-label={tx('pack.zd.card.title', 'Your day')} data-testid="karta-dna">
      <style>{PF_FIELD_CSS}{CSS}</style>
      <div className="kd-top">
        <canvas ref={cvRef} className="kd-prev" aria-label={tx('pack.zd.card.title', 'Your day')} />
        <div className="kd-side">
          <h2 className="kd-t">{tx('pack.zd.card.title', 'Your day')}</h2>
          <div>
            <span className="kd-lbl">{tx('pack.zd.card.photo', 'Photo')}</span>
            <div className="kd-ph">
              {photos.map((p, i) => (
                <button key={p} type="button" className={photoIx === i ? 'on' : ''} aria-pressed={photoIx === i} onClick={() => setPhotoIx(i)}><img src={p} alt="" /></button>
              ))}
              {own_ && <button type="button" className={photoIx === -2 ? 'on' : ''} aria-pressed={photoIx === -2} onClick={() => setPhotoIx(-2)}><img src={own_} alt="" /></button>}
              <button type="button" className={photoIx === -1 ? 'on' : ''} aria-pressed={photoIx === -1} onClick={() => setPhotoIx(-1)}>{tx('pack.zd.card.noPhoto', 'None')}</button>
              <label aria-label={tx('pack.zd.card.gallery', 'Gallery')}>
                +
                <input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  setOwn(URL.createObjectURL(f)); setPhotoIx(-2);
                }} />
              </label>
            </div>
          </div>
          <div>
            <span className="kd-lbl">{tx('pack.zd.card.rate', 'How was the day')}</span>
            <div className="kd-paws" role="radiogroup" aria-label={tx('pack.zd.card.rate', 'How was the day')}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} / 5`} onClick={() => setRating(rating === n ? 0 : n)}>
                  <img src={sysSrc(n <= rating ? 'hodnotenie-packa' : 'hodnotenie-packa-prazdna')} alt="" />
                </button>
              ))}
            </div>
          </div>
          {dogs.length > 1 && (
            <div>
              <span className="kd-lbl">{tx('pack.zd.card.dogs', 'Dogs on the card')}</span>
              <div className="kd-dogs">
                {dogs.map((g) => {
                  const on = !dogOff.has(g.id);
                  return (
                    <button key={g.id} type="button" className={on ? 'on' : ''} aria-pressed={on} aria-label={g.name ?? ''}
                      onClick={() => { if (on && shownDogs.length <= 1) return; setDogOff(toggle(dogOff, g.id)); }}>
                      {g.photo ? <img src={sizedUrl(g.photo, 120)} alt="" /> : <i>{(g.name || '?').slice(0, 1)}</i>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <label>
        <span className="kd-lbl">{tx('pack.zd.card.msg', 'Message')}</span>
        <textarea className="pf-field kd-msg" maxLength={160} value={msg} onChange={(e) => setMsg(e.target.value)} />
      </label>
      {acts.length > 0 && (
        <div>
          <span className="kd-lbl">{tx('pack.zd.card.show', 'What to show')}</span>
          <div className="kd-row">
            {acts.map((a) => {
              const on = !off.has(a.id);
              return (
                <button key={a.id} type="button" className={`kd-chip${on ? ' on' : ''}`} aria-pressed={on} onClick={() => setOff(toggle(off, a.id))}>
                  <img src={sysSrc(`den-${a.id}`)} alt="" />{a.name}{a.n > 1 ? ` ×${a.n}` : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div>
        <span className="kd-lbl">{tx('pack.zd.card.line', 'Line at the bottom')}</span>
        <div className="kd-row" role="radiogroup" aria-label={tx('pack.zd.card.line', 'Line at the bottom')}>
          {KARTA_VETY.map((v) => {
            const s = splitGold(vetaText(v));
            return (
              <button key={v} type="button" role="radio" aria-checked={veta === v} className={`kd-chip v${veta === v ? ' on' : ''}`} onClick={() => setVeta(v)}>
                <span>{s.pre}<b>{s.gold}</b>{s.post}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="kd-foot">
        <button type="button" className="kd-done" onClick={finish}>{tx('pack.zd.card.done', 'Done')}</button>
        <button type="button" className="zd-save" disabled={!ready} onClick={share}>{tx('pack.zd.card.share', 'Share')}</button>
      </div>
    </div>
  );
}
