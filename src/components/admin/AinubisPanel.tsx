/**
 * AinubisPanel — nový tab AINUBIS v `/admin` (Mission Control).
 *
 * Matejovo "chcem vidieť na vlastné oči, ako ľudia s botom píšu": dvojstĺpcová
 * živá konzola nad edge fn `ainubis-ops` (gated na admin JWT, viď index.ts).
 * Čitateľnosť a živosť > množstvo funkcií — žiadne vymýšľanie nového dizajnu,
 * len GOLD/CINZEL/GROTESK tokeny prevzaté z Admin.tsx.
 *
 * Bezpečnosť: obsah správ (`content`) je nedôveryhodný používateľský vstup —
 * renderuje sa len ako text (JSX auto-escapuje), nikdy cez
 * dangerouslySetInnerHTML. `session_token` sa z API ani nečíta.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { GOLD, GOLD_LIGHT, CINZEL, GROTESK, MONO, INK, fmtDate, short, brandBtn } from '@/pages/Admin';

type TriageType = 'bug' | 'idea' | 'question' | 'praise' | 'complaint' | 'spam';
type Severity = 'low' | 'medium' | 'high';

interface AinubisTriage {
  type?: TriageType;
  severity?: Severity;
  needs_matej?: boolean;
  devotion?: number;
}

interface AinubisConversationRow {
  id: string;
  created_at: string;
  last_message_at: string;
  lang: string | null;
  entry_page: string | null;
  member_email: string | null;
  status: string;
  takeover: boolean;
  summary: string | null;
  msg_count: number;
  triage: AinubisTriage | null;
  contact_id: string | null;
}

// `thread` vracia `select('*')` z ainubis_conversations — teda aj polia, ktoré
// tu nepoužívame (session_token, visitor_id, user_agent…). Zámerne ich sem
// nepridávam do typu, aby sa nikde v komponente nedali omylom vypísať.
type AinubisConversationDetail = AinubisConversationRow;

interface AinubisMessageMeta {
  type?: TriageType;
  severity?: Severity;
  needs_matej?: boolean;
  devotion?: number;
  model?: string;
  tokens?: number;
}

interface AinubisMessageRow {
  id: string;
  created_at: string;
  role: 'user' | 'assistant' | 'matej' | 'system';
  content: string | null;
  image_path: string | null;
  image_url: string | null;
  meta: AinubisMessageMeta | null;
}

interface ThreadData {
  conversation: AinubisConversationDetail;
  messages: AinubisMessageRow[];
}

const TRIAGE_EMOJI: Record<TriageType, string> = {
  bug: '🐞', idea: '💡', question: '❓', praise: '💛', complaint: '😠', spam: '🗑',
};

const STATUS_LABEL: Record<string, string> = { open: 'Open', escalated: 'Escalated', resolved: 'Resolved' };
const STATUS_COLOR: Record<string, string> = {
  open: '#5ad68c', escalated: '#e0a3a3', resolved: 'rgba(250,244,236,0.4)',
};

// ── edge fn helper ──────────────────────────────────────────────────────────
// `supabase.functions.invoke` sám pripojí `Authorization: Bearer <access_token>`
// z aktuálnej session (rovnaký mechanizmus, na ktorý sa spolieha zvyšok
// Admin.tsx cez RLS) — `ainubis-ops` beží BEZ --no-verify-jwt, takže bez
// platného admin JWT vráti 401/403 skôr, než sa vôbec pozrie na `action`.
async function callOps<T>(
  action: string,
  params: Record<string, unknown> = {},
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke<T & { error?: string }>('ainubis-ops', {
    body: { action, ...params },
  });
  if (error) return { data: null, error: error.message || 'Požiadavka na ainubis-ops zlyhala.' };
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    return { data: null, error: String(data.error) };
  }
  return { data: data as T, error: null };
}

const POLL_MS = 5000;

export default function AinubisPanel({ initialConversationId }: { initialConversationId: string | null }) {
  const isMobile = useIsMobile();

  const [conversations, setConversations] = useState<AinubisConversationRow[]>([]);
  const [listErr, setListErr] = useState('');
  const [listLoading, setListLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId);
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [threadErr, setThreadErr] = useState('');
  const [threadLoading, setThreadLoading] = useState(false);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // deep link môže prísť aj po prvom mounte panelu (URL sa nemení, ale pre istotu)
  useEffect(() => {
    if (initialConversationId) setSelectedId(initialConversationId);
  }, [initialConversationId]);

  // ── zoznam konverzácií (ľavý stĺpec), auto-refresh 5 s, stop keď je tab skrytý ──
  const loadList = useCallback(async () => {
    if (document.hidden) return;
    const { data, error } = await callOps<{ conversations: AinubisConversationRow[] }>('list');
    if (error) { setListErr(error); return; }
    setListErr('');
    setConversations(data?.conversations ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => { setListLoading(true); await loadList(); if (!cancelled) setListLoading(false); })();
    const id = window.setInterval(loadList, POLL_MS);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [loadList]);

  // ── vlákno (pravý stĺpec), auto-refresh 5 s kým je konverzácia otvorená ──────
  const loadThread = useCallback(async (convId: string) => {
    if (document.hidden) return;
    const { data, error } = await callOps<ThreadData>('thread', { conversation_id: convId });
    if (error) { setThreadErr(error); return; }
    setThreadErr('');
    setThread(data);
  }, []);

  useEffect(() => {
    if (!selectedId) { setThread(null); return; }
    let cancelled = false;
    (async () => { setThreadLoading(true); await loadThread(selectedId); if (!cancelled) setThreadLoading(false); })();
    const id = window.setInterval(() => loadThread(selectedId), POLL_MS);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [selectedId, loadThread]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [thread?.messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedId) return;
    setSending(true);
    const { error } = await callOps('send', { conversation_id: selectedId, text });
    setSending(false);
    if (error) { setThreadErr(error); return; }
    setDraft('');
    void loadThread(selectedId);
    void loadList();
  };

  const handleTakeover = async (value: boolean) => {
    if (!selectedId || busyAction) return;
    setBusyAction(true);
    const { error } = await callOps('takeover', { conversation_id: selectedId, value });
    setBusyAction(false);
    if (error) { setThreadErr(error); return; }
    void loadThread(selectedId);
    void loadList();
  };

  const handleResolve = async () => {
    if (!selectedId || busyAction) return;
    setBusyAction(true);
    const { error } = await callOps('resolve', { conversation_id: selectedId });
    setBusyAction(false);
    if (error) { setThreadErr(error); return; }
    void loadThread(selectedId);
    void loadList();
  };

  const showList = !isMobile || !selectedId;
  const showThread = !isMobile || !!selectedId;

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {showList && (
        <div style={{
          flex: isMobile ? '1 1 100%' : '0 0 360px',
          maxWidth: isMobile ? '100%' : 360,
          background: '#0e0e0e',
          border: '1px solid rgba(201,154,63,0.2)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(201,154,63,0.18)', fontFamily: CINZEL, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: GOLD }}>
            Konverzácie {conversations.length > 0 && <span style={{ opacity: 0.5 }}>({conversations.length})</span>}
          </div>
          {listErr && <p style={{ color: '#e0a3a3', fontSize: 12, padding: '10px 14px' }}>{listErr}</p>}
          {listLoading && conversations.length === 0 && <p style={{ opacity: 0.6, fontSize: 13, padding: '10px 14px' }}>Loading…</p>}
          {!listLoading && conversations.length === 0 && !listErr && (
            <p style={{ opacity: 0.6, fontSize: 13, padding: '10px 14px' }}>Zatiaľ žiadne konverzácie.</p>
          )}
          <div style={{ maxHeight: 640, overflowY: 'auto' }}>
            {conversations.map((c) => (
              <ConversationRow key={c.id} conv={c} active={c.id === selectedId} onClick={() => setSelectedId(c.id)} />
            ))}
          </div>
        </div>
      )}

      {showThread && (
        <div style={{
          flex: '1 1 auto',
          minWidth: 0,
          background: '#0e0e0e',
          border: '1px solid rgba(201,154,63,0.2)',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 480,
        }}>
          {isMobile && (
            <button onClick={() => setSelectedId(null)}
              style={{ alignSelf: 'flex-start', margin: '10px 0 0 12px', background: 'none', border: 'none', color: GOLD, fontSize: 13, cursor: 'pointer', fontFamily: GROTESK }}>
              ← Späť na zoznam
            </button>
          )}

          {!selectedId && (
            <p style={{ opacity: 0.5, fontSize: 14, padding: 24 }}>Vyber konverzáciu vľavo.</p>
          )}

          {selectedId && threadLoading && !thread && (
            <p style={{ opacity: 0.6, fontSize: 13, padding: 24 }}>Loading…</p>
          )}

          {selectedId && threadErr && <p style={{ color: '#e0a3a3', fontSize: 12, padding: '10px 16px' }}>{threadErr}</p>}

          {selectedId && thread && (
            <>
              <ThreadHeader
                conv={thread.conversation}
                busy={busyAction}
                onTakeover={handleTakeover}
                onResolve={handleResolve}
              />

              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {thread.messages.length === 0 && <p style={{ opacity: 0.5, fontSize: 13 }}>Žiadne správy.</p>}
                {thread.messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} onImageClick={setLightboxUrl} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ borderTop: '1px solid rgba(201,154,63,0.18)', padding: 12, display: 'flex', gap: 8, flexShrink: 0 }}>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
                  placeholder="Napíš ako AINUBIS…"
                  rows={2}
                  style={{
                    flex: 1, resize: 'vertical', background: '#000', color: '#fff',
                    border: '1px solid rgba(201,154,63,0.3)', borderRadius: 8, padding: '9px 11px',
                    fontFamily: GROTESK, fontSize: 13, boxSizing: 'border-box',
                  }}
                />
                <button onClick={() => void handleSend()} disabled={sending || !draft.trim()}
                  style={{ ...brandBtn, alignSelf: 'flex-end', opacity: sending || !draft.trim() ? 0.5 : 1, cursor: sending || !draft.trim() ? 'default' : 'pointer' }}>
                  Odoslať
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out',
          }}>
          <img src={lightboxUrl} alt="screenshot" style={{ maxWidth: '94vw', maxHeight: '94vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 0 40px rgba(0,0,0,0.6)' }} />
        </div>
      )}
    </div>
  );
}

// ── ľavý stĺpec: jeden riadok konverzácie ───────────────────────────────────
function ConversationRow({ conv, active, onClick }: { conv: AinubisConversationRow; active: boolean; onClick: () => void }) {
  const emoji = conv.triage?.type ? TRIAGE_EMOJI[conv.triage.type] : null;
  const who = conv.member_email || 'hosť';
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left', background: active ? 'rgba(201,154,63,0.1)' : 'transparent',
      border: 'none', borderBottom: '1px solid #161616', borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
      padding: '10px 12px', cursor: 'pointer', fontFamily: GROTESK, color: 'inherit',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
        <span style={{ fontSize: 11, opacity: 0.5 }}>{fmtDate(conv.last_message_at)}</span>
        <span style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase' }}>{conv.lang || '—'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        {emoji && <span style={{ fontSize: 14 }}>{emoji}</span>}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {conv.summary || short(conv.entry_page, 40) || 'bez zhrnutia'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: STATUS_COLOR[conv.status] ?? 'rgba(250,244,236,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ● {STATUS_LABEL[conv.status] ?? conv.status}
        </span>
        <span style={{ fontSize: 11, opacity: 0.5 }}>{conv.msg_count} sprv</span>
        <span style={{ fontSize: 11, opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>{who}</span>
        {conv.contact_id && <span title="Odoslané do konzília" style={{ fontSize: 11 }}>🔧</span>}
      </div>
      {conv.takeover && (
        <div style={{
          marginTop: 6, fontSize: 10, fontWeight: 700, color: '#0e0e0e', background: GOLD_LIGHT,
          display: 'inline-block', padding: '2px 8px', borderRadius: 999, letterSpacing: '0.04em',
        }}>
          🎙 PREVZATÉ
        </div>
      )}
    </button>
  );
}

// ── pravý stĺpec: hlavička vlákna ───────────────────────────────────────────
function ThreadHeader({
  conv, busy, onTakeover, onResolve,
}: {
  conv: AinubisConversationDetail;
  busy: boolean;
  onTakeover: (value: boolean) => void;
  onResolve: () => void;
}) {
  const emoji = conv.triage?.type ? TRIAGE_EMOJI[conv.triage.type] : null;
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,154,63,0.18)', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: CINZEL, fontSize: 15, color: GOLD, display: 'flex', alignItems: 'center', gap: 6 }}>
            {emoji && <span>{emoji}</span>}
            <span>{conv.member_email || 'hosť'}</span>
            <span style={{ fontSize: 10, color: STATUS_COLOR[conv.status] ?? 'rgba(250,244,236,0.5)', fontWeight: 700, textTransform: 'uppercase', marginLeft: 6 }}>
              ● {STATUS_LABEL[conv.status] ?? conv.status}
            </span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.55, marginTop: 3 }}>
            {conv.lang?.toUpperCase() || '—'} · {conv.entry_page || '—'} · {conv.msg_count} sprv
            {conv.contact_id && <span> · 🔧 v konzíliu</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => onTakeover(!conv.takeover)} disabled={busy}
            style={{
              background: conv.takeover ? GOLD : 'none', color: conv.takeover ? '#0e0e0e' : GOLD,
              border: `1px solid ${GOLD}`, borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700,
              cursor: busy ? 'default' : 'pointer', fontFamily: GROTESK, opacity: busy ? 0.6 : 1,
            }}>
            {conv.takeover ? '🎙 Vrátiť AINUBISOVI' : '🎙 Prevziať'}
          </button>
          <button onClick={onResolve} disabled={busy || conv.status === 'resolved'}
            style={{
              background: 'none', color: '#5ad68c', border: '1px solid rgba(90,214,140,0.5)', borderRadius: 8,
              padding: '7px 12px', fontSize: 12, fontWeight: 700, fontFamily: GROTESK,
              cursor: busy || conv.status === 'resolved' ? 'default' : 'pointer', opacity: busy || conv.status === 'resolved' ? 0.5 : 1,
            }}>
            ✅ Vyriešené
          </button>
        </div>
      </div>
      {conv.takeover && (
        <div style={{
          marginTop: 10, background: 'rgba(224,163,163,0.1)', border: '1px solid rgba(224,163,163,0.4)',
          borderRadius: 8, padding: '8px 12px', color: '#e0a3a3', fontSize: 12, fontWeight: 600,
        }}>
          AINUBIS mlčí — zákazník čaká na Mateja.
        </div>
      )}
    </div>
  );
}

// ── jedna bublina vlákna ─────────────────────────────────────────────────────
function MessageBubble({ msg, onImageClick }: { msg: AinubisMessageRow; onImageClick: (url: string) => void }) {
  const isUser = msg.role === 'user';
  const isMatej = msg.role === 'matej';
  const isAssistant = msg.role === 'assistant';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.4, fontStyle: 'italic', fontFamily: GROTESK }}>
        {msg.content}
      </div>
    );
  }

  const bg = isMatej ? 'rgba(90,180,214,0.14)' : isAssistant ? 'rgba(201,154,63,0.12)' : 'rgba(255,255,255,0.05)';
  const border = isMatej ? 'rgba(90,180,214,0.4)' : isAssistant ? 'rgba(201,154,63,0.4)' : 'rgba(255,255,255,0.1)';
  const label = isMatej ? 'Matej' : isAssistant ? 'AINUBIS' : null;
  const labelColor = isMatej ? '#7cc6e6' : GOLD;

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-start' : 'flex-end' }}>
      <div style={{
        maxWidth: '78%', background: bg, border: `1px solid ${border}`, borderRadius: 10,
        padding: '9px 12px', fontFamily: GROTESK,
      }}>
        {label && (
          <div style={{ fontFamily: CINZEL, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor, marginBottom: 4 }}>
            {label}
          </div>
        )}
        {/* NIKDY dangerouslySetInnerHTML — content je nedôveryhodný user input,
            JSX text node ho auto-escapuje (rovnaká lekcia ako P0 XSS v GodsGrid). */}
        <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'rgba(250,244,236,0.92)' }}>
          {msg.content}
        </div>
        {msg.image_url && (
          <img
            src={msg.image_url}
            alt="screenshot"
            onClick={() => onImageClick(msg.image_url!)}
            style={{ marginTop: 8, maxWidth: 220, maxHeight: 160, borderRadius: 6, cursor: 'zoom-in', display: 'block', border: '1px solid rgba(255,255,255,0.15)' }}
          />
        )}
        {isAssistant && msg.meta && (msg.meta.type || msg.meta.severity || msg.meta.devotion != null) && (
          <div style={{ marginTop: 6, fontSize: 10, opacity: 0.5, fontFamily: MONO }}>
            {[
              msg.meta.type,
              msg.meta.severity,
              msg.meta.devotion != null ? `devotion ${msg.meta.devotion}` : null,
            ].filter(Boolean).join(' · ')}
          </div>
        )}
        <div style={{ marginTop: 4, fontSize: 10, opacity: 0.35 }}>{fmtDate(msg.created_at)}</div>
      </div>
    </div>
  );
}
