// ============================================================================
// PAWMATES V PROFILE — správa svorky z pohľadu ČLOVEKA (B6b)
//
// Zadanie: `plany/zadanie-pawmates-v-profile-2026-09-13.md`.
//
// ── ČO TÁTO OBRAZOVKA OTÁČA ─────────────────────────────────────────────────
// `PawmatePanel` (B5) sa pýta „kto má prístup k TOMUTO psovi". Táto sekcia sa
// pýta „čo smie TENTO ČLOVEK a ku ktorým mojim psom" — a psa mu vie pridať aj
// ubrať. Panel NEZANIKÁ: pri jednom psovi je kratšia cesta a `/pack/join/:token`
// z neho ďalej číta.
//
// ── ROZHODNUTIE MATEJA 13. 9. 2026, Z KTORÉHO VYCHÁDZA CELÝ TVAR ────────────
// *„PAWMATE = človek vo svorke, nie pre konkrétneho PSA… ak si ja adoptujem
// ďalšieho psa, môj prípadný pawtner ho uvidí a dostane práva aké mal aj pri
// Hektorovi."*
// Preto:
//   · zaškrtávatká práv sú JEDNY — nie prepínač psa nad nimi (tak to navrhovalo
//     zadanie §2.2, Matejova odpoveď to prebila),
//   · nový pes dostane pawmata sám (trigger v `20260913_my_pawmates.sql`),
//   · pri pozývaní sa psy VYBERAJÚ (Matejova voľba: „vyberiem psov pri pozývaní").
//
// 🔴 V DB SÚ PRÁVA NAPRIEK TOMU PER PES — `(dog_id, user_id) → rights`. Tretí stav
// („spoločné práva") neexistuje. Keď sa práva pri psoch ROZÍDU (dá sa to: starý
// riadok, ručný zásah, budúce doladenie), obrazovka to POVIE a ponúkne zjednotenie.
// Nikdy nepočíta priemer ani nezobrazí jedny práva ako fakt — taká obrazovka by
// pri uložení ticho prepísala druhého psa.
//
// 🔒 DVERE SÚ ZAMKNUTÉ. Celá sekcia visí na `PAWMATE_LIVE` (dnes `false`);
// odomkne ju až beh B8 po teste F7. Stavia sa za zamknutými dverami rovnako ako
// panel v B5 — nestihnutie pred launchom potom nestojí nič.
// ============================================================================
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PACK_THEME, PACK_BOX, PF_FIELD_CSS, FONT_TITLE, FONT_UI } from './packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from './navGoldSkin';
import { HandKey, HandTrash } from './HandIcons';
import { useT, useLang } from '@/i18n/LanguageContext';
import {
  PAWMATE_RIGHTS, PAWMATE_PRESETS, RIGHT_LABEL, ROLE_LABEL, matchPreset,
  listMyPawmates, addPawmateDog, setPawmateAccess, revokePawmate, revokeDogInvite,
  invitePawmate,
  type MyPawmates, type PawmateRow, type PawmateRight, type PawmateRights, type PawmateRole,
} from '@/lib/pawmateRights';

const T = PACK_THEME;

/** R6 (Matej 13. 9. 2026: „R6 1") — jeden pawmate NA PSA. Nie na človeka: ten smie
 *  byť pri viacerých psoch. Skutočný strop drží server; toto číslo len rozhoduje,
 *  ktoré psy sa v pozývacom formulári vôbec ponúknu. */
const MAX_PAWMATES = 1;

