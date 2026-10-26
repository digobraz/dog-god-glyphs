// TRI BODKY „NAHLÁSIŤ / ZABLOKOVAŤ" (App Store 1.2 — UGC musí mať nahlásenie a blokovanie).
// Matej 26. 10. 2026: *„nahlásiť a zablokovať pridaj 3 bodky vpravo hore pri príspevku v hlavičke"*.
// Jeden komponent pre detail príspevku (`PostViewer`), kartu vo feede (`FeedPostCard`) aj cudzí profil
// (`PublicProfile`, bez `postId` = nahlási sa člen). Na vlastnom príspevku ponúka namiesto toho ZMAZAŤ.
// Šuplík = ten istý šat ako ULOŽIŤ v `PostViewer`; nahlásenie = AINUBIS panel (`ReportSheet`, rovnaké dôvody
// a rovnaké potvrdenie ako pri komentári výletu) — brand lock: hlásenia patria AINUBISOVI.
// Akcia nikdy neodnesie človeka preč z miesta (lock architektura-pack §4.2).
import { lazy, Suspense, useState } from 'react';
import { createPortal } from 'react-dom';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, VEIL_CSS } from '@/components/pack/packTheme';
import { BackButton } from '@/components/pack/BackButton';
import { useSheetSwipe } from '@/components/pack/useSheetSwipe';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n/LanguageContext';
import { blockMember, reportTarget, useBlockedOwners } from './moderation';
import type { ReportReason } from '@/components/pack/messaging/packMessaging';

// Ťažký modul (celý článok komentárov výletu) sa nahrá až pri ťuku na NAHLÁSIŤ.
const ReportSheet = lazy(() => import('@/components/pack/trip/TripComments').then((m) => ({ default: m.ReportSheet })));

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

export const POST_MENU_CSS = `
.pm-btn{flex:none;display:grid;place-items:center;width:40px;height:40px;margin-right:-${S.sm}px;background:none;border:0;padding:0;cursor:pointer;color:${T.inkStrong};border-radius:${PACK_R.pill}px;}
.pm-btn:active{opacity:.6;}
.pm-btn.cover{margin-right:0;background:rgba(0,0,0,.45);color:${T.onDark};}
.pm-sh.pk-veil{z-index:1350;align-items:flex-end;padding:0;}
.pm-sh .sh{width:100%;display:flex;flex-direction:column;background:${T.cardGrad};border-top:1.5px solid ${T.cardEdge};
  border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${T.panelShadow};animation:pm-up .32s cubic-bezier(.2,.8,.2,1) both;}
.pm-sh .grab{flex:none;width:44px;height:4px;border-radius:${PACK_R.pill}px;background:${T.hairline};margin:${S.sm}px auto 0;}
.pm-sh .hd{flex:none;display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.lg}px ${S.md}px;}
.pm-sh .hd h2{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.14em;text-transform:uppercase;} /* písmo: nadpis */
.pm-sh ul{list-style:none;margin:0;padding:0 ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);}
.pm-sh li button{display:flex;align-items:center;width:100%;padding:${S.md}px 0;background:none;border:0;cursor:pointer;color:${T.inkStrong};
  font-family:${FONT_UI};font-size:${TX.body}px;font-weight:600;text-align:left;}
.pm-sh li button.bad{color:${T.alertRed};}
.pm-sh li button:disabled{opacity:.5;cursor:default;}
@keyframes pm-up{from{transform:translateY(100%);}to{transform:none;}}
@media (min-width:768px){ .pm-sh.pk-veil{align-items:center;} .pm-sh .sh{width:480px;border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px;} }
`;

/** Tri bodky — vlastná kresba (kruhy), nie lucide. */
function Dots() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  );
}

