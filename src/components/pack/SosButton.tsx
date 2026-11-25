// ── SOS — GLOBÁL v hornom páse, vedľa správ (Matej 30. 10. 2026), ikonka = trojuholník s výkričníkom ─────────────────────────────
// *„postavme to už teraz, resp. chcem to tam mať už zarámované, obsah môžeme dodať aj neskôr"*.
// Lock `architektura-pack.md` §1.2: SOS je GLOBÁL, max 1 ťuk odkiaľkoľvek, nikdy tab.
// Ťuk = POPUP (šuplík zdola, lock pack-dizajn-system §POPUP):
//   · STRATIL SA MI PES — červené tlačidlo, VŽDY prvé a nikdy nezmizne → `/pack/sos/new`
//   · NAHLÁSIŤ NEBEZPEČENSTVO — pri DANGER_ON → `/pack/sos/nebezpecenstvo`, inak „čoskoro“ (týranie)
//   · PRVÁ POMOC → `/pack/sos/prva-pomoc` (pod AID_ON, 17. 11. 2026) · NAJBLIŽŠÍ VETERINÁR → `/pack/sos/pohotovost`
//   · AKTUÁLNE PÁTRANIE — pod nimi zoznam z `sosActive()` (len krajina člena), moje prvé; ťuk → `/pack/sos/<slug>`.
//     Bez pátraní nadpis nie je. Keď beží MOJA strata, trojuholník nesie malú červenú bodku.
// 🔴 Mount len za `TEST_BUILD` (4. 11. 2026, revízia locku architektura-pack §1.2) a nie v koši 3 (`PackTopRow task`).
import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { AID_ON, DANGER_ON, SOS_ON } from '@/lib/env';
import { APP_NEW } from '@/lib/packFlags';
import { IS_APP } from '@/lib/isApp';
import { PackPopup } from './PackPopup';
import { BrandIcon } from './BrandIcon';
import { SysIcon } from './SysIcon';
import { TopCircle, TOP_BTN_PX, TOP_HIT_PX } from './TopCircle';
import { useSosActive, sosAgo } from './sosKit';
import { sizedUrl } from '@/services/cloudinaryService';
import { SOS_BUTTON_P3D_CSS } from './sos/sosP3d';
import { SosAvatarNone } from './sos/sosNoPhoto';
import { prefetchSosOffline } from './sos/sosPrefetch';
import { PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_UI } from './packTheme';

const T = PACK_THEME;
const S = PACK_SPACE;

// Pod APP_NEW má tlačidlo veľkosť ikonky ako lupa (32), dotyk 44 nesie presah v `TopCircle`.
const SOS_BTN_PX = APP_NEW ? TOP_BTN_PX : TOP_HIT_PX;