// ⚠️ JS template literal: spätný apostrof v komentári zhodí build (`npm run check:css`).
const CSS = `
.pws-row{ display:flex; align-items:center; gap:11px; width:100%; padding:11px 12px; text-align:left; }
.pws-btn{
  font-family:${FONT_UI}; font-weight:500; font-size:10px; letter-spacing:.14em;
  text-transform:uppercase; padding:6px 10px; border-radius:999px; cursor:pointer;
  background:${T.tileBg}; border:1px solid ${T.border}; color:${T.inkWarm};
  transition:border-color .15s ease, color .15s ease;
}
.pws-btn:hover{ border-color:${T.cardEdge}; color:${T.inkStrong}; }
.pws-btn--danger:hover{ border-color:#B25640; color:#8E2A20; }
.pws-tick{
  display:flex; align-items:flex-start; gap:9px; width:100%; padding:9px 11px;
  border-radius:10px; cursor:pointer; text-align:left;
  background:${T.tileBg}; border:1px solid ${T.border}; color:${T.inkWarm};
  transition:background .15s ease, border-color .15s ease, color .15s ease;
}
.pws-tick:hover{ border-color:${T.cardEdge}; }
.pws-tick.on{ ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)} }
.pws-box{
  width:16px; height:16px; border-radius:5px; flex:0 0 auto; margin-top:1px;
  border:1.5px solid ${T.border}; background:${T.card};
  display:flex; align-items:center; justify-content:center;
  font-size:11px; line-height:1; color:transparent;
}
.pws-tick.on .pws-box{ border-color:${LAPIS.edge}; background:${LAPIS.edge}; color:${LAPIS.ink}; }
.pws-dog{ align-items:center; gap:11px; padding:9px 11px; }
.pws-preset{
  flex:1 1 45%; min-width:0; padding:9px 10px; border-radius:10px; cursor:pointer; text-align:left;
  background:${T.tileBg}; border:1px solid ${T.border}; color:${T.inkWarm};
  transition:background .15s ease, border-color .15s ease, color .15s ease;
}
.pws-preset:hover{ border-color:${T.cardEdge}; }
.pws-preset.on{ ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)} }
.pws-cta{
  width:100%; padding:12px 16px; border-radius:8px; cursor:pointer;
  background:${LAPIS.grad}; color:${LAPIS.ink}; border:1px solid ${LAPIS.edge};
  box-shadow:${LAPIS_BTN_SHADOW};
  font-family:${FONT_TITLE}; font-weight:700; font-size:12px; letter-spacing:.16em;
  text-transform:uppercase;
  display:flex; align-items:center; justify-content:center; gap:8px;
  transition:background .15s ease;
}
.pws-cta:hover:not(:disabled){ background:${LAPIS.gradHover}; }
.pws-cta:disabled{ opacity:.5; cursor:default; }
.pws-chip{
  font-family:${FONT_TITLE}; font-weight:700; font-size:9.5px; letter-spacing:.1em;
  text-transform:uppercase; padding:3px 9px; border-radius:999px; white-space:nowrap;
  border:1px solid ${T.border}; color:${T.inkWarm}; background:${T.tileBg};
}
`;

