import { useEffect, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { ensureDogVisionFilter } from '@/lib/dogVision';
import { LAPIS, LAPIS_BTN_SHADOW } from '../pack/navGoldSkin';

// ════════════════════════════════════════════════════════════════════════════
// HĽADANIE NA STENE PODĽA MENA + „PRIDAJ SA" PRI HOSŤOVI (3. 10. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 3. 10.: *„cez vyhľadávač dorobíme aj vyhľadanie podľa mena nie len čísla
// a tak sa nájdu všetci a tam bude pridať sa do hnutia"* + „ok" nad hárkom
// `plany/nakres-stena-hladanie-2026-10-03/` (jedno pole na meno aj číslo · pes
// bez čísla má štítok V PSEJ OPTIKE · PRIDAJ SA vidí každý).
//
// Rieši hosťa, ktorý stratil mail: nájde psa, zadá e-mail a `send-guest-mail`
// (kind 'resend') mu pošle odkaz na pokladňu — ale LEN na e-mail, ktorý pri psovi
// už je. Odpoveď je preto vždy tá istá veta, nech e-mail sedí alebo nie.
//
// Hľadá sa v tom, čo stena už stiahla (`get-grid-dogs`) — žiadne ďalšie volanie.
// ════════════════════════════════════════════════════════════════════════════

export type WallSearchDog = {
  key: string;
  name: string;
  /** Poradové číslo člena; hosť ho nemá. */
  n: number | null;
  /** Id hosťa (len bez čísla) — cieľ preletu a odkazu. */
  wallId: string | null;
  photo: string;
  country: string;
};

/** Bez diakritiky a veľkosti písmen — „hektor" nájde HEKTHORA aj „Héra" HERU. */
export const fold = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Je v poli meno, nie číslo? (`#12` aj `12` sú číslo.) */
export const isNameQuery = (q: string) => /[^\d#\s]/.test(q);

export function matchDogs(dogs: WallSearchDog[], q: string, limit = 8): WallSearchDog[] {
  const f = fold(q);
  if (!f) return [];
  const hits = dogs.filter((d) => fold(d.name).includes(f));
  // Začiatok mena pred stredom mena, potom členovia podľa čísla.
  hits.sort((a, b) => {
    const sa = fold(a.name).startsWith(f) ? 0 : 1;
    const sb = fold(b.name).startsWith(f) ? 0 : 1;
    if (sa !== sb) return sa - sb;
    return (a.n ?? 1e9) - (b.n ?? 1e9);
  });
  return hits.slice(0, limit);
}

type Props = {
  hits: WallSearchDog[];
  onGo: (d: WallSearchDog) => void;
  /** Edge base, kam ide žiadosť o odkaz (zapisuje ⇒ nikdy natvrdo LIVE v deve). */
  edgeBase: string;
  anonKey: string;
};

export function WallSearchResults({ hits, onGo, edgeBase, anonKey }: Props) {
  const t = useT();
  const [joinKey, setJoinKey] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => { ensureDogVisionFilter(); }, []);
  // Nový výsledok hľadania zavrie rozbalený formulár — patril inému psovi.
  const keys = hits.map((h) => h.key).join('|');
  useEffect(() => { setJoinKey(null); setState('idle'); setEmail(''); }, [keys]);

  if (!hits.length) return <div className="ws-none">{t('wall.search.none')}</div>;

  const joinDog = hits.find((h) => h.key === joinKey && h.wallId);

  const send = async () => {
    if (!joinDog?.wallId || !email.includes('@') || state !== 'idle') return;
    setState('sending');
    try {
      await fetch(`${edgeBase}/send-guest-mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({ kind: 'resend', dogId: joinDog.wallId, email: email.trim() }),
      });
    } catch { /* odpoveď aj tak nič neprezradí — veta je rovnaká */ }
    setState('sent');
  };

  return (
    <div className="ws-root">
      <style>{WS_CSS}</style>
      {joinDog ? (
        <div className="ws-join">
          <div className="ws-row ws-row--head">
            <img className="ws-ph is-vision" src={joinDog.photo} alt="" draggable={false} />
            <span className="ws-name">{joinDog.name}</span>
          </div>
          {state === 'sent' ? (
            <p className="ws-sent">{t('wall.search.sent')}</p>
          ) : (
            <>
              <p className="ws-hint">{t('wall.search.joinHint')}</p>
              <input
                className="ws-mail"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                value={email}
                placeholder={t('wall.search.emailPh')}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); send(); } }}
              />
              <button type="button" className="ws-cta" disabled={!email.includes('@') || state !== 'idle'} onClick={send}>
                {t('wall.search.send')}
              </button>
            </>
          )}
          <button type="button" className="ws-back" onClick={() => setJoinKey(null)}>{t('wall.search.back')}</button>
        </div>
      ) : (
        <div className="ws-list">
          {hits.map((d) => (
            <div className="ws-row" key={d.key}>
              <button type="button" className="ws-go" onClick={() => onGo(d)}>
                {d.photo
                  ? <img className={`ws-ph${d.n ? '' : ' is-vision'}`} src={d.photo} alt="" draggable={false} />
                  : <span className="ws-ph" />}
                <span className="ws-tx">
                  <span className="ws-name">{d.name}</span>
                  <span className="ws-sub">{d.n ? d.country : t('wall.search.vision')}</span>
                </span>
              </button>
              {d.n
                ? <span className="ws-num">#{d.n}</span>
                : d.wallId && (
                  <button type="button" className="ws-joinbtn" onClick={() => setJoinKey(d.key)}>
                    {t('wall.search.join')}
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Papyrus kalkulačky je jej vlastný (svetlý) — LAPIS = akcia a číslo člena
// (odznak čísla je lapis od 27. 9. 2026, HeroCard), zlato = rám riadku.
const WS_CSS = `
.ws-root { display: flex; flex-direction: column; min-width: 0; }
.ws-list { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 300px; }
.ws-row {
  display: flex; align-items: center; gap: 8px; padding: 4px 8px 4px 4px;
  border-radius: 12px; background: rgba(255,255,255,0.34);
  border: 1px solid rgba(201,154,63,0.28);
}
.ws-row--head { background: transparent; border: none; padding: 0; }
.ws-go {
  flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: 8px;
  background: none; border: 0; padding: 0; cursor: pointer; text-align: left; color: inherit;
}
.ws-ph {
  flex: none; width: 40px; height: 40px; border-radius: 999px; object-fit: cover;
  background: rgba(201,154,63,0.2); box-shadow: 0 0 0 1.5px rgba(201,154,63,0.9);
}
.ws-ph.is-vision { filter: url(#dogypt-dog-vision); }
.ws-tx { display: flex; flex-direction: column; min-width: 0; }
.ws-name {
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; letter-spacing: 0.06em;
  color: rgba(0,0,0,0.82); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ws-sub {
  font-family: 'Space Grotesk', sans-serif; font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(0,0,0,0.5); white-space: nowrap;
}
.ws-num {
  flex: none; padding: 2px 8px; border-radius: 999px; background: ${LAPIS.grad};
  color: ${LAPIS.ink}; font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
}
.ws-joinbtn {
  flex: none; height: 28px; padding: 0 8px; border-radius: 8px; cursor: pointer;
  border: 1.5px solid ${LAPIS.edge}; background: transparent; color: ${LAPIS.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px; letter-spacing: 0.06em;
  text-transform: uppercase; white-space: nowrap;
}
.ws-joinbtn:hover { background: ${LAPIS.fill}; }
.ws-join { display: flex; flex-direction: column; gap: 8px; }
.ws-hint, .ws-sent {
  margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.4;
  color: rgba(0,0,0,0.62);
}
.ws-sent {
  padding: 8px 12px; border-radius: 12px; color: #2E5C3B;
  background: rgba(61,122,78,0.12); border: 1px solid rgba(61,122,78,0.4);
}
.ws-mail {
  height: 44px; border-radius: 12px; padding: 0 12px; width: 100%;
  border: 1.5px solid ${LAPIS.edge}; background: #fff; color: rgba(0,0,0,0.82);
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; outline: none;
}
.ws-cta {
  height: 44px; border-radius: 8px; border: 0; cursor: pointer; width: 100%;
  background: ${LAPIS.grad}; color: ${LAPIS.ink}; box-shadow: ${LAPIS_BTN_SHADOW};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; letter-spacing: 0.1em;
  text-transform: uppercase;
}
.ws-cta:disabled { opacity: 0.45; cursor: default; }
.ws-back {
  align-self: center; background: none; border: 0; cursor: pointer; padding: 4px;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: rgba(0,0,0,0.55);
  text-decoration: underline;
}
.ws-none {
  padding: 12px 8px; font-family: 'Space Grotesk', sans-serif; font-size: 12px;
  color: rgba(0,0,0,0.55); text-align: center;
}
`;