const CSS = `
.sos-btn{all:unset;cursor:pointer;position:relative;box-sizing:border-box;width:${SOS_BTN_PX}px;height:${SOS_BTN_PX}px;display:grid;place-items:center;border-radius:${PACK_R.pill}px;}
.sos-btn:active{background:${T.alertRedSoft};}
.sos-btn i{position:absolute;top:${S.sm}px;right:${S.sm}px;width:${S.sm}px;height:${S.sm}px;border-radius:${PACK_R.pill}px;background:${T.sosRed};box-shadow:0 0 0 2px ${T.cardEdge};}
.sos-list{display:flex;flex-direction:column;gap:${S.sm}px;}
.sos-row{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px;}
.sos-row b{flex:1;font:600 ${PACK_TEXT.body}px/1.3 ${FONT_UI};color:${T.inkStrong};}
.sos-row small{font:500 ${PACK_TEXT.label}px/1 ${FONT_UI};color:${T.inkWarm};}
/* ČERVENÝ riadok = prvá pomoc (Matej 20. 11.: „stratil sa mi pes daj normálne, červenou daj prvú pomoc“). */
.sos-row.red b{color:#FFFFFF;}
.sos-row.red:active{filter:brightness(.9);}
.sos-row.red small.sos-offl{border:1px solid currentColor;border-radius:${PACK_R.pill}px;padding:${S.xs}px ${S.sm}px;color:#FFFFFF;letter-spacing:.02em;}
.sos-soon-p{margin:-${S.xs}px 0 ${S.xs}px;padding:0 ${S.md}px;font:400 ${PACK_TEXT.body}px/1.45 ${FONT_UI};color:${T.inkStrong};}
.sos-sec{margin:${S.lg}px 0 ${S.sm}px;font:${PACK_HEAD.section.fontWeight} ${PACK_HEAD.section.fontSize}px/1.2 ${FONT_UI};letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${T.sosRed};}
.sos-ph{flex:none;width:44px;height:44px;border-radius:${PACK_R.pill}px;border:2px solid ${T.sosRed};background:${T.tileBg} center/cover no-repeat;}
.sos-ph--none{display:flex;align-items:center;justify-content:center;overflow:hidden;}
.sos-ph--none img{width:68%;height:68%;object-fit:contain;display:block;opacity:.85;}
.sos-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:${S.xs}px;}
.sos-tx b{flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sos-tx span{font:500 ${PACK_TEXT.label}px/1.3 ${FONT_UI};color:${T.inkDim};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sos-mine{flex:none;font:600 ${PACK_TEXT.micro}px/1 ${FONT_UI};letter-spacing:.02em;text-transform:uppercase;color:${T.sosRed};}
${SOS_BUTTON_P3D_CSS}
`;

// Riadky „čoskoro“ (Matej 20. 11.): zbierky na liečbu psa a útulky/adopcie. Po flipe brainstorming (názov aj pre EN trh, kto smie zakladať).
// Texty žijú v slovníku (`pack.sos.soon.*` v en · sk · cs); poistka tu ide v jazyku rozhrania, nie len po anglicky.
type Tri = { en: string; sk: string; cs: string };
const SOON_ROWS: { key: string; icon: string; k: string; fb: Tri; fbP: Tri }[] = [
  { key: 'fund', icon: 'heartpaw', k: 'pack.sos.soon.fund',
    fb: { en: 'Fundraisers for dogs', sk: 'Zbierky pre psov', cs: 'Sbírky pro psy' },
    fbP: {
      en: 'When a dog needs costly treatment, its human starts a fundraiser with the story and the pack chips in with one tap. Campaigns will show up in the FEED.',
      sk: 'Keď pes potrebuje drahú liečbu, jeho človek založí zbierku s príbehom a svorka prispeje jedným ťukom. Zbierky sa ukážu vo FEEDe.',
      cs: 'Když pes potřebuje drahou léčbu, jeho člověk založí sbírku s příběhem a smečka přispěje jedním klepnutím. Sbírky se ukážou ve FEEDu.',
    } },
  { key: 'shelter', icon: 'house-heart', k: 'pack.sos.soon.shelter',
    fb: { en: 'Shelters and adoption', sk: 'Útulky a adopcie', cs: 'Útulky a adopce' },
    fbP: {
      en: 'Shelters and rescues in one place: how they are doing, what they need right now and the dogs waiting for a home.',
      sk: 'Útulky a záchranné stanice na jednom mieste: ako sa im darí, čo práve potrebujú a psy, ktoré čakajú na domov.',
      cs: 'Útulky a záchranné stanice na jednom místě: jak se jim daří, co právě potřebují a psi, kteří čekají na domov.',
    } },
];

const ROWS = [
  { key: 'aid', icon: 'bolt', k: 'pack.sos.firstAid', fb: 'First aid' },
];

