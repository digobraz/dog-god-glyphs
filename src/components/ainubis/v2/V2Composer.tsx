// Riadok na písanie chatu v2 (po vzore nákresu): veľké pole, pod ním + · Pre koho · Kto odpovie · mikrofón · odoslať,
// diktafón (vlna + čas, ✕ zruší, fajka prepíše), príloha (snímka / nahrávka) a pás s hodnosťou a AI kreditmi.
import { useEffect, useRef, useState, type RefObject } from 'react';
import { SysIcon } from '@/components/pack/SysIcon';
import { recorderSupported } from './useRecorder';
import type { V2Dog } from './useV2Dogs';
import { V2_TIERS, type V2Credits, type V2Pick, type V2Tier } from './v2Api';
import { TIER_IDX, creditsWord, fmtSec, micSrc, type V2Copy } from './v2Meta';
import { Seal } from './V2Panels';

export interface V2Draft { image: { previewUrl: string } | null; voice: { sec: number } | null }

export interface ComposerProps {
  c: V2Copy;
  lang: string;
  rankName: (r: V2Credits['rank']) => string;
  credits: V2Credits | null;
  text: string;
  setText: (s: string) => void;
  onSend: () => void;
  busy: boolean;
  draft: V2Draft;
  onClearImage: () => void;
  onClearVoice: () => void;
  dogs: V2Dog[];
  dogId: string | null;
  setDogId: (id: string | null) => void;
  pick: V2Pick;
  setPick: (p: V2Pick) => void;
  onFile: (file: File) => void;
  onMark: () => void;
  recActive: boolean;
  recSec: number;
  transcribing: boolean;
  onRecStart: () => void;
  onRecCancel: () => void;
  onRecDone: () => void;
  error: string | null;
  onStrip: () => void;
  taRef: RefObject<HTMLTextAreaElement>;
}

type Pop = null | 'plus' | 'dog' | 'mdl';

