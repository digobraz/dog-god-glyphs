// ============================================================================
// PANEL „KTO MÁ PRÍSTUP" — čo sa otvorí za dverami PAWMATE (B5 / F3)
//
// Zadanie: `plany/zadanie-clenovia-svorky-2026-09-12.md` §5, §5b, §6.6, §6.10.
//
// ── PORADIE JE ZÁVÄZNÉ: PRÁVA → E-MAIL → POZVÁNKA → REGISTRÁCIA (§5b) ───────
// Preto je výber práv SÚČASŤOU pozývacieho formulára, nie obrazovkou „potom, čo
// sa človek pridá". Účet pozvaného vzniká až na konci a vzniká UŽ pripnutý na
// psa aj s právami — nikdy neexistuje „bezpsí" medzistav, ktorý zakazuje lock
// *„nemôže byť niekto v dogypte len tak cez login bez onboardingu a psa"*.
//
// ── PREČO PAPYRUS A NIE AINUBISOVA PALUBA (§6.10) ───────────────────────────
// Toto je NÁBYTOK A VLASTNÍCTVO — kto smie siahať na môjho psa. Do AINUBISOVEJ
// paluby patrí až NAHLÁSIŤ a ZABLOKOVAŤ človeka (lock 1. 9. 2026, precedens
// `messaging/Thread.tsx`). 🚩 Dnes tu nie je ani jedno: nahlásiť sa dá len
// niekoho, kto už niečo urobil, a pri jednom slote je odobratie rýchlejšie.
// Keď pribudne, ide do tmavej vetvy, nie na tento papyrus.
//
// ── BEZ KRÍŽIKA ─────────────────────────────────────────────────────────────
// Lock 28. 8. 2026 („nedávajme tie krížiky na bloky"). Von sa ide klikom mimo
// alebo Esc; `WillPanel` krížik má, ale je z 13. 8., teda spred locku.
//
// ── PORTÁL, NIE `position:fixed` VNÚTRI KARTY ───────────────────────────────
// 🔴 Blok 1 má `.pack-card-hover:hover { transform: translateY(-3px) }`. Prvok
// s transformáciou zakladá nový containing block, takže `fixed` potomok by sa
// pri prejdení myšou prilepil ku KARTE namiesto k oknu a panel by poskakoval.
// `AddPopup` portál zámerne nemá — ten má prekryť blok; tento má prekryť stránku.
// ============================================================================
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { PACK_THEME, PACK_BOX, PF_FIELD_CSS, FONT_TITLE, FONT_UI } from './packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from './navGoldSkin';
import { HandKey, HandTrash, HandArrowLeft } from './HandIcons';
import { useT, useLang } from '@/i18n/LanguageContext';
import {
  PAWMATE_RIGHTS, PAWMATE_PRESETS, RIGHT_LABEL, ROLE_LABEL, matchPreset,
  listDogAccess, setPawmateAccess, revokePawmate, revokeDogInvite, invitePawmate,
  type AccessRow, type PawmateRight, type PawmateRights, type PawmateRole,
} from '@/lib/pawmateRights';
import type { HeroDog } from './HeroCard';

const T = PACK_THEME;

/** R6 (Matej 13. 9. 2026: „R6 1") — jeden pawmate na psa v v1. Cieľovo 3.
 *  ⚠️ Skutočný strop drží `invite-pawmate` na serveri; toto číslo len rozhoduje,
 *  či sa formulár vôbec ukáže. Klientske číslo nie je ochrana. */
const MAX_PAWMATES = 1;

