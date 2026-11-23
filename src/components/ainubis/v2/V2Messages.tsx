// Správy chatu v2: bublina človeka (aj s nahrávkou a snímkou), odpoveď AINUBISA (streamovaný text, karty Prvá pomoc,
// karty Zo psieho rozumu, Vypočuť, Pomohla / Nepomohla, Nahlásiť, štítok ceny) a dôrazné upozornenie.
import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { linkify } from '../ainubisLinkify';
import { SysIcon } from '@/components/pack/SysIcon';
import { aiWorld } from '@/components/pack/ainubisSkin';
import { svetImg, AI_LOGO } from '@/components/pack/ainubis/3d/zaklad';
import { aidContent, AID_ICON, AID_ICON_DEFAULT } from '@/components/pack/sos/aid/aidData';
import type { V2Msg, V2Tier } from './v2Api';
import { creditsWord, fmtSec, noVoiceLang, type V2Copy } from './v2Meta';

export const CHAT_BACK = '/pack/ainubis?plane=chat';
/** Ikonky kariet Prvej pomoci: továreň má pre otravu vlastnú, ostatné berie rozcestník prvej pomoci. */
const SOS_ICON: Record<string, string> = { ...AID_ICON, jed: 'sos-otrava', pohotovost: 'sos-vet' };

export interface PlayState { key: string; loading: boolean; cur: number; dur: number }

export interface MsgActions {
  lang: string;
  c: V2Copy;
  play: PlayState | null;
  onListen: (m: V2Msg) => void;
  onPlayVoice: (m: V2Msg) => void;
  onStop: () => void;
  onRate: (m: V2Msg, rating: 'up' | 'down') => void;
  onReport: (m: V2Msg, text: string) => Promise<boolean>;
  onRetry: () => void;
  /** Veriaci: dôrazné upozornenie nesie navyše vetu o najlacnejšom modeli a odkaz na hodnosti. */
  free: boolean;
  onRanks: () => void;
  canRetry: boolean;
}

/** Bublina textu: odstavce, odkazy dogypt.com/pack idú cez router. */
function Paras({ text, streaming }: { text: string; streaming?: boolean }) {
  const navigate = useNavigate();
  const parts = text.split(/\n{2,}/);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i}>
          {linkify(p, (path) => navigate(path), 'ainubis-msg__link')}
          {streaming && i === parts.length - 1 && <span className="av2-caret" aria-hidden />}
        </p>
      ))}
    </>
  );
}

function VoiceBubble({ m, a }: { m: V2Msg; a: MsgActions }) {
  const key = `voice:${m.id}`;
  const on = a.play?.key === key;
  const sec = m.voice?.sec ?? 0;
  const pct = on && a.play && a.play.dur ? Math.min(100, (a.play.cur / a.play.dur) * 100) : 0;
  return (
    <span className="av2-vmsg">
      <button type="button" className="pk-b3 pk-b3--ai-nt" aria-label={a.c('voiceMsg')} onClick={() => (on ? a.onStop() : a.onPlayVoice(m))}>
        <SysIcon name={on ? 'pauza' : 'prehraj'} size={20} />
      </button>
      <span className="av2-vw" aria-hidden>
        {Array.from({ length: 22 }, (_, k) => <i key={k} style={{ height: `${20 + ((k * 53) % 70)}%`, opacity: pct && (k / 22) * 100 <= pct ? 1 : 0.55 }} />)}
      </span>
      <small>{fmtSec(on && a.play?.dur ? a.play.cur : sec)}</small>
    </span>
  );
}

export function UserBubble({ m, a }: { m: V2Msg; a: MsgActions }) {
  return (
    <div className="av2-msg av2-me">
      {m.image && <img className="pic" src={m.image} alt="" />}
      {m.voice && <VoiceBubble m={m} a={a} />}
      {m.content && <Paras text={m.content} />}
    </div>
  );
}

