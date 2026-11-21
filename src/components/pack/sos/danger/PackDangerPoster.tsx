// `/pack/sos/nebezpecenstvo/p/:id/plagat` — PLAGÁT prípadu (kôš 3 · ROBÍM ÚLOHU): story 9:16 a príspevok 4:5, náhľad + zdieľať.
// Týranie nesie len obec + okruh (fotku ani adresu nie), vynucuje to `posterView` v `DangerPoster.tsx`.
// Export: `nodeToPng` → PNG presne 1080×1920 / 1080×1350 → `shareFiles` (web stiahne, appka otvorí systémový hárok).
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dangerAccessIssue, dangerCase, dangerHasSession, dangerNotFound, dangerUrl, isDangerUuid, type DangerAccess, type DangerCase } from '@/lib/danger';
import { AccessCard } from './dangerForm';
import { shareFiles } from '@/lib/shareFile';
import { toast } from '@/hooks/use-toast';
import { nodeToPng } from '../sosFlyerExport';
import { SosCard, useBack, useSosT } from '../sosShared';
import { SosTaskShell } from '../SosTaskShell';
import { DangerPoster, POSTER_SIZE, type PosterFormat } from './DangerPoster';
import { PACK_SPACE as S, PACK_SHADOW } from '@/components/pack/packTheme';

const CSS = `
.dpp-pick{display:grid;grid-template-columns:1fr 1fr;gap:${S.sm}px;}
.dpp-stage{width:100%;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:${PACK_SHADOW.card};}
.dpp-stage--story{max-width:300px;}
.dpp-stage--post{max-width:420px;}
`;

export default function PackDangerPoster() {
  const { id = '' } = useParams<{ id: string }>();
  const s = useSosT();
  const back = useBack(`/pack/sos/nebezpecenstvo/p/${id}`);
  const [c, setC] = useState<DangerCase | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [access, setAccess] = useState<DangerAccess | null>(null);
  const [tick, setTick] = useState(0);
  const [fmt, setFmt] = useState<PosterFormat>('story');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    setC(undefined); setFailed(false); setAccess(null);
    // neplatné ID = „prípad neexistuje“, nie „bez pripojenia“
    if (!isDangerUuid(id)) { setC(null); return; }
    void dangerHasSession().then((has) => {
      if (!alive) return;
      if (!has) { setC(null); setAccess('login'); return; }
      dangerCase(id).then((r) => alive && setC(r)).catch(async (e) => {
        const acc = await dangerAccessIssue(e);
        if (alive) { setC(null); if (acc) setAccess(acc); else setFailed(!dangerNotFound(e)); }
      });
    });
    return () => { alive = false; };
  }, [id, tick]);
  useEffect(() => { setReady(false); }, [fmt, c?.id]);
  const onReady = useCallback(() => setReady(true), []);

  const waiting = c?.kind === 'abuse' && c.review !== 'approved';
  const place = c?.municipality?.trim() || s('pack.sos.danger.poster.place');

  const share = async () => {
    if (!node.current || !c || busy) return;
    setBusy(true);
    try {
      const { w, h } = POSTER_SIZE[fmt];
      const png = await nodeToPng(node.current, w, h);
      const ok = await shareFiles([{ blob: png, name: `dogypt-nebezpecenstvo-${c.slug}-${fmt}.png` }], s('pack.sos.danger.poster.shareText', { place, url: dangerUrl(c.slug) }));
      if (!ok) toast({ title: s('pack.sos.fl.noShare') });
    } catch { toast({ title: s('pack.sos.danger.poster.fail') }); }
    finally { setBusy(false); }
  };

  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <h1 className="sos-h2">{s('pack.sos.danger.poster.title')}</h1>
      {c === undefined && <p className="sos-p">{s('pack.sos.loading')}</p>}
      {c === null && access && <AccessCard access={access} />}
      {c === null && !access && (
        <SosCard>
          <p className="sos-err">{failed ? s('pack.sos.offline') : s('pack.sos.danger.case.missing')}</p>
          {failed && <button type="button" className="sos-cta" onClick={() => setTick((n) => n + 1)}>{s('pack.sos.retry')}</button>}
        </SosCard>
      )}
      {c && waiting && <SosCard><p className="sos-p">{s('pack.sos.danger.poster.pending')}</p></SosCard>}
      {c && !waiting && (
        <>
          <div className="dpp-pick" role="group">
            {(['story', 'post'] as const).map((f) => (
              <button key={f} type="button" className={`sos-cta sos-cta--sm ${fmt === f ? 'sos-cta--tint' : 'sos-cta--ghost'}`} aria-pressed={fmt === f} onClick={() => setFmt(f)}>
                {s(`pack.sos.danger.poster.${f}`)}
              </button>
            ))}
          </div>
          <div className={`dpp-stage dpp-stage--${fmt}`}>
            <div ref={node}>
              <DangerPoster
                key={fmt}
                format={fmt}
                onReady={onReady}
                data={{ slug: c.slug, kind: c.kind, place: c.municipality ?? '', lat: c.lat, lng: c.lng, radius_m: c.radius_m, what: c.what, photo: c.photos[0] ?? null }}
              />
            </div>
          </div>
          <button type="button" className="sos-cta" disabled={!ready || busy} onClick={() => void share()}>
            {busy ? s('pack.sos.danger.poster.making') : s('pack.sos.danger.poster.share')}
          </button>
        </>
      )}
    </SosTaskShell>
  );
}
