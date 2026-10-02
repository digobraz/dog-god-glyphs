// KTO TENTO VÝLET NAPÍSAL (#41 / A4, Matej 2026-08-03: „+ Message + účastníci").
//
// Doteraz bol autor na karte výletu len text („by Hekthor & Matej") — klik nikam
// neviedol. Popup ukazuje autora, dá sa mu napísať a pod ním je REÁLNA partia
// (`get_trip_party`), nie vymyslení ľudia.
//
// ⚠️ Autor trasy je v datasete TEXT (`HeroTrail.author`), nie účet — 70 zo 78
// publikovaných výletov napísal zakladateľ a organizátora nemajú vôbec. Preto sa
// zakladateľovi píše cez `organizerId: null`: server (`start_dm`, migrácia
// 20260803_dm_founder.sql) si adresáta nájde sám podľa e-mailu, takže klient
// nenesie žiadne uuid. Keď výlet organizátora MÁ, ide jeho id a platí bežné
// pravidlo „museli ste sa stretnúť na výlete".
import { useState } from 'react';
import { BackIcon, backCircleCSS, backHoverCSS } from '@/components/pack/BackButton';
import { PACK_THEME, FONT_TITLE, FONT_UI, GOLD_BTN, VEIL_CSS } from '@/components/pack/packTheme';
import { emitOpenThread } from '@/components/pack/messaging/openBridge';
import { PartyMemberCard } from '@/components/pack/triplist/PartyMemberCard';
import type { PartyMember } from '@/components/pack/triplist/useTripParty';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const GOLD = T.cardEdge;
const INK = T.ink;

export const TRIP_CREATOR_CSS = `${VEIL_CSS}
/* ZÁVOJ = recept .pk-veil--modal (VEIL_CSS) — tu len poloha a odsadenie. */
.tcp-back{z-index:1400;align-items:flex-end;padding:0;}
@media(min-width:640px){.tcp-back{align-items:center;}}
.tcp{width:100%;max-width:460px;max-height:86vh;overflow-y:auto;background:${T.pageBg};border:1px solid ${T.onDarkBorder};border-radius:16px 16px 0 0;padding:20px 18px calc(env(safe-area-inset-bottom,0px) + 20px);}
@media(min-width:640px){.tcp{border-radius:16px;padding-bottom:16px;}}
.tcp-head{display:flex;align-items:center;justify-content:flex-start;gap:12px;margin-bottom:14px;}
.tcp-title{font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:${GOLD};}
/* Zavrieť = šípka späť vľavo v bledom kruhu (Matej 27. 9. 2026: „dávajme všade len šípky, nie krížiky"). */
.tcp-x{${backCircleCSS('pale')}}
.tcp-x:hover{${backHoverCSS('pale')}}
.tcp-author{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;border:1px solid ${PACK_THEME.border};background:rgba(201,154,63,0.08);}
.tcp-av{flex-shrink:0;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_TITLE};font-weight:700;font-size:20px;color:${INK};}
.tcp-name{font-family:${FONT_TITLE};font-weight:700;font-size:14px;color:${T.onDark};}
.tcp-role{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${GOLD};margin-bottom:3px;}
.tcp-msg{margin-top:14px;width:100%;height:42px;border-radius:8px;border:1px solid ${GOLD_BTN.edge};background:${GOLD_BTN.grad};color:${INK};font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;}
.tcp-msg:disabled{opacity:.5;cursor:default;}
.tcp-sec{margin-top:18px;}
.tcp-sec h4{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${GOLD};margin:0 0 10px;}
.tcp-note{font-family:${FONT_UI};font-size:12px;font-style:italic;color:${T.onDarkDim};line-height:1.5;margin:0;}
`;

export function TripCreatorPopup({ tripSlug, authorName, organizerId, joiners, onClose }: {
  tripSlug: string;
  authorName: string;
  /** id organizátora otvoreného výletu; `null`/undefined = trasu napísal zakladateľ */
  organizerId?: string | null;
  /** reálni účastníci (get_trip_party) — prázdne pole je legitímny stav */
  joiners?: PartyMember[];
  onClose: () => void;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const openDm = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      // dynamický import — packMessaging ťahá pri module-load celý katalóg trás
      const m = await import('@/components/pack/messaging/packMessaging');
      const convId = await m.startTripDM({ tripSlug, organizerId: organizerId ?? null, packNumber: null });
      if (convId) { onClose(); emitOpenThread(convId); }
      else setFailed(true);   // blok, odhlásenie alebo adresát nie je platiaci člen
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const going = joiners ?? [];
  // „Hekthor & Matej" je pes + človek. Písať sa dá ČLOVEKU, takže tlačidlo berie meno
  // za posledným „&"; pri jednom mene ostáva prvé slovo (napr. „Napíš Petrovi").
  const humanName = authorName.split('&').pop()!.trim().split(' ')[0] || authorName;

  return (
    <div className="pk-veil pk-veil--modal tcp-back" onClick={onClose}>
      <style>{TRIP_CREATOR_CSS}</style>
      <div className="tcp" onClick={(e) => e.stopPropagation()}>
        <div className="tcp-head">
          <button type="button" className="tcp-x" onClick={onClose} aria-label={t('pack.trip.cm.close')}><BackIcon /></button>
          <span className="tcp-title">{t('pack.trip.creator.title')}</span>
        </div>

        <div className="tcp-author">
          <span className="tcp-av">{authorName.charAt(0).toUpperCase()}</span>
          <span>
            <span className="tcp-role" style={{ display: 'block' }}>{t('pack.trip.creator.role')}</span>
            <span className="tcp-name">{authorName}</span>
          </span>
        </div>

        <button type="button" className="tcp-msg" onClick={openDm} disabled={busy}>
          {busy ? t('pack.trip.creator.opening')
            : failed ? t('pack.trip.creator.failed')
            : t('pack.trip.creator.message', { name: humanName })}
        </button>

        <div className="tcp-sec">
          <h4>{t('pack.trip.creator.going')}</h4>
          {going.length === 0 ? (
            // #55 — prázdno sa priznáva, nedopĺňa sa vymyslenými ľuďmi
            <p className="tcp-note">{t('pack.trip.creator.empty')}</p>
          ) : (
            going.map((j, i) => (
              <PartyMemberCard
                key={`${tripSlug}:going:${i}`}
                member={j}
                dm={organizerId ? { tripSlug, organizerId } : undefined}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