export function PostMenu({ postId, authorN, authorName, mine = false, onDelete, tone = 'ink' }: {
  /** Id príspevku — bez neho (profil) sa nahlasuje člen. */
  postId?: string;
  /** Poradové číslo majiteľa autora; bez neho sa nedá zablokovať ani nahlásiť člen. */
  authorN: number | null;
  authorName: string;
  mine?: boolean;
  /** Vlastný príspevok: zmazanie (dvojťuk). */
  onDelete?: () => void | Promise<void>;
  /** `onCover` = na fotke (profil): tmavý kruh a biele bodky. */
  tone?: 'ink' | 'onCover';
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { toast } = useToast();
  const blocked = useBlockedOwners();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [sent, setSent] = useState(false);
  const [repBusy, setRepBusy] = useState(false);
  const [repErr, setRepErr] = useState<string | null>(null);
  const [sure, setSure] = useState<'' | 'delete' | 'block'>('');
  const [busy, setBusy] = useState(false);
  const sw = useSheetSwipe(() => close());

  const who = authorName || tx('pack.mod.thisMember', 'this member');
  const isBlocked = authorN != null && blocked.has(authorN);
  const reportRef = postId ?? (authorN != null ? String(authorN) : null);
  const canReport = !mine && reportRef != null;
  const canBlock = !mine && authorN != null;
  if (!(mine && onDelete) && !canReport && !canBlock) return null;

  const close = () => { setOpen(false); setSure(''); };
  const errToast = () => toast({ title: tx('pack.profile.toastUnknownError', 'Unknown error'), variant: 'destructive' });

  const del = async () => {
    if (sure !== 'delete') { setSure('delete'); return; }
    if (busy || !onDelete) return;
    setBusy(true);
    try { await onDelete(); close(); } catch { setSure(''); errToast(); } finally { setBusy(false); }
  };
  const block = async () => {
    if (authorN == null || busy) return;
    if (!isBlocked && sure !== 'block') { setSure('block'); return; }
    setBusy(true);
    try {
      const on = await blockMember(authorN, !isBlocked);
      close();
      toast({ title: (on ? tx('pack.mod.blocked', '{name} is blocked. Their posts are hidden.') : tx('pack.mod.unblocked', '{name} is unblocked.')).replace('{name}', who) });
    } catch { setSure(''); errToast(); } finally { setBusy(false); }
  };
  const sendReport = async (reason: ReportReason, note?: string) => {
    if (!reportRef) return;
    setRepBusy(true); setRepErr(null);
    try { await reportTarget(postId ? 'post' : 'member', reportRef, reason, note); setSent(true); }
    catch { setRepErr(tx('pack.mod.reportErr', 'Could not send the report. Check your connection and try again.')); }
    finally { setRepBusy(false); }
  };

  return (
    <>
      <style>{POST_MENU_CSS}</style>
      <button type="button" className={`pm-btn${tone === 'onCover' ? ' cover' : ''}`} onClick={() => setOpen(true)} aria-label={tx('pack.mod.more', 'More')} aria-haspopup="dialog"><Dots /></button>
      {open && createPortal(
        <div className="pm-sh pk-veil pk-veil--modal" role="dialog" aria-modal="true" aria-label={tx('pack.mod.more', 'More')}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <style>{VEIL_CSS}</style>
          <div className="sh" style={sw.sheetStyle}>
            <span className="grab" aria-hidden {...sw.handle} />
            <div className="hd" {...sw.handle}>
              <BackButton tone="pale" onClick={close} label={tx('pack.network.close', 'Close')} />
              <h2>{mine ? tx('pack.me.post', 'Post') : who}</h2>
            </div>
            <ul>
              {mine && onDelete && (
                <li><button type="button" className="bad" disabled={busy} onClick={del}>
                  {sure === 'delete' ? tx('pack.story.deleteSure', 'Tap again to delete') : tx('pack.story.delete', 'Delete')}
                </button></li>
              )}
              {canReport && (
                <li><button type="button" onClick={() => { close(); setSent(false); setRepErr(null); setReporting(true); }}>
                  {postId ? tx('pack.mod.reportPost', 'Report post') : tx('pack.mod.reportMember', 'Report member')}
                </button></li>
              )}
              {canBlock && (
                <li><button type="button" className={isBlocked ? undefined : 'bad'} disabled={busy} onClick={block}>
                  {isBlocked
                    ? tx('pack.mod.unblock', 'Unblock {name}').replace('{name}', who)
                    : sure === 'block'
                      ? tx('pack.mod.blockSure', 'Tap again to block {name}').replace('{name}', who)
                      : tx('pack.mod.block', 'Block {name}').replace('{name}', who)}
                </button></li>
              )}
            </ul>
          </div>
        </div>,
        document.body,
      )}
      {reporting && (
        <Suspense fallback={null}>
          <ReportSheet onClose={() => setReporting(false)} onSend={sendReport} busy={repBusy} error={repErr} sent={sent} />
        </Suspense>
      )}
    </>
  );
}