export function SosButton() {
  const t = useT();
  const { lang } = useLang();
  const nav = useNavigate();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const tri = (x: Tri) => x[lang === 'sk' || lang === 'cs' ? lang : 'en'];
  const [open, setOpen] = useState(false);
  const [soonOpen, setSoonOpen] = useState<string | null>(null);
  const active = useSosActive();
  const mineRunning = active.some((r) => r.is_mine);
  const go = (to: string) => { setOpen(false); nav(to); };
  // Bez signálu majú fungovať prvá pomoc a pohotovosť: kód a obrázky sa stiahnu vopred, v pokoji (sosPrefetch).
  useEffect(() => { prefetchSosOffline(); }, []);
  return (
    <>
      <style>{CSS}</style>
      {/* Trojuholník s výkričníkom z kitu (`alert.svg`), červený — Matej 30. 10.: "nie SOS, ale ikonku trojuholník s výkričníkom". */}
      <button type="button" className="sos-btn" onClick={() => setOpen(true)} aria-label="SOS">
        {APP_NEW ? <TopCircle name="sos" /> : <BrandIcon name="alert" size={24} tint="danger" />}
        {mineRunning && <i aria-hidden />}
      </button>
      {open && (
        <PackPopup title="SOS" onClose={() => setOpen(false)}>
          <div className="sos-list">
            {/* Prvá pomoc (17. 11. 2026): kde je AID_ON, otvorí rozcestník; inde ostáva „čoskoro“. */}
            {(SOS_ON || AID_ON) && ROWS.map((r) => (
              <button key={r.key} type="button" className={`sos-row red ${r.key}`} style={{ ...PACK_BOX.row, background: T.sosRed, borderColor: T.sosRedDark }} onClick={AID_ON ? () => go('/pack/sos/prva-pomoc') : undefined}>
                {APP_NEW ? <SysIcon name="sos-pomoc" size={32} /> : <BrandIcon name={r.icon} size={24} tint="white" />}
                <b>{tx(r.k, r.fb)}</b>
                {AID_ON ? (IS_APP && <small className="sos-offl">OFFLINE</small>) : <small>{tx('pack.sos.soon', 'Soon')}</small>}
              </button>
            ))}
            <button type="button" className="sos-row vet" style={{ ...PACK_BOX.row }} onClick={() => go('/pack/sos/pohotovost')}>
              {APP_NEW ? <SysIcon name="sos-vet" size={32} /> : <BrandIcon name="vet" size={24} tint="gold" />}
              <b>{tx('pack.sos.er.btn', 'Emergency vet')}</b>
            </button>
            {/* Tretie (Matej 20. 11.: prvá pomoc, pohotovosť, stratil sa mi pes, kartička, týranie). Nikdy nezmizne — riadky pátraní ho nesmú nahradiť. */}
            {SOS_ON && (
              <button type="button" className="sos-row lost" style={{ ...PACK_BOX.row }} onClick={() => go('/pack/sos/new')}>
                {APP_NEW ? <SysIcon name="sos-strateny" size={32} /> : <BrandIcon name="dogposter" size={24} tint="gold" />}
                <b>{tx('pack.sos.btn.lost', 'My dog is lost')}</b>
              </button>
            )}
            {/* Nahlásiť nebezpečenstvo (21. 11. 2026: nad kartičkou, pod stratou): pri DANGER_ON otvorí rozcestie týranie · otrava · príroda,
                inak ostáva ČOSKORO + 2–3 riadky ako pri zbierkach (obrazovka /pack/sos/nebezpecenstvo/tyranie existuje len za flagom). */}
            {DANGER_ON ? (
              <button type="button" className="sos-row danger" style={{ ...PACK_BOX.row }} onClick={() => go('/pack/sos/nebezpecenstvo')}>
                {APP_NEW ? <SysIcon name="sos-tyranie" size={32} /> : <BrandIcon name="stop-rhomb" size={24} tint="gold" />}
                <b>{tx('pack.sos.btn.danger', 'Report a danger')}</b>
              </button>
            ) : (
              <>
                <button type="button" className="sos-row soon abuse" style={{ ...PACK_BOX.row }} aria-expanded={soonOpen === 'abuse'} onClick={() => setSoonOpen((o) => (o === 'abuse' ? null : 'abuse'))}>
                  {APP_NEW ? <SysIcon name="sos-tyranie" size={32} /> : <BrandIcon name="stop-rhomb" size={24} tint="gold" />}
                  <b>{tx('pack.sos.btn.abuse', 'Report abuse')}</b>
                  <small>{tx('pack.sos.soon', 'Soon')}</small>
                </button>
                {soonOpen === 'abuse' && <p className="sos-soon-p">{tx('pack.sos.soon.abuse.p', tri({ en: 'Reporting cruelty made simple: the exact steps and the numbers to call with one tap. Do not look away.', sk: 'Nahlásenie týrania jednoducho: presné kroky a čísla na zavolanie jedným ťukom. Nepozeraj sa inam.', cs: 'Nahlášení týrání jednoduše: přesné kroky a čísla k zavolání jedním klepnutím. Neodvracej pohled.' }))}</p>}
              </>
            )}
            {/* Rýchly prístup ku kartičke, nastavenie ostáva v DOG ID (Matej 5. 11.). Posledná FUNKČNÁ karta, pod ňou len „čoskoro“ (Matej 21. 11.). */}
            {APP_NEW && (
              <button type="button" className="sos-row card" style={{ ...PACK_BOX.row }} onClick={() => go('/pack/sos/karticka')}>
                <SysIcon name="sos-karta" size={32} />
                <b>{tx('pack.sos.card.title', 'Emergency card')}</b>
              </button>
            )}
            {/* Čoskoro (Matej 20. 11.): útulky a adopcie, POD nimi zbierky = úplne posledné (poradie Matej 21. 11.). Názvy pracovné, celé až po flipe po brainstormingu. Ťuk = 2–3 riadky o tom, čo príde. */}
            {/* V appke preč (Matej 25. 11. 2026, pred App Review): kontrolór pozerá aj dovnútra, nedokončené funkcie = riziko 2.1/2.2. Web bez zmeny. */}
            {!IS_APP && [...SOON_ROWS].reverse().map((r) => (
              <Fragment key={r.key}>
                <button type="button" className={`sos-row soon ${r.key}`} style={{ ...PACK_BOX.row }} aria-expanded={soonOpen === r.key} onClick={() => setSoonOpen((o) => (o === r.key ? null : r.key))}>
                  <BrandIcon name={r.icon} size={APP_NEW ? 32 : 24} tint="gold" />
                  <b>{tx(r.k, tri(r.fb))}</b>
                  <small>{tx('pack.sos.soon', 'Soon')}</small>
                </button>
                {soonOpen === r.key && <p className="sos-soon-p">{tx(`${r.k}.p`, tri(r.fbP))}</p>}
              </Fragment>
            ))}
          </div>
          {SOS_ON && active.length > 0 && (
            <>
              <h3 className="sos-sec">{tx('pack.sos.active', 'Search in progress')}</h3>
              <div className="sos-list">
                {active.map((r) => (
                  <button key={r.id} type="button" className="sos-row act" style={{ ...PACK_BOX.row, background: T.sosRedSoft, borderColor: T.sosRed }} onClick={() => go(`/pack/sos/${r.slug}`)}>
                    {r.photo ? <span className="sos-ph" style={{ backgroundImage: `url(${sizedUrl(r.photo, 96)})` }} /> : <SosAvatarNone breed={r.breed} cls="sos-ph" />}
                    <span className="sos-tx">
                      <b>{r.dog_name}</b>
                      <span>{[r.place_label, sosAgo(r.last_seen_at, lang)].filter(Boolean).join(' · ')}</span>
                    </span>
                    {r.is_mine && <span className="sos-mine">{tx('pack.sos.mine', 'Yours')}</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </PackPopup>
      )}
    </>
  );
}