const EYEBROW = {
  fontFamily: FONT_UI, fontWeight: 500, fontSize: 11, letterSpacing: '0.26em',
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

const NAME_STYLE = {
  display: 'block', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12.5,
  letterSpacing: '0.06em', color: T.inkStrong,
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
} as const;

const ADDR_STYLE = {
  display: 'block', fontFamily: FONT_UI, fontWeight: 500, fontSize: 12.5,
  color: T.inkStrong,
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
} as const;

/** Psy v poradí PODĽA PORADOVÉHO ČÍSLA — to je poradie vstupu do svorky a to isté
 *  poradie má zoznam psov nižšie. Bez toho chipy kopírujú poradie riadkov v DB,
 *  teda čas pozvania, a tie dva zoznamy si na obrazovke protirečia. */
function dogsInOrder(p: PawmateRow): PawmateRow['dogs'] {
  return [...p.dogs].sort((a, b) => (a.pack_number ?? 1e9) - (b.pack_number ?? 1e9));
}

/** Sú práva pri všetkých psoch zhodné? Porovnávajú sa ZAŠKRTNUTÉ kľúče, nie celé
 *  objekty — `{}` a `{"will":false}` znamenajú to isté a `JSON.stringify` nie. */
function sameRights(dogs: PawmateRow['dogs']): boolean {
  if (dogs.length < 2) return true;
  const key = (r: PawmateRights) => PAWMATE_RIGHTS.filter((k) => r[k]).join(',');
  const first = key(dogs[0].rights) + '|' + dogs[0].role;
  return dogs.every((d) => key(d.rights) + '|' + d.role === first);
}

export function PawmatesSection() {
  const t = useT();
  const { lang } = useLang();
  const tx = useCallback((k: string, f: string) => { const v = t(k); return v === k ? f : v; }, [t]);
  const lb = useCallback(([k, f]: [string, string]) => tx(k, f), [tx]);
  const txv = useCallback((k: string, f: string, vars: Record<string, string>) => {
    const v = t(k, vars);
    if (v !== k) return v;
    return Object.entries(vars).reduce((acc, [key, val]) => acc.split('{' + key + '}').join(val), f);
  }, [t]);

  const [data, setData] = useState<MyPawmates | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  /** `null` = zoznam · `'invite'` = pozývací formulár · uuid = detail človeka. */
  const [open, setOpen] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  // Rozpracovaný stav detailu/pozvánky.
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PawmateRole>('partner');
  const [rights, setRights] = useState<PawmateRights>({});
  const [pickedDogs, setPickedDogs] = useState<string[]>([]);

  const load = useCallback(async () => {
    setErr(null);
    try { setData(await listMyPawmates()); }
    catch (e) { setErr(String((e as Error).message || e)); setData({ people: [], dogs: [] }); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // PRÍLET Z DVERÍ „+" NA HOMEPAGE (`/pack/profile#pawmates`). React Router na hash
  // sám neskáče — bez tohto by človek pristál hore na profile a sekciu by musel
  // nájsť očami. Skáče sa až po prvom načítaní dát: dovtedy má sekcia výšku
  // spinnera a skok by pristál nad ňou.
  useEffect(() => {
    if (data === null) return;
    if (window.location.hash !== '#pawmates') return;
    document.getElementById('pawmates')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [data]);

  const people = useMemo(() => (data?.people ?? []).filter((p) => p.kind === 'human'), [data]);
  const invites = useMemo(() => (data?.people ?? []).filter((p) => p.kind === 'invite'), [data]);
  const myDogs = data?.dogs ?? [];

  /** Psy, ktoré ešte majú voľné miesto — teda tie, ku ktorým sa dá pozvať.
   *  Obsadené sa v pozývacom formulári neponúkajú vôbec: ponúknuť ich a nechať
   *  server odmietnuť celú pozvánku je horšie než ich nezobraziť. */
  const freeDogs = useMemo(() => {
    const busyIds = new Set<string>();
    for (const p of data?.people ?? []) for (const d of p.dogs) busyIds.add(d.dog_id);
    return myDogs.filter((d) => !busyIds.has(d.id));
  }, [data, myDogs]);

  const errText = (code: string) => {
    const map: Record<string, [string, string]> = {
      no_slots: ['pack.mates.err.noSlots', 'That dog already has its place taken.'],
      rate_limited: ['pack.mate.err.rate', 'Too many invitations at once. Try again in an hour.'],
      self_invite: ['pack.mate.err.self', 'That is your own address — you are already here.'],
      self: ['pack.mate.err.self', 'That is your own address — you are already here.'],
      bad_email: ['pack.mate.err.email', 'That address does not look right.'],
      mail_failed: ['pack.mate.err.mail', 'The invitation could not be sent. Check the address.'],
      dog_not_paid: ['pack.mate.err.unpaid', 'This dog does not have a heroglyph yet.'],
      not_found: ['pack.mate.err.gone', 'This is no longer there — the list has been refreshed.'],
      not_owner: ['pack.mate.err.notOwner', 'Only the owner of the dog can change this.'],
      not_a_pawmate: ['pack.mates.err.stranger', 'They are not in your pack yet — invite them first.'],
    };
    const hit = map[code.split(':')[0]];
    return hit ? lb(hit) : tx('pack.mate.err.generic', 'It did not go through. Try again.');
  };

  const openPerson = (p: PawmateRow) => {
    // Východisko = práva pri NAJSTARŠOM psovi (Matej: *„dostane práva aké mal aj pri
    // Hektorovi"*). To isté pravidlo drží trigger aj `add_pawmate_dog` v DB; keby si
    // obrazovka brala „prvý riadok v odpovedi", navrhla by pri rozchode niečo iné
    // než server.
    const first = dogsInOrder(p)[0];
    setRole((first?.role === 'family' || first?.role === 'friend') ? first.role : 'partner');
    setRights({ ...(first?.rights ?? {}) });
    setPickedDogs(p.dogs.map((d) => d.dog_id));
    setErr(null); setSentTo(null); setOpen(p.user_id);
  };

  const openInvite = () => {
    const p = PAWMATE_PRESETS[1]; // „Partner" — najčastejší prípad, nie ten najsilnejší
    setEmail(''); setRole(p.role);
    setRights(Object.fromEntries(p.rights.map((r) => [r, true])));
    // Predvolene VŠETKY voľné psy — pawmate je člen svorky, nie prívesok jedného psa.
    setPickedDogs(freeDogs.map((d) => d.id));
    setErr(null); setSentTo(null); setOpen('invite');
  };

  const applyPreset = (id: string) => {
    const p = PAWMATE_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setRole(p.role);
    setRights(Object.fromEntries(p.rights.map((r) => [r, true])));
  };

  const toggleRight = (r: PawmateRight) =>
    setRights((prev) => { const n = { ...prev }; if (n[r]) delete n[r]; else n[r] = true; return n; });

  const toggleDog = (id: string) =>
    setPickedDogs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const send = async () => {
    if (!looksLikeEmail(email) || pickedDogs.length === 0) return;
    setBusy(true); setErr(null);
    const res = await invitePawmate(pickedDogs, email.trim(), role, rights);
    setBusy(false);
    if (res.ok === false) { setErr(errText(res.code)); return; }
    setSentTo(email.trim()); setOpen(null);
    void load();
  };

  /**
   * Uloženie detailu. Tri druhy zmien naraz a poradie je zámerné:
   *   1. PRIDANÉ psy — `add_pawmate_dog` (INSERT; `set_pawmate_access` vie len UPDATE)
   *   2. práva pri VŠETKÝCH zaškrtnutých psoch — jedny, aplikované na každého
   *   3. ODOBRANÉ psy — až nakoniec, aby posledný zdroj práv nezmizol skôr, než sa
   *      z neho skopírujú na nového psa
   */
  const save = async (p: PawmateRow) => {
    if (!p.user_id) return;
    setBusy(true); setErr(null);
    const had = new Set(p.dogs.map((d) => d.dog_id));
    try {
      for (const id of pickedDogs) if (!had.has(id)) await addPawmateDog(id, p.user_id);
      for (const id of pickedDogs) await setPawmateAccess(id, p.user_id, role, rights);
      for (const d of p.dogs) if (!pickedDogs.includes(d.dog_id)) await revokePawmate(d.dog_id, p.user_id);
      setOpen(null); await load();
    } catch (e) { setErr(errText(String((e as Error).message))); }
    finally { setBusy(false); }
  };

  /** Odobratie úplne — človek zmizne zo zoznamu, lebo mu neostane ani jeden pes. */
  const removeAll = async (p: PawmateRow) => {
    if (!p.user_id) return;
    setBusy(true); setErr(null);
    try {
      for (const d of p.dogs) await revokePawmate(d.dog_id, p.user_id);
      setConfirmKey(null); setOpen(null); await load();
    } catch (e) { setErr(errText(String((e as Error).message))); }
    finally { setBusy(false); }
  };

  const withdraw = async (p: PawmateRow) => {
    setBusy(true); setErr(null);
    try {
      for (const d of p.dogs) if (d.invite_id) await revokeDogInvite(d.dog_id, d.invite_id);
      setConfirmKey(null); await load();
    } catch (e) { setErr(errText(String((e as Error).message))); }
    finally { setBusy(false); }
  };

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString(lang, { day: 'numeric', month: 'short' }); }
    catch { return ''; }
  };

  // ── ZAŠKRTÁVATKÁ PRÁV ─────────────────────────────────────────────────────
  const activePreset = matchPreset(role, rights);
  const rightsEditor = (
    <div className="flex flex-col" style={{ gap: 10 }}>
      <div>
        <div style={EYEBROW}>{tx('pack.mate.presetsTitle', 'Level of access')}</div>
        <div className="flex" style={{ gap: 7, flexWrap: 'wrap', marginTop: 7 }}>
          {PAWMATE_PRESETS.map((p) => (
            <button key={p.id} type="button" className={`pws-preset${activePreset === p.id ? ' on' : ''}`} onClick={() => applyPreset(p.id)}>
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
            <button key={r} type="button" className={`pws-tick${rights[r] ? ' on' : ''}`} onClick={() => toggleRight(r)} aria-pressed={!!rights[r]}>
              <span aria-hidden className="pws-box">✓</span>
              <span style={{ fontFamily: FONT_UI, fontSize: 12, lineHeight: 1.4, minWidth: 0 }}>{lb(RIGHT_LABEL[r])}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /** Zoznam mojich psov so zaškrtávatkom. `only` = ponúknuť len tieto (pozvánka
   *  ponúka výhradne psy s voľným miestom). */
  const dogPicker = (only?: string[]) => (
    <div>
      <div style={EYEBROW}>{tx('pack.mates.dogsTitle', 'Which of your dogs')}</div>
      <div className="flex flex-col" style={{ gap: 6, marginTop: 7 }}>
        {myDogs.filter((d) => !only || only.includes(d.id)).map((d) => {
          const on = pickedDogs.includes(d.id);
          return (
            <button key={d.id} type="button" className={`pws-tick pws-dog${on ? ' on' : ''}`} onClick={() => toggleDog(d.id)} aria-pressed={on}>
              <span aria-hidden className="pws-box" style={{ marginTop: 0 }}>✓</span>
              <span
                aria-hidden
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${T.cardEdge}`,
                  background: d.photo ? `center/cover url('${d.photo}')` : T.tileBg,
                  fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12, color: T.inkStrong,
                }}
              >
                {d.photo ? '' : (d.name || 'D').charAt(0).toUpperCase()}
              </span>
              {/* Meno psa = Cinzel Decorative. Tu je pes SUBJEKTOM riadku (fotka +
                  meno), nie popiskou v zozname — ten istý tvar má výber psa
                  v `PawmatePanel`. V drobných chipoch nižšie je meno len odkazom,
                  tam ostáva obyčajný Cinzel (lock zúžený 14. 8. 2026). */}
              <span style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontWeight: 700, fontSize: 13, color: T.inkStrong, minWidth: 0, flex: 1 }}>
                {d.name || tx('pack.mate.unnamedDog', 'Your dog')}
              </span>
              {typeof d.pack_number === 'number' && <span style={PILL}>#{d.pack_number}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── TELO ──────────────────────────────────────────────────────────────────
  let body: React.ReactNode;

  if (data === null) {
    body = (
      <div className="flex items-center justify-center" style={{ padding: '28px 0', color: T.inkWarm }}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  } else if (open === 'invite') {
    body = (
      <div className="flex flex-col" style={{ gap: 14 }}>
        <div>
          <div style={EYEBROW}>{tx('pack.mate.emailLabel', 'Their e-mail')}</div>
          <input
            className="pf-field pf-field--flat"
            type="email" inputMode="email" autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value.slice(0, 160))}
            placeholder={tx('pack.mate.emailPh', 'name@example.com')}
            style={{ width: '100%', borderRadius: 8, padding: '10px 12px', marginTop: 7, fontFamily: FONT_UI, fontSize: 13, color: T.inkStrong }}
          />
        </div>
        {/* Pri JEDNOM voľnom psovi sa zaškrtávatko nekreslí — nedalo by sa odškrtnúť,
            takže by to bola atrapa voľby. Ale pes sa MUSÍ pomenovať: bez toho formulár
            nepovie, ku komu vlastne pozýva. */}
        {freeDogs.length > 1 ? dogPicker(freeDogs.map((d) => d.id)) : freeDogs.length === 1 && (
          <div>
            <div style={EYEBROW}>{tx('pack.mates.dogsTitle', 'Which of your dogs')}</div>
            <p style={{ margin: '6px 0 0', fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontWeight: 700, fontSize: 14, color: T.inkStrong }}>
              {freeDogs[0].name || tx('pack.mate.unnamedDog', 'Your dog')}
              {typeof freeDogs[0].pack_number === 'number' && (
                <span style={{ ...PILL, marginLeft: 8 }}>#{freeDogs[0].pack_number}</span>
              )}
            </p>
          </div>
        )}
        {rightsEditor}
        {err && <p style={{ fontFamily: FONT_UI, fontSize: 12, color: '#8E2A20', margin: 0 }}>{err}</p>}
        <button type="button" className="pws-cta" onClick={send} disabled={busy || !looksLikeEmail(email) || pickedDogs.length === 0}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <HandKey size={15} />}
          {tx('pack.mate.send', 'Send the invitation')}
        </button>
        <p style={{ fontFamily: FONT_UI, fontSize: 11, lineHeight: 1.5, color: T.inkWarm, margin: 0 }}>
          {tx('pack.mate.sendNote', 'They get one personal link, good for seven days. Nothing exists until they open it themselves — and it costs nothing, the heroglyph belongs to the dog.')}
        </p>
        <div><button type="button" className="pws-btn" onClick={() => { setOpen(null); setErr(null); }}>{tx('pack.mate.back', 'Back')}</button></div>
      </div>
    );
  } else if (open) {
    const p = people.find((x) => x.user_id === open);
    if (!p) { body = null; }
    else {
      const mixed = !sameRights(p.dogs);
      // Ako toho človeka NAZVAŤ vo vete. Meno býva prázdne (`pack_profiles.display_name`
      // si vypĺňa málokto), a vtedy je jediné, čo o ňom majiteľ pozná, ADRESA — tá istá,
      // ktorú ukazuje riadok v zozname. Holé „Pawmate" sa v otázke „Vyradiť Pawmate zo
      // svorky?" číta ako chyba prekladu.
      const who = p.name || p.email || tx('pack.mate.someone', 'Pawmate');
      body = (
        <div className="flex flex-col" style={{ gap: 14 }}>
          <div className="flex items-center" style={{ gap: 11 }}>
            <Avatar url={p.avatar_url} label={p.name || p.email} />
            <span style={{ minWidth: 0, flex: 1 }}>
              {/* Tá istá deliaca čiara ako v zozname: meno = Cinzel, ADRESA = Space
                  Grotesk. Cinzel má len verzálky a z adresy by spravil `MENO@DOMENA`. */}
              <span style={p.name ? { ...NAME_STYLE, fontSize: 14 } : { ...ADDR_STYLE, fontSize: 13 }}>
                {p.name || p.email || tx('pack.mate.someone', 'Pawmate')}
              </span>
              {p.email && p.name && (
                <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 11, color: T.inkWarm, marginTop: 1 }}>{p.email}</span>
              )}
            </span>
          </div>

          {/* 🔴 PRÁVA SA PRI PSOCH ROZIŠLI. Nepočíta sa priemer a neukazujú sa jedny
              ako fakt — obrazovka povie, čo v DB naozaj je, a uloženie to zjednotí.
              Bez tejto vety by majiteľ uložil detail a ticho prepísal druhého psa. */}
          {mixed && (
            <p style={{ fontFamily: FONT_UI, fontSize: 11.5, lineHeight: 1.5, color: '#8E2A20', margin: 0 }}>
              {txv('pack.mates.mixed', 'Right now {name} has different access at each dog. What you save here applies to all of them.',
                { name: who })}
            </p>
          )}

          {myDogs.length > 1 && dogPicker()}
          {rightsEditor}
          {err && <p style={{ fontFamily: FONT_UI, fontSize: 12, color: '#8E2A20', margin: 0 }}>{err}</p>}

          {pickedDogs.length === 0 ? (
            confirmKey === p.user_id ? (
              <ConfirmRow
                question={txv('pack.mates.removeAsk', 'Take {name} out of your pack completely?', { name: who })}
                yes={tx('pack.mate.removeYes', 'Remove')}
                no={tx('pack.mate.cancel', 'Cancel')}
                busy={busy} onYes={() => removeAll(p)} onNo={() => setConfirmKey(null)}
              />
            ) : (
              <button type="button" className="pws-cta" onClick={() => setConfirmKey(p.user_id)} disabled={busy}
                style={{ background: 'none', color: '#8E2A20', borderColor: '#B25640', boxShadow: 'none' }}>
                <HandTrash size={14} />
                {tx('pack.mates.removeAll', 'Remove from the pack')}
              </button>
            )
          ) : (
            <button type="button" className="pws-cta" onClick={() => save(p)} disabled={busy}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {tx('pack.mate.save', 'Save the access')}
            </button>
          )}
          <div><button type="button" className="pws-btn" onClick={() => { setOpen(null); setErr(null); setConfirmKey(null); }}>{tx('pack.mate.back', 'Back')}</button></div>
        </div>
      );
    }
  } else if (people.length === 0 && invites.length === 0) {
    // ── PRÁZDNY STAV = VÝZVA, NIE OZNAM (Matej 13. 9. 2026) ──────────────────
    // *„prázdny stav PAWMATE sa zobrazuje v /profile tiež sa výzvou — pridaj
    // člena svorky (priveď do dogyptu jedného ľudského člena, daj mu práva
    // a možnosť nahliadnuť) udel mu prava nech je aj on v obraze."*
    // Psy, ktoré pawmata NEMAJÚ, sa tu ako riadky NEVYPISUJÚ — sekcia rastie
    // s počtom ĽUDÍ, nie psov.
    body = (
      <div className="flex flex-col" style={{ gap: 12 }}>
        <p style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.6, color: T.inkWarm, margin: 0 }}>
          {tx('pack.mates.emptyBody', 'Bring one human into DOGYPT beside you. Give them access, let them look in — so they are in the picture too.')}
        </p>
        {err && <p style={{ fontFamily: FONT_UI, fontSize: 12, color: '#8E2A20', margin: 0 }}>{err}</p>}
        <button type="button" className="pws-cta" onClick={openInvite} disabled={freeDogs.length === 0}>
          <HandKey size={15} />
          {tx('pack.mates.emptyCta', 'Add a pack member')}
        </button>
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

        {people.map((p) => (
          <button key={p.user_id ?? 'p'} type="button" className="pws-row" style={{ ...PACK_BOX.row, cursor: 'pointer' }} onClick={() => openPerson(p)}>
            <Avatar url={p.avatar_url} label={p.name || p.email} />
            <span style={{ minWidth: 0, flex: 1 }}>
              {/* MENO ČLOVEKA = Cinzel, NIE Decorative. Decorative patrí PSOVI
                  (lock v CLAUDE.md, príznak `Participant.isDogName`).
                  ⚠️ Kým meno nemá (`pack_profiles.display_name` je prázdne, čo je
                  bežný stav), stojí tu E-MAIL — a ten do Cinzelu nepatrí: Cinzel má
                  len VERZÁLKY, takže z adresy spraví `MENO@DOMENA.COM`. Adresa je
                  ÚDAJ, teda Space Grotesk. */}
              <span style={p.name ? NAME_STYLE : ADDR_STYLE}>
                {p.name || p.email || tx('pack.mate.someone', 'Pawmate')}
              </span>
              <span className="flex" style={{ gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                {dogsInOrder(p).map((d) => (
                  <span key={d.dog_id} className="pws-chip">{d.dog_name || tx('pack.mate.unnamedDog', 'Your dog')}</span>
                ))}
              </span>
            </span>
            {/* 🔴 PILULKA HOVORÍ PRAVDU AJ VTEDY, KEĎ SA POSTAVENIA ROZCHÁDZAJÚ.
                `p.role` je postavenie pri NAPOSLEDY rozhodnutom psovi; vypísať ho
                ako fakt by v zozname tvrdilo „rodina" o niekom, kto je pri druhom
                psovi partner. Preto sa pri rozdiele píše „rôzne" — detail to
                rozpíše po psoch. */}
            <span style={PILL}>
              {sameRights(p.dogs) ? lb(ROLE_LABEL[p.role] ?? ROLE_LABEL.partner) : tx('pack.mates.roleMixed', 'Mixed')}
            </span>
          </button>
        ))}

        {invites.map((iv) => (
          <div key={iv.email ?? 'i'} className="flex flex-col" style={{ ...PACK_BOX.row, gap: 8, padding: '11px 12px' }}>
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
                <span className="flex" style={{ gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                  {dogsInOrder(iv).map((d) => (
                    <span key={d.dog_id} className="pws-chip">{d.dog_name || tx('pack.mate.unnamedDog', 'Your dog')}</span>
                  ))}
                </span>
              </span>
            </div>
            {confirmKey === iv.email ? (
              <ConfirmRow
                question={tx('pack.mate.revokeAsk', 'Withdraw this invitation?')}
                yes={tx('pack.mate.revokeYes', 'Withdraw')}
                no={tx('pack.mate.cancel', 'Cancel')}
                busy={busy} onYes={() => withdraw(iv)} onNo={() => setConfirmKey(null)}
              />
            ) : (
              <div className="flex" style={{ gap: 7 }}>
                <button type="button" className="pws-btn pws-btn--danger" onClick={() => setConfirmKey(iv.email)}>
                  {tx('pack.mate.revoke', 'Withdraw the invitation')}
                </button>
              </div>
            )}
          </div>
        ))}

        {err && <p style={{ fontFamily: FONT_UI, fontSize: 12, color: '#8E2A20', margin: 0 }}>{err}</p>}

        {/* Koľko psov má ešte voľné miesto — jedna veta namiesto prázdnych riadkov
            pre každého psa bez pawmata. Sekcia rastie s počtom ĽUDÍ, nie psov. */}
        {freeDogs.length > 0 ? (
          <button type="button" className="pws-cta" onClick={openInvite} style={{ marginTop: 4 }}>
            <HandKey size={15} />
            {tx('pack.mates.inviteCta', 'Invite someone else')}
          </button>
        ) : (
          <p style={{ fontFamily: FONT_UI, fontSize: 11.5, lineHeight: 1.5, color: T.inkWarm, margin: '4px 0 0' }}>
            {tx('pack.mates.allTaken', 'Every one of your dogs has its place taken. Free one up and you can invite again.')}
          </p>
        )}
      </div>
    );
  }

  return (
    // Úroveň 1 MATRICE (KARTA) — sekcia stojí na stránke vedľa ostatných kariet
    // profilu, nie vnútri jednej z nich. ⚠️ Zadanie B6b §2.1 navrhovalo úroveň 2
    // (`PACK_BOX.subblock`); to je recept pre sekciu VNÚTRI karty a tu by vyrobil
    // tretiu hĺbku rámu na podklade stránky. Súrodenci (`PackNetwork`,
    // `PackSettings`) sú karty.
    <section
      id="pawmates"
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        boxShadow: T.cardShadow,
        padding: 26,
        scrollMarginTop: 90,
      }}
    >
      <style>{PF_FIELD_CSS}{CSS}</style>
      <div style={EYEBROW}>{tx('pack.mates.eyebrow', 'Pawmates')}</div>
      <h3 style={{
        fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 18, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: T.inkStrong, margin: '3px 0 0',
      }}>
        {tx('pack.mates.title', 'Your people')}
      </h3>
      <div aria-hidden style={{ height: 2, background: T.rule, margin: '14px 0 16px' }} />
      {body}
    </section>
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
      <button type="button" className="pws-btn pws-btn--danger" onClick={onYes} disabled={busy} style={{ borderColor: '#B25640', color: '#8E2A20' }}>
        {yes}
      </button>
      <button type="button" className="pws-btn" onClick={onNo} disabled={busy}>{no}</button>
    </div>
  );
}
