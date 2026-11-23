// „Čo smie AINUBIS vidieť“ + zmazanie histórie — tá istá logika ako panel starého widgetu (`ainubisHistory.ts`),
// len v paneli zdola chatu v2. Texty sú existujúce kľúče `ainubis.chat.cfg*`.
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { ACCESS_KEYS, clearHistory, readAccess, writeAccess, type Access, type AccessKey } from '../ainubisHistory';

const HINT_EN: Record<AccessKey, [string, string]> = {
  dogs: ['My dogs', 'Names, breeds and years, so I know who we talk about.'],
  dogId: ['DOG ID details', 'Character, health, feeding and quiz answers.'],
  diary: ['Diary', 'Your diary entries.'],
  memory: ['Earlier conversations', 'A short summary of what we talked about before.'],
};

export function V2Access({ onClose, onCleared }: { onClose: () => void; onCleared: () => void }) {
  const t = useT();
  const tx = (key: string, fb: string) => { const v = t(key); return v === key ? fb : v; };
  const [access, setAccess] = useState<Access | null>(null);
  const [msg, setMsg] = useState<'' | 'saveErr' | 'cleared' | 'clearErr'>('');
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    readAccess().then(setAccess).catch(() => setAccess({ dogs: true, dogId: true, diary: true, memory: true }));
  }, []);

  const toggle = (k: AccessKey) => {
    if (!access) return;
    const prev = access;
    const next = { ...access, [k]: !access[k] };
    setAccess(next);
    setMsg('');
    writeAccess(next).catch(() => { setAccess(prev); setMsg('saveErr'); });
  };
  const doClear = async () => {
    setBusy(true);
    setMsg('');
    try { await clearHistory(); setAsk(false); setMsg('cleared'); onCleared(); } catch { setMsg('clearErr'); } finally { setBusy(false); }
  };

  return (
    <>
      <div className="av2-dim" onClick={onClose} aria-hidden />
      <div className="av2-sheet" role="dialog" aria-label={tx('ainubis.chat.cfgTitle', 'What AINUBIS may see')}>
        <div className="av2-grab" />
        <div className="av2-hxs">{tx('ainubis.chat.cfgTitle', 'What AINUBIS may see')}</div>
        <p className="av2-note" style={{ margin: 0 }}>{tx('ainubis.chat.cfgNote', 'AINUBIS never writes first. You decide what it may see about you and your dogs, change it any time.')}</p>
        {access && ACCESS_KEYS.map((k) => (
          <button key={k} type="button" role="switch" aria-checked={access[k]} className={`ainubis-sw${access[k] ? ' ainubis-sw--on' : ''}`} onClick={() => toggle(k)}>
            <span className="ainubis-sw__txt">
              <b>{tx(`ainubis.chat.cfg.${k}`, HINT_EN[k][0])}</b>
              <small>{tx(`ainubis.chat.cfg.${k}Hint`, HINT_EN[k][1])}</small>
            </span>
            <i aria-hidden />
          </button>
        ))}
        {msg === 'saveErr' && <p className="av2-err">{tx('ainubis.chat.saveErr', 'Could not save. Try again.')}</p>}
        {msg === 'cleared' && <p className="av2-thanks">{tx('ainubis.chat.cleared', 'History deleted.')}</p>}
        {msg === 'clearErr' && <p className="av2-err">{tx('ainubis.chat.clearErr', 'Could not delete. Try again.')}</p>}
        {!ask ? (
          <button type="button" className="pk-b3 pk-b3--ai-rd av2-up" onClick={() => setAsk(true)}>{tx('ainubis.chat.clear', 'Delete my history')}</button>
        ) : (
          <div className="av2-consent">
            <p>{tx('ainubis.chat.clearAsk', 'Delete every conversation with AINUBIS, including screenshots? This cannot be undone.')}</p>
            <div className="btns">
              <button type="button" className="pk-b3 pk-b3--ai-rd" disabled={busy} onClick={() => void doClear()}>{tx('ainubis.chat.clearYes', 'Delete')}</button>
              <button type="button" className="pk-b3 pk-b3--ai-nt" disabled={busy} onClick={() => setAsk(false)}>{tx('ainubis.chat.clearNo', 'Cancel')}</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