// Hover a zaškrtávatká — jediná vec, ktorá sa inline štýlom napísať nedá.
// ⚠️ JS template literal: spätný apostrof v komentári zhodí build (`npm run check:css`).
const PANEL_CSS = `
.mate-row{ display:flex; align-items:center; gap:11px; width:100%; padding:11px 12px; text-align:left; }
.mate-btn{
  font-family:${FONT_UI}; font-weight:500; font-size:10px; letter-spacing:.14em;
  text-transform:uppercase; padding:6px 10px; border-radius:999px; cursor:pointer;
  background:${T.tileBg}; border:1px solid ${T.border}; color:${T.inkWarm};
  transition:border-color .15s ease, color .15s ease;
}
.mate-btn:hover{ border-color:${T.cardEdge}; color:${T.inkStrong}; }
.mate-btn--danger:hover{ border-color:${T.alertRed}; color:#8E2A20; }
.mate-tick{
  display:flex; align-items:flex-start; gap:9px; width:100%; padding:9px 11px;
  border-radius:10px; cursor:pointer; text-align:left;
  background:${T.tileBg}; border:1px solid ${T.border}; color:${T.inkWarm};
  transition:background .15s ease, border-color .15s ease, color .15s ease;
}
.mate-tick:hover{ border-color:${T.cardEdge}; }
.mate-tick.on{ ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)} }
.mate-box{
  width:16px; height:16px; border-radius:5px; flex:0 0 auto; margin-top:1px;
  border:1.5px solid ${T.border}; background:${T.card};
  display:flex; align-items:center; justify-content:center;
  font-size:11px; line-height:1; color:transparent;
}
.mate-tick.on .mate-box{ border-color:${LAPIS.edge}; background:${LAPIS.edge}; color:${LAPIS.ink}; }
.mate-preset{
  flex:1 1 45%; min-width:0; padding:9px 10px; border-radius:10px; cursor:pointer; text-align:left;
  background:${T.tileBg}; border:1px solid ${T.border}; color:${T.inkWarm};
  transition:background .15s ease, border-color .15s ease, color .15s ease;
}
.mate-preset:hover{ border-color:${T.cardEdge}; }
.mate-preset.on{ ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)} }
.mate-cta{
  width:100%; padding:12px 16px; border-radius:8px; cursor:pointer;
  background:${LAPIS.grad}; color:${LAPIS.ink}; border:1px solid ${LAPIS.edge};
  box-shadow:${LAPIS_BTN_SHADOW};
  font-family:${FONT_TITLE}; font-weight:700; font-size:12px; letter-spacing:.16em;
  text-transform:uppercase;
  display:flex; align-items:center; justify-content:center; gap:8px;
  transition:background .15s ease;
}
.mate-cta:hover:not(:disabled){ background:${LAPIS.gradHover}; }
.mate-cta:disabled{ opacity:.5; cursor:default; }
`;

const EYEBROW = {
  fontFamily: FONT_UI, fontWeight: 500, fontSize: 10, letterSpacing: '0.26em',
  textTransform: 'uppercase', color: T.cardEdge,
} as const;

const PILL = {
  fontFamily: FONT_UI, fontWeight: 500, fontSize: 8.5, letterSpacing: '0.16em',
  textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999,
  border: `1px solid ${T.border}`, color: T.inkWarm, whiteSpace: 'nowrap',
} as const;