function SourceCards({ m, a }: { m: V2Msg; a: MsgActions }) {
  const navigate = useNavigate();
  const sos = m.sos ?? [];
  const scrolls = m.scrolls ?? [];
  const aid = aidContent(a.lang).cards;
  return (
    <>
      {sos.length > 0 && (
        <>
          <div className="av2-lab">{a.c('firstAid')}</div>
          <div className="av2-srcs">
            {sos.map((id) => {
              const er = id === 'pohotovost';
              const title = er ? a.c('erVet') : aid.find((x) => x.id === id)?.tile ?? id;
              return (
                <button
                  key={id}
                  type="button"
                  className="av2-src sos"
                  onClick={() => navigate(er ? '/pack/sos/pohotovost' : `/pack/sos/prva-pomoc/${id}`)}
                >
                  <img src={`/icons/sys/${SOS_ICON[id] ?? AID_ICON_DEFAULT}.webp`} alt="" />
                  <span><b>{title}</b><small>{er ? a.c('erVetSub') : `${a.c('firstAid')} · ${a.c('firstAidSub')}`}</small></span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {scrolls.length > 0 && (
        <>
          <div className="av2-lab">{a.c('fromScrolls')}</div>
          <div className="av2-srcs">
            {scrolls.map((s) => (
              <button
                key={s.id}
                type="button"
                className="av2-src scroll"
                style={aiWorld(s.world)}
                aria-label={`${a.c('scrollOpen')}: ${s.title}`}
                onClick={() => navigate(`/pack/ainubis/zvitok/${s.id}`, { state: { back: CHAT_BACK } })}
              >
                <img src={svetImg(s.world)} alt="" />
                <span><b>{s.title}</b>{s.line && <small>{s.line}</small>}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Actions({ m, a }: { m: V2Msg; a: MsgActions }) {
  const [reporting, setReporting] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const key = `tts:${m.id}`;
  const on = a.play?.key === key;
  const rateable = !m.local && !!m.id && /^[0-9a-f-]{36}$/i.test(m.id);
  const cr = m.credits && m.credits > 0 ? Math.max(1, Math.ceil(m.credits)) : 0; // server vracia desatinné číslo
  const who = m.tier && cr > 0 ? `${a.c(m.tier as V2Tier)} · ${cr} ${creditsWord(cr, a.lang, a.c)}` : '';

  if (on && a.play && !a.play.loading) {
    const pct = a.play.dur ? Math.min(100, (a.play.cur / a.play.dur) * 100) : 0;
    return (
      <div className="av2-play">
        <button type="button" className="pk-b3 pk-b3--ai-or" aria-label={a.c('listenStop')} onClick={a.onStop}><SysIcon name="pauza" size={22} /></button>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        <small>{fmtSec(a.play.cur)} / {fmtSec(a.play.dur)}</small>
      </div>
    );
  }
  return (
    <>
      <div className="av2-acts">
        {who && <span className="av2-who">{who}</span>}
        {rateable && !noVoiceLang(a.lang) && (
          <button type="button" className="pk-b3 pk-b3--ai-nt" disabled={on} onClick={() => a.onListen(m)}>
            <SysIcon name="prehraj" size={22} />{on ? a.c('listenLoading') : a.c('listen')}
          </button>
        )}
        {rateable && (
          <>
            <button type="button" className={`pk-b3 pk-b3--ai-nt${m.rating === 'up' ? ' on' : ''}`} aria-pressed={m.rating === 'up'} onClick={() => a.onRate(m, 'up')}>
              <SysIcon name="lajk" size={22} />{a.c('helped')}
            </button>
            <button type="button" className={`pk-b3 pk-b3--ai-nt${m.rating === 'down' ? ' on' : ''}`} aria-pressed={m.rating === 'down'} onClick={() => a.onRate(m, 'down')}>
              <SysIcon name="lajk" size={22} style={{ transform: 'scaleY(-1)' }} />{a.c('notHelped')}
            </button>
            {!m.reported && (
              <button type="button" className="pk-b3 pk-b3--ai-nt" aria-expanded={reporting} onClick={() => setReporting((v) => !v)}>
                <SysIcon name="pozor" size={22} />{a.c('report')}
              </button>
            )}
          </>
        )}
      </div>
      {m.reported && <div className="av2-thanks">{a.c('reportThanks')}</div>}
      {reporting && !m.reported && (
        <div className="av2-report">
          <textarea value={text} maxLength={1000} placeholder={a.c('reportPh')} onChange={(e) => setText(e.target.value)} />
          <button
            type="button"
            className="pk-b3 pk-b3--ai-or"
            disabled={busy || !text.trim()}
            onClick={async () => { setBusy(true); const ok = await a.onReport(m, text.trim()); setBusy(false); if (ok) setReporting(false); }}
          >
            {a.c('reportSend')}
          </button>
        </div>
      )}
    </>
  );
}

/** Dôrazné upozornenie pre VŠETKY hodnosti; Veriaci navyše „najlacnejší model" + cesta k hodnostiam. */
export function Disclaimer({ a }: { a: MsgActions }) {
  return (
    <div className="av2-disc" role="note">
      <b>{a.c('disclaimer')}</b>
      {a.free && (
        <>
          {' '}{a.c('disclaimerFree')}{' '}
          <button type="button" onClick={a.onRanks}>{a.c('disclaimerCta')}</button>
        </>
      )}
    </div>
  );
}

export function AssistantBlock({ m, a, last }: { m: V2Msg; a: MsgActions; last: boolean }) {
  if (m.role === 'system') {
    return (
      <div className="av2-row">
        <img src={AI_LOGO} alt="" />
        <div className="av2-ai">
          <div className="av2-msg av2-sysmsg"><Paras text={m.content} /></div>
          {a.canRetry && last && <button type="button" className="pk-b3 pk-b3--ai-nt av2-retry" onClick={a.onRetry}>{a.c('retry')}</button>}
        </div>
      </div>
    );
  }
  const waiting = m.streaming && !m.content;
  return (
    <div className="av2-row">
      <img src={AI_LOGO} alt="" />
      <div className="av2-ai">
        {waiting ? (
          <div className="av2-typing" aria-live="polite">{(m.status === 'scrolls' ? a.c('sniffing') : a.c('thinking')).replace(/…$/, '')}</div>
        ) : (
          <div className="av2-msg av2-bbai"><Paras text={m.content} streaming={m.streaming} /></div>
        )}
        {m.streaming && m.content && m.status === 'scrolls' && <div className="av2-typing">{a.c('sniffing').replace(/…$/, '')}</div>}
        {!m.streaming && (
          <Fragment>
            <SourceCards m={m} a={a} />
            <Actions m={m} a={a} />
          </Fragment>
        )}
      </div>
    </div>
  );
}