export function V2Composer(p: ComposerProps) {
  const { c } = p;
  const [pop, setPop] = useState<Pop>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const rank = p.credits?.rank ?? 'veriaci';
  const top: V2Tier = p.credits?.top ?? 'rychly';
  const free = rank === 'veriaci';
  const hasAttach = !!p.draft.image || !!p.draft.voice;
  const canSend = (!!p.text.trim() || hasAttach) && !p.busy && !p.transcribing;
  const dog = free ? null : p.dogs.find((d) => d.id === p.dogId) ?? null;

  // Ponuka sa zavrie ťukom mimo riadku.
  useEffect(() => {
    if (!pop) return;
    const h = (e: PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setPop(null); };
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, [pop]);

  // Pole rastie s textom po strop z CSS (`max-height`).
  useEffect(() => {
    const el = p.taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [p.text, p.taRef, p.recActive]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter odosiela len tam, kde je fyzická klávesnica; na dotyku je to nový riadok.
    if (e.key === 'Enter' && !e.shiftKey && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      e.preventDefault();
      if (canSend) p.onSend();
    }
  };
  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) p.onFile(f);
    e.target.value = '';
    setPop(null);
  };
  const paste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const it = Array.from(e.clipboardData.items).find((x) => x.type.startsWith('image/'));
    const f = it?.getAsFile();
    if (f) { e.preventDefault(); p.onFile(f); }
  };

  const modeLabel = p.pick === 'auto' ? c('auto') : c(p.pick);
  const cr = p.credits;
  const pct = cr && cr.allowance ? Math.min(100, (cr.used / cr.allowance) * 100) : 0;

  return (
    <div className="av2-comp" ref={rootRef}>
      {pop === 'plus' && (
        <div className="av2-pop">
          <button type="button" className="it" onClick={() => camRef.current?.click()}><SysIcon name="foto" size={28} />{c('plusPhoto')}</button>
          <button type="button" className="it" onClick={() => galRef.current?.click()}><SysIcon name="galeria" size={28} />{c('plusGallery')}</button>
          <button type="button" className="it" onClick={() => { setPop(null); p.onMark(); }}><SysIcon name="poloha" size={28} />{c('plusMark')}</button>
        </div>
      )}
      {pop === 'dog' && (
        <div className="av2-pop r">
          <div className="lab2">{c('forWho')}</div>
          <button type="button" className={`it${!dog ? ' on' : ''}`} onClick={() => { p.setDogId(null); setPop(null); }}>
            <SysIcon name="dogscroll" size={28} />{c('forGeneral')}
          </button>
          {p.dogs.map((d) => (
            <button key={d.id} type="button" className={`it${dog?.id === d.id ? ' on' : ''}`} disabled={free} onClick={() => { p.setDogId(d.id); setPop(null); }}>
              {d.photo ? <img className="av" src={d.photo} alt="" /> : <SysIcon name="zver" size={28} />}{d.name}
              {free && <SysIcon name="zamok" size={20} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
          {free && p.dogs.length > 0 && <div className="note">{c('forLocked')}</div>}
        </div>
      )}
      {pop === 'mdl' && (
        <div className="av2-pop r2">
          <div className="lab2">{c('who')}</div>
          <button type="button" className={`it${p.pick === 'auto' ? ' on' : ''}`} onClick={() => { p.setPick('auto'); setPop(null); }}>
            <span className="mn"><b>{c('auto')}</b><small>{c('autoNote')}</small></span>
          </button>
          {V2_TIERS.map((t) => {
            const locked = TIER_IDX[t] > TIER_IDX[top];
            const price = Math.max(1, Math.round(cr?.price?.[t] ?? 1));
            return (
              <button key={t} type="button" className={`it${p.pick === t ? ' on' : ''}`} disabled={locked} onClick={() => { p.setPick(t); setPop(null); }}>
                <span className="mn">
                  <b>{c(t)}</b>
                  <small>{locked ? c('higherRank') : c('perMsg', { n: `${price} ${creditsWord(price, p.lang, c)}` })}</small>
                </span>
                {locked && <SysIcon name="zamok" size={20} style={{ marginLeft: 'auto' }} />}
              </button>
            );
          })}
        </div>
      )}

      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={pickFile} />
      <input ref={galRef} type="file" accept="image/*" hidden onChange={pickFile} />

      <div className="av2-cbox">
        {p.recActive ? (
          <div className="av2-rec">
            <span className="dot" />
            <div className="av2-wave" aria-hidden>
              {Array.from({ length: 40 }, (_, i) => <i key={i} style={{ animationDelay: `${((i * 37) % 90) / 100}s` }} />)}
            </div>
            <small>{fmtSec(p.recSec)}</small>
          </div>
        ) : (
          <>
            {hasAttach && (
              <div className="av2-att">
                {p.draft.image && (
                  <>
                    <span className="av2-shot"><img src={p.draft.image.previewUrl} alt="" /></span>
                    <button type="button" className="pk-b3 pk-b3--ai-nt" aria-label={c('shotRemove')} onClick={p.onClearImage}><SysIcon name="krizik" size={20} /></button>
                  </>
                )}
                {p.draft.voice && (
                  <>
                    <span className="av2-mchip so">{c('voiceMsg')} · {fmtSec(p.draft.voice.sec)}</span>
                    <button type="button" className="pk-b3 pk-b3--ai-nt" aria-label={c('shotRemove')} onClick={p.onClearVoice}><SysIcon name="krizik" size={20} /></button>
                  </>
                )}
              </div>
            )}
            <textarea
              ref={p.taRef}
              rows={2}
              value={p.text}
              readOnly={p.busy}
              style={p.busy ? { opacity: 0.6 } : undefined}
              placeholder={p.transcribing ? c('transcribing') : p.draft.image ? c('phShot') : c('ph')}
              onChange={(e) => p.setText(e.target.value)}
              onKeyDown={onKey}
              onPaste={paste}
              onFocus={() => setPop(null)}
              enterKeyHint="send"
            />
          </>
        )}
        <div className="av2-opts">
          <button type="button" className="pk-b3 pk-b3--ai-nt av2-o44" aria-label={c('plusAria')} disabled={p.recActive} onClick={() => setPop(pop === 'plus' ? null : 'plus')}>
            <SysIcon name="plus" size={26} />
          </button>
          <button type="button" className="pk-b3 pk-b3--ai-nt av2-mode" aria-label={c('forWho')} disabled={p.recActive} onClick={() => setPop(pop === 'dog' ? null : 'dog')}>
            {dog?.photo ? <img className="av" src={dog.photo} alt="" /> : <SysIcon name="dogscroll" size={30} />}
            <span>{dog ? <><i className="pre">{c('forPrefix')}</i>{dog.name}</> : c('forGeneral')}</span>
          </button>
          {TIER_IDX[top] > 0 && (
            <button type="button" className="pk-b3 pk-b3--ai-nt av2-mode mdl" aria-label={c('who')} disabled={p.recActive} onClick={() => setPop(pop === 'mdl' ? null : 'mdl')}>
              <span>{modeLabel}</span>
            </button>
          )}
          <span className="sp" />
          {p.recActive ? (
            <>
              <button type="button" className="pk-b3 pk-b3--ai-nt av2-o44" aria-label={c('recCancel')} onClick={p.onRecCancel}><SysIcon name="krizik" size={26} /></button>
              <button type="button" className="pk-b3 pk-b3--ai-cy av2-o44" aria-label={c('recDone')} onClick={p.onRecDone}><SysIcon name="fajka" size={26} /></button>
            </>
          ) : (
            <>
              {recorderSupported() && (
                <button type="button" className="pk-b3 pk-b3--ai-nt av2-o44" aria-label={c('mic')} title={c('mic')} disabled={p.transcribing || p.busy} onClick={p.onRecStart}>
                  <img className="ico" src={micSrc()} alt="" />
                </button>
              )}
              <button type="button" className="pk-b3 pk-b3--ai-or av2-send" aria-label={c('send')} disabled={!canSend} onClick={p.onSend}>
                <SysIcon name="odoslat" size={28} />
              </button>
            </>
          )}
        </div>
      </div>
      {p.error && <div className="av2-err" role="alert">{p.error}</div>}
      {p.recActive ? <div className="av2-hint">{c('phVoice')}</div> : cr && (
        <button type="button" className="av2-strip" aria-label={c('stripAria')} onClick={p.onStrip}>
          <Seal rank={cr.rank} size={22} />
          <span className="qm">{p.rankName(cr.rank)}</span>
          <span className="av2-qbar"><i style={{ width: `${pct}%` }} /></span>
          <span className="av2-qn">{Math.round(cr.used)} / {cr.allowance.toLocaleString(p.lang)}</span>
        </button>
      )}
    </div>
  );
}