function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function PawmatePanel({ dogs, onClose }: { dogs: HeroDog[]; onClose: () => void }) {
  const t = useT();
  const { lang } = useLang();
  const tx = useCallback((k: string, f: string) => { const v = t(k); return v === k ? f : v; }, [t]);
  const lb = useCallback(([k, f]: [string, string]) => tx(k, f), [tx]);
  /** To isté ako `tx`, ale s premennými: keď kľúč chýba, dosadí ich do fallbacku sám. */
  const txv = useCallback((k: string, f: string, vars: Record<string, string>) => {
    const v = t(k, vars);
    if (v !== k) return v;
    return Object.entries(vars).reduce((acc, [key, val]) => acc.split('{' + key + '}').join(val), f);
  }, [t]);

  // Jeden pes → rovno doňho. Viac psov → najprv výber, lebo prístup sa dáva
  // K PSOVI, nie k účtu (§5): kto má troch psov a pozve opatrovateľa k jednému,
  // opatrovateľ vidí jedného psa. Bez tohto kroku by sa nedalo povedať ku ktorému.
  const [dogId, setDogId] = useState<string | null>(dogs.length === 1 ? dogs[0].id : null);
  const dog = dogs.find((d) => d.id === dogId) ?? null;

  const [rows, setRows] = useState<AccessRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  /** Koho práve odoberám — dvojkrokové potvrdenie priamo v riadku (§6.6:
   *  „jeden klik + jedno «naozaj»"), nie systémový `confirm()`. */
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  /** `null` = zoznam · `'invite'` = pozývací formulár · uuid = úprava člena. */
  const [form, setForm] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PawmateRole>('partner');
  const [rights, setRights] = useState<PawmateRights>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const load = useCallback(async (id: string) => {
    setRows(null); setErr(null);
    try { setRows(await listDogAccess(id)); }
    catch (e) { setErr(String((e as Error).message || e)); setRows([]); }
  }, []);

  useEffect(() => { if (dogId) void load(dogId); }, [dogId, load]);

  const mates = useMemo(() => (rows ?? []).filter((r) => r.kind === 'human' && r.source !== 'owner'), [rows]);
  const invites = useMemo(() => (rows ?? []).filter((r) => r.kind === 'invite'), [rows]);
  const owner = useMemo(() => (rows ?? []).find((r) => r.source === 'owner') ?? null, [rows]);
  const slotFree = rows !== null && mates.length + invites.length < MAX_PAWMATES;

  const openInvite = () => {
    const p = PAWMATE_PRESETS[1]; // „Partner" — najčastejší prípad, nie ten najsilnejší
    setEmail(''); setRole(p.role);
    setRights(Object.fromEntries(p.rights.map((r) => [r, true])));
    setSentTo(null); setErr(null); setForm('invite');
  };

  const openEdit = (row: AccessRow) => {
    setRole((row.role === 'family' || row.role === 'friend') ? row.role : 'partner');
    setRights({ ...row.rights });
    setErr(null); setForm(row.user_id);
  };

  const applyPreset = (id: string) => {
    const p = PAWMATE_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setRole(p.role);
    setRights(Object.fromEntries(p.rights.map((r) => [r, true])));
  };

  const toggle = (r: PawmateRight) =>
    setRights((prev) => { const n = { ...prev }; if (n[r]) delete n[r]; else n[r] = true; return n; });

  const errText = (code: string) => {
    const map: Record<string, [string, string]> = {
      no_slots: ['pack.mate.err.noSlots', 'This dog already has its place taken.'],
      rate_limited: ['pack.mate.err.rate', 'Too many invitations at once. Try again in an hour.'],
      self_invite: ['pack.mate.err.self', 'That is your own address — you are already here.'],
      bad_email: ['pack.mate.err.email', 'That address does not look right.'],
      mail_failed: ['pack.mate.err.mail', 'The invitation could not be sent. Check the address.'],
      dog_not_paid: ['pack.mate.err.unpaid', 'This dog does not have a heroglyph yet.'],
      not_found: ['pack.mate.err.gone', 'This is no longer there — the list has been refreshed.'],
      not_owner: ['pack.mate.err.notOwner', 'Only the owner of the dog can change this.'],
    };
    const hit = map[code.split(':')[0]];
    return hit ? lb(hit) : tx('pack.mate.err.generic', 'It did not go through. Try again.');
  };

  const send = async () => {
    if (!dogId || !looksLikeEmail(email)) return;
    setBusy(true); setErr(null);
    const res = await invitePawmate(dogId, email.trim(), role, rights);
    setBusy(false);
    if (res.ok === false) { setErr(errText(res.code)); return; }
    setSentTo(email.trim()); setForm(null);
    void load(dogId);
  };

  const save = async () => {
    if (!dogId || !form) return;
    setBusy(true); setErr(null);
    try { await setPawmateAccess(dogId, form, role, rights); setForm(null); void load(dogId); }
    catch (e) { setErr(errText(String((e as Error).message))); }
    finally { setBusy(false); }
  };

  const doRevoke = async (row: AccessRow) => {
    if (!dogId) return;
    setBusy(true); setErr(null);
    try {
      if (row.kind === 'invite' && row.invite_id) await revokeDogInvite(dogId, row.invite_id);
      else if (row.user_id) await revokePawmate(dogId, row.user_id);
      setConfirmKey(null); void load(dogId);
    } catch (e) { setErr(errText(String((e as Error).message))); }
    finally { setBusy(false); }
  };

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString(lang, { day: 'numeric', month: 'short' }); }
    catch { return ''; }
  };

  // ── VÝBER PSA ─────────────────────────────────────────────────────────────
  const dogPicker = (
    <div className="flex flex-col" style={{ gap: 9 }}>
      <p style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.55, color: T.inkWarm, margin: '0 0 2px' }}>
        {tx('pack.mate.pickDog', 'Access is given to a dog, not to your account. Which one?')}
      </p>
      {dogs.map((d) => (
        <button key={d.id} type="button" className="mate-row" style={{ ...PACK_BOX.row, cursor: 'pointer' }} onClick={() => setDogId(d.id)}>
          <span
            aria-hidden
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${T.cardEdge}`,
              background: d.cloudinary_main_url ? `center/cover url('${d.cloudinary_main_url}')` : T.tileBg,
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 13, color: T.inkStrong,
            }}
          >
            {d.cloudinary_main_url ? '' : (d.dog_name || 'D').charAt(0).toUpperCase()}
          </span>
          <span style={{
            fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontWeight: 700, fontSize: 14,
            color: T.inkStrong, minWidth: 0, flex: 1,
          }}>
            {d.dog_name || tx('pack.mate.unnamedDog', 'Your dog')}
          </span>
          {typeof d.pack_number === 'number' && (
            <span style={PILL}>#{d.pack_number}</span>
          )}
        </button>
      ))}
    </div>
  );

  // ── ZAŠKRTÁVATKÁ + PREDVOĽBY ──────────────────────────────────────────────
  const activePreset = matchPreset(role, rights);
  const rightsEditor = (
    <div className="flex flex-col" style={{ gap: 10 }}>
      <div>
        <div style={EYEBROW}>{tx('pack.mate.presetsTitle', 'Level of access')}</div>
        <div className="flex" style={{ gap: 7, flexWrap: 'wrap', marginTop: 7 }}>
          {PAWMATE_PRESETS.map((p) => (
            <button
              key={p.id} type="button"
              className={`mate-preset${activePreset === p.id ? ' on' : ''}`}
              onClick={() => applyPreset(p.id)}
            >
              <span style={{ display: 'block', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {lb(p.label)}
              </span>
              <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 10.5, lineHeight: 1.35, marginTop: 2, opacity: 0.85 }}>
                {lb(p.hint)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={EYEBROW}>{tx('pack.mate.rightsTitle', 'What they may change')}</div>
        {/* ZÁKLAD SA NEZAŠKRTÁVA — každý pawmate vidí o psovi všetko (§5). Bez tejto
            vety vyzerá prázdny zoznam ako „nevidí nič", a to je opak pravdy. */}
        <p style={{ fontFamily: FONT_UI, fontSize: 11.5, lineHeight: 1.5, color: T.inkWarm, margin: '5px 0 8px' }}>
          {tx('pack.mate.rightsBase', 'They always see everything about the dog — health, food, trips. Below you choose only what they may change.')}
        </p>
        <div className="flex flex-col" style={{ gap: 6 }}>
          {PAWMATE_RIGHTS.map((r) => (
            <button key={r} type="button" className={`mate-tick${rights[r] ? ' on' : ''}`} onClick={() => toggle(r)} aria-pressed={!!rights[r]}>
              <span aria-hidden className="mate-box">✓</span>
              <span style={{ fontFamily: FONT_UI, fontSize: 12, lineHeight: 1.4, minWidth: 0 }}>{lb(RIGHT_LABEL[r])}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const backBtn = (
    <button type="button" className="mate-btn" onClick={() => { setForm(null); setErr(null); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <HandArrowLeft size={12} />
      {tx('pack.mate.back', 'Back')}
    </button>
  );

  // ── TELO ──────────────────────────────────────────────────────────────────
  let body: ReactNode;
  if (!dog) {
    body = dogPicker;
  } else if (rows === null) {
    body = (
      <div className="flex items-center justify-center" style={{ padding: '28px 0', color: T.inkWarm }}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  } else if (form === 'invite') {
    body = (
      <div className="flex flex-col" style={{ gap: 14 }}>
        <div>
          <div style={EYEBROW}>{tx('pack.mate.emailLabel', 'Their e-mail')}</div>
          <input
            className="pf-field pf-field--flat"
            type="email"
            inputMode="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value.slice(0, 160))}
            placeholder={tx('pack.mate.emailPh', 'name@example.com')}
            style={{ width: '100%', borderRadius: 8, padding: '10px 12px', marginTop: 7, fontFamily: FONT_UI, fontSize: 13, color: T.inkStrong }}
          />
        </div>
        {rightsEditor}
        {err && <p style={{ fontFamily: FONT_UI, fontSize: 12, color: '#8E2A20', margin: 0 }}>{err}</p>}
        <button type="button" className="mate-cta" onClick={send} disabled={busy || !looksLikeEmail(email)}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <HandKey size={15} />}
          {tx('pack.mate.send', 'Send the invitation')}
        </button>
        {/* Čo sa stane POTOM — pozvaný dostane mail a účet mu vznikne až vtedy, keď
            naň klikne. Bez tejto vety majiteľ nevie, prečo sa nič nedeje. */}
        <p style={{ fontFamily: FONT_UI, fontSize: 11, lineHeight: 1.5, color: T.inkWarm, margin: 0 }}>
          {tx('pack.mate.sendNote', 'They get one personal link, good for seven days. Nothing exists until they open it themselves — and it costs nothing, the heroglyph belongs to the dog.')}
        </p>
        <div>{backBtn}</div>
      </div>
    );
  } else if (form) {
    body = (
      <div className="flex flex-col" style={{ gap: 14 }}>
        {rightsEditor}
        {err && <p style={{ fontFamily: FONT_UI, fontSize: 12, color: '#8E2A20', margin: 0 }}>{err}</p>}
        <button type="button" className="mate-cta" onClick={save} disabled={busy}>
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {tx('pack.mate.save', 'Save the access')}
        </button>
        <div>{backBtn}</div>
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col" style={{ gap: 9 }}>
        {sentTo && (
          <p style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.5, color: PICK_INK.green, margin: 0 }}>
            {txv('pack.mate.sent', 'The invitation is on its way to {email}.', { email: sentTo })}
          </p>
        )}

        {owner && (
          <div className="mate-row" style={PACK_BOX.row}>
            <Avatar url={owner.avatar_url} label={owner.name} />
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'block', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12.5, letterSpacing: '0.06em', color: T.inkStrong }}>
                {owner.name || tx('pack.mate.you', 'You')}
              </span>
              <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 11, color: T.inkWarm, marginTop: 1 }}>
                {tx('pack.mate.ownerNote', 'Payment, the number, and everything that cannot be undone')}
              </span>
            </span>
            <span style={PILL}>{lb(ROLE_LABEL.pawtner)}</span>
          </div>
        )}

        {mates.map((m) => (
          <div key={m.user_id ?? 'm'} className="flex flex-col" style={{ ...PACK_BOX.row, gap: 8, padding: '11px 12px' }}>
            <div className="flex items-center" style={{ gap: 11 }}>
              <Avatar url={m.avatar_url} label={m.name || m.email} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12.5, letterSpacing: '0.06em', color: T.inkStrong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.name || m.email || tx('pack.mate.someone', 'Pawmate')}
                </span>
                <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 11, color: T.inkWarm, marginTop: 1 }}>
                  {rightsSummary(m.rights, tx)}
                </span>
              </span>
              <span style={PILL}>{lb(ROLE_LABEL[m.role] ?? ROLE_LABEL.partner)}</span>
            </div>
            {confirmKey === m.user_id ? (
              <ConfirmRow
                question={tx('pack.mate.removeAsk', 'Remove their access to this dog?')}
                yes={tx('pack.mate.removeYes', 'Remove')}
                no={tx('pack.mate.cancel', 'Cancel')}
                busy={busy}
                onYes={() => doRevoke(m)}
                onNo={() => setConfirmKey(null)}
              />
            ) : (
              <div className="flex" style={{ gap: 7 }}>
                <button type="button" className="mate-btn" onClick={() => openEdit(m)}>{tx('pack.mate.edit', 'Change access')}</button>
                <button type="button" className="mate-btn mate-btn--danger" onClick={() => setConfirmKey(m.user_id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <HandTrash size={12} />
                  {tx('pack.mate.remove', 'Remove')}
                </button>
              </div>
            )}
          </div>
        ))}

        {invites.map((iv) => (
          <div key={iv.invite_id ?? 'i'} className="flex flex-col" style={{ ...PACK_BOX.row, gap: 8, padding: '11px 12px' }}>
            <div className="flex items-center" style={{ gap: 11 }}>
              <Avatar url={null} label={iv.email} dim />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 12.5, color: T.inkStrong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {iv.email}
                </span>
                <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 11, color: T.inkWarm, marginTop: 1 }}>
                  {tx('pack.mate.waiting', 'Waiting for them to accept')}
                  {iv.expires_at ? ` · ${tx('pack.mate.until', 'until')} ${fmtDate(iv.expires_at)}` : ''}
                </span>
              </span>
              <span style={PILL}>{lb(ROLE_LABEL[iv.role] ?? ROLE_LABEL.partner)}</span>
            </div>
            {confirmKey === iv.invite_id ? (
              <ConfirmRow
                question={tx('pack.mate.revokeAsk', 'Withdraw this invitation?')}
                yes={tx('pack.mate.revokeYes', 'Withdraw')}
                no={tx('pack.mate.cancel', 'Cancel')}
                busy={busy}
                onYes={() => doRevoke(iv)}
                onNo={() => setConfirmKey(null)}
              />
            ) : (
              <div className="flex" style={{ gap: 7 }}>
                <button type="button" className="mate-btn mate-btn--danger" onClick={() => setConfirmKey(iv.invite_id)}>
                  {tx('pack.mate.revoke', 'Withdraw the invitation')}
                </button>
              </div>
            )}
          </div>
        ))}

        {err && <p style={{ fontFamily: FONT_UI, fontSize: 12, color: '#8E2A20', margin: 0 }}>{err}</p>}

        {slotFree ? (
          <button type="button" className="mate-cta" onClick={openInvite} style={{ marginTop: 4 }}>
            <HandKey size={15} />
            {tx('pack.mate.inviteCta', 'Invite someone')}
          </button>
        ) : (
          // Prečo sa nedá pozvať druhého — bez tejto vety vyzerá chýbajúce tlačidlo
          // ako porucha. Číslo drží server, takže sa tu netvrdí nič, čo by neplatilo.
          <p style={{ fontFamily: FONT_UI, fontSize: 11.5, lineHeight: 1.5, color: T.inkWarm, margin: '4px 0 0' }}>
            {tx('pack.mate.slotNote', 'One dog, one pawmate for now. Remove this one and the place opens again.')}
          </p>
        )}
      </div>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 70, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', padding: 16 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tx('pack.mate.title', 'Who has access')}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...PACK_BOX.panel,
          padding: '22px 20px',
          width: '100%', maxWidth: 460, maxHeight: '88vh', overflowY: 'auto',
          color: T.ink,
        }}
      >
        <style>{PF_FIELD_CSS}{PANEL_CSS}</style>

        <div style={EYEBROW}>{tx('pack.mate.eyebrow', 'Pawmate')}</div>
        <h3 style={{
          fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 18, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: T.inkStrong, margin: '3px 0 0',
        }}>
          {tx('pack.mate.title', 'Who has access')}
        </h3>
        {dog && (
          <p style={{ fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm, margin: '4px 0 0' }}>
            <span style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontWeight: 700, color: T.inkStrong }}>
              {dog.dog_name || tx('pack.mate.unnamedDog', 'Your dog')}
            </span>
            {dogs.length > 1 && (
              <>
                {' · '}
                <button
                  type="button"
                  onClick={() => { setDogId(null); setForm(null); setRows(null); setSentTo(null); }}
                  style={{ fontFamily: FONT_UI, fontSize: 12, color: LAPIS.edge, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                >
                  {tx('pack.mate.otherDog', 'another dog')}
                </button>
              </>
            )}
          </p>
        )}

        <div style={{ height: 2, background: T.rule, margin: '14px 0 16px' }} />
        {body}
      </div>
    </div>,
    document.body,
  );
}

/** Krúžok s fotkou alebo iniciálou — jeden tvar pre človeka aj pre pozvánku. */
function Avatar({ url, label, dim = false }: { url: string | null; label: string | null; dim?: boolean }) {
  return (
    <span
      aria-hidden
      className="shrink-0 flex items-center justify-center"
      style={{
        width: 34, height: 34, borderRadius: '50%',
        border: `1.5px ${dim ? 'dashed' : 'solid'} ${dim ? T.border : T.cardEdge}`,
        background: url ? `center/cover url('${url}')` : T.tileBg,
        fontFamily: FONT_UI, fontWeight: 600, fontSize: 13, color: T.inkWarm,
      }}
    >
      {url ? '' : (label || '?').charAt(0).toUpperCase()}
    </span>
  );
}

/** Jedno „naozaj" priamo v riadku (§6.6). Systémový `confirm()` sa tu nepoužíva —
 *  na mobile vyzerá ako chyba prehliadača a nedá sa obrandovať. */
function ConfirmRow({ question, yes, no, busy, onYes, onNo }: {
  question: string; yes: string; no: string; busy: boolean;
  onYes: () => void; onNo: () => void;
}) {
  return (
    <div className="flex items-center" style={{ gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: FONT_UI, fontSize: 11.5, color: T.inkStrong, flex: '1 1 100%' }}>{question}</span>
      <button type="button" className="mate-btn mate-btn--danger" onClick={onYes} disabled={busy} style={{ borderColor: T.alertRed, color: '#8E2A20' }}>
        {yes}
      </button>
      <button type="button" className="mate-btn" onClick={onNo} disabled={busy}>{no}</button>
    </div>
  );
}

/** Jednoriadkové zhrnutie práv do riadku člena. Osem menoviek pod menom by
 *  z riadku spravilo odstavec; celý zoznam je o klik ďalej v úprave. */
function rightsSummary(rights: PawmateRights, tx: (k: string, f: string) => string): string {
  const n = PAWMATE_RIGHTS.filter((r) => rights[r]).length;
  if (n === 0) return tx('pack.mate.sumNone', 'Sees everything, changes nothing');
  if (n === PAWMATE_RIGHTS.length) return tx('pack.mate.sumAll', 'May change everything that can be undone');
  // ⚠️ „{n} things" sa do slovenčiny nepreloží jedným tvarom (1 vec · 2–4 veci · 5+ vecí).
  // Zlomok tú pascu obchádza a povie navyše, koľko z toho ešte ostáva nedané.
  return tx('pack.mate.sumSome', 'May change {n} of {all}')
    .replace('{n}', String(n)).replace('{all}', String(PAWMATE_RIGHTS.length));
}
