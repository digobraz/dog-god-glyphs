// Diktafón chatu v2: MediaRecorder (webm/opus tam, kde ho prehliadač vie, inak mp4 — iPhone Safari = mp4).
// Hook len nahráva; prepis robí server (`ainubis-hlas` stt, ElevenLabs Scribe), vlákno sa o neho stará v AinubisChatV2.
import { useCallback, useEffect, useRef, useState } from 'react';

/** Strop jednej nahrávky (s). Server má vlastný limit na bajty, tento drží nahrávku rozumne krátku. */
const MAX_SEC = 180;
const MIMES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/ogg;codecs=opus'];

export const recorderSupported = () =>
  typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

function pickMime(): string {
  const ok = (m: string) => { try { return MediaRecorder.isTypeSupported(m); } catch { return false; } };
  return MIMES.find(ok) ?? '';
}

export interface Recording { blob: Blob; mime: string; sec: number; url: string }

export function useRecorder() {
  const [active, setActive] = useState(false);
  const [sec, setSec] = useState(0);
  const [denied, setDenied] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const t0Ref = useRef(0);
  const tickRef = useRef<number | undefined>(undefined);
  const resolveRef = useRef<((r: Recording | null) => void) | null>(null);
  const cancelledRef = useRef(false);

  const release = useCallback(() => {
    window.clearInterval(tickRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recRef.current = null;
    setActive(false);
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    if (recRef.current || !recorderSupported()) return false;
    setDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMime();
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      cancelledRef.current = false;
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const type = rec.mimeType || mime || 'audio/mp4';
        const took = Math.max(1, Math.round((Date.now() - t0Ref.current) / 1000));
        const blob = new Blob(chunksRef.current, { type });
        const done = resolveRef.current;
        resolveRef.current = null;
        release();
        if (cancelledRef.current || !blob.size) done?.(null);
        else done?.({ blob, mime: type, sec: took, url: URL.createObjectURL(blob) });
      };
      recRef.current = rec;
      t0Ref.current = Date.now();
      rec.start();
      setSec(0);
      setActive(true);
      tickRef.current = window.setInterval(() => {
        const s = Math.round((Date.now() - t0Ref.current) / 1000);
        setSec(s);
        if (s >= MAX_SEC) { try { rec.stop(); } catch { /* už skončila */ } }
      }, 250);
      return true;
    } catch {
      setDenied(true);
      release();
      return false;
    }
  }, [release]);

  /** Zastaví a vráti nahrávku (`null` pri zrušení / prázdnej). */
  const stop = useCallback((): Promise<Recording | null> => new Promise((resolve) => {
    const rec = recRef.current;
    if (!rec || rec.state === 'inactive') { resolve(null); return; }
    resolveRef.current = resolve;
    try { rec.stop(); } catch { resolveRef.current = null; release(); resolve(null); }
  }), [release]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    const rec = recRef.current;
    if (rec && rec.state !== 'inactive') { try { rec.stop(); } catch { release(); } } else release();
  }, [release]);

  // Odchod z obrazovky nesmie nechať mikrofón bežať.
  useEffect(() => () => {
    cancelledRef.current = true;
    try { recRef.current?.stop(); } catch { /* nič nebeží */ }
    release();
  }, [release]);

  return { active, sec, denied, start, stop, cancel };
}
