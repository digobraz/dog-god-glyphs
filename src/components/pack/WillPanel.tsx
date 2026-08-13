// ZÁVET — panel na doklade DOG ID (`/pack/dogs/:id`).
//
// Zadanie (Matej 13.8.2026): „vymyslime aj mechanizmus závetu. po kliku sa zobrazí
// správa o psíkovi, odkaz novému majiteľovi, ktorý sa uloží, a s emailami — a všetko
// sa to uloží, prípadne sa to môže odoslať."
//
// PREČO PANEL A NIE KVÍZ. Zvyšok dokladu sa vypĺňa kvízom — jedna otázka na obrazovku,
// aby sa 34 polí dalo prejsť bez únavy. Závet je opak: je to JEDEN list a človek ho
// píše naraz, s adresátom aj textom pred očami. Rozsekať ho na štyri obrazovky by z
// vážnej veci urobilo formulár. Preto `PassGroup.editPanel = 'will'` a tento súbor.
//
// KAM SA UKLADÁ. Do toho istého append-only logu `dog_events` ako všetko ostatné
// (`will.heirName` · `will.heirEmail` · `will.heirEmail2` · `will.letter`), takže
// doklad ho vykreslí sám a história sa nikdy neprepíše. Žiadna nová tabuľka.
//
// ⚠️ SÚKROMIE. Všetky štyri kroky majú v katalógu `views: []` — závet nie je v žiadnom
// zdieľanom pohľade. Veterinár ani opatrovateľ ho neuvidia ani omylom; vidí ho len
// majiteľ (pohľad `full`) a adresát, ktorému ho pošle.
import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Loader2, Save, Send, Check } from 'lucide-react';
import { PACK_THEME, PACK_BOX, PF_FIELD_CSS, FONT_TITLE, FONT_UI } from './packTheme';
import { appendDogEvents, readLatest, type LatestValue } from '@/lib/dogEvents';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE } from '@/lib/env';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const LETTER_MAX = 2000;

/** Striedma kontrola tvaru — nie validácia doručiteľnosti, tú spraví až odoslanie. */
function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

function str(v: LatestValue | undefined): string {
  return typeof v?.value === 'string' ? v.value : '';
}

export function WillPanel({
  dogId, dogName, onClose,
}: {
  dogId: string;
  dogName: string;
  onClose: () => void;
}) {
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };

  // Panel si doťahuje uložený závet SÁM. Alternatíva (podať `latest` propom z karty) by
  // znamenala držať tú istú mapu na dvoch miestach — doklad ju už má vo svojom stave.
  const [latest, setLatest] = useState<Record<string, LatestValue> | null>(null);
  const [heirName, setHeirName] = useState('');
  const [heirEmail, setHeirEmail] = useState('');
  const [heirEmail2, setHeirEmail2] = useState('');
  const [letter, setLetter] = useState('');

  useEffect(() => {
    let alive = true;
    readLatest(dogId).then((r) => {
      if (!alive) return;
      setLatest(r);
      setHeirName(str(r['will.heirName']));
      setHeirEmail(str(r['will.heirEmail']));
      setHeirEmail2(str(r['will.heirEmail2']));
      setLetter(str(r['will.letter']));
    });
    return () => { alive = false; };
  }, [dogId]);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendStep, setSendStep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const letterRef = useRef<HTMLTextAreaElement | null>(null);

  // Escape zatvára — panel prekrýva celý doklad, takže musí ísť zavrieť aj bez myši.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Kým sa uložený závet nenačíta, NIČ nie je zmenené — inak by prázdny formulár
  // vyzeral ako rozpísaná zmena a „Uložiť" by prepísalo závet prázdnymi hodnotami.
  const dirty = !!latest && (
    heirName !== str(latest['will.heirName']) ||
    heirEmail !== str(latest['will.heirEmail']) ||
    heirEmail2 !== str(latest['will.heirEmail2']) ||
    letter !== str(latest['will.letter'])
  );

  // Odoslať sa dá len to, čo je ULOŽENÉ a úplné. Poloprázdny závet nemá komu prísť.
  const emailOk = looksLikeEmail(heirEmail);
  const email2Ok = !heirEmail2.trim() || looksLikeEmail(heirEmail2);
  const complete = !!heirName.trim() && emailOk && email2Ok && !!letter.trim();
  const canSend = complete && !dirty && !sending;

  const save = async () => {
    if (saving || !dirty) return;
    setSaving(true);
    setError(null);
    try {
      // Append-only: uložíme všetky štyri naraz, aby sa v histórii dali čítať ako
      // jedna verzia závetu, nie ako štyri nesúvisiace zmeny.
      await appendDogEvents([
        { dogId, field: 'will.heirName', value: heirName.trim() || null, source: 'profile' },
        { dogId, field: 'will.heirEmail', value: heirEmail.trim() || null, source: 'profile' },
        { dogId, field: 'will.heirEmail2', value: heirEmail2.trim() || null, source: 'profile' },
        { dogId, field: 'will.letter', value: letter.trim() || null, source: 'profile' },
      ]);
      // Po uložení sa mapa musí obnoviť, inak `dirty` ostane true a odoslanie
      // (ktoré vyžaduje uložený stav) by sa nikdy neodomklo.
      setLatest(await readLatest(dogId));
      setSavedAt(true);
      window.setTimeout(() => setSavedAt(false), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      // Posiela sa LEN `dogId`. Text ani adresáti nejdú po drôte — edge funkcia si ich
      // dotiahne z `dog_events` service-rolom a overí, že volajúci je majiteľ psa.
      // Ten istý vzor ako `notify-report`: inak by sa dal cez túto cestu poslať
      // ľubovoľný text na ľubovoľnú adresu, čiže by z toho bol spamovací nástroj.
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error(tx('pack.will.errAuth', 'Sign in again, please.'));
      const res = await fetch(`${EDGE_BASE}/send-will`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dogId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setSendStep(false);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  };

  const remaining = LETTER_MAX - letter.length;

  const label = useMemo(
    () => ({
      heir: tx('pack.will.heir', 'Who takes them'),
      email: tx('pack.will.email', 'Their e-mail'),
      email2: tx('pack.will.email2', 'Second e-mail'),
      letter: tx('pack.will.letter', 'Your message to them'),
    }),
    [t], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 60, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', padding: 16 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          // Úroveň 4 MATRICE (`PACK_BOX.panel`) — plávajúci panel nad stránkou.
          ...PACK_BOX.panel,
          padding: '22px 20px',
          width: '100%',
          maxWidth: 480,
          maxHeight: '86vh',
          overflowY: 'auto',
          color: T.ink,
        }}
      >
        <style>{PF_FIELD_CSS}</style>

        <div className="flex items-start justify-between" style={{ gap: 12, marginBottom: 4 }}>
          <div>
            <div
              style={{
                fontFamily: FONT_UI, fontWeight: 500, fontSize: 10, letterSpacing: '0.26em',
                textTransform: 'uppercase', color: T.cardEdge,
              }}
            >
              {tx('pack.will.eyebrow', 'Will')}
            </div>
            <h3
              style={{
                fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 19, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: T.inkStrong, margin: '3px 0 0',
              }}
            >
              {tx('pack.will.title', 'If you are not here')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tx('pack.will.close', 'Close')}
            className="inline-flex items-center justify-center shrink-0"
            style={{
              width: 28, height: 28, borderRadius: 10, background: T.tileBg,
              border: `1px solid ${T.border}`, color: T.ink, cursor: 'pointer',
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <p style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.55, color: T.inkWarm, margin: '10px 0 16px' }}>
          {tx('pack.will.intro', 'Everything in this card is already the handover. This is the part only they get: who takes over, and what you want them to know.')}
        </p>

        <div className="flex flex-col" style={{ gap: 12 }}>
          <Field label={label.heir}>
            <input
              className="pf-field pf-field--flat"
              value={heirName}
              onChange={(e) => setHeirName(e.target.value.slice(0, 120))}
              placeholder={tx('pack.will.heirPh', 'Name and how you know them')}
              style={fieldStyle}
            />
          </Field>

          <Field label={label.email}>
            <input
              className="pf-field pf-field--flat"
              value={heirEmail}
              onChange={(e) => setHeirEmail(e.target.value.slice(0, 160))}
              placeholder="meno@email.sk"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              style={fieldStyle}
            />
          </Field>

          <Field
            label={label.email2}
            hint={tx('pack.will.email2Hint', 'A will that can only reach one address fails when that address dies.')}
          >
            <input
              className="pf-field pf-field--flat"
              value={heirEmail2}
              onChange={(e) => setHeirEmail2(e.target.value.slice(0, 160))}
              placeholder={tx('pack.will.optional', 'optional')}
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              style={fieldStyle}
            />
          </Field>

          <Field label={label.letter}>
            <textarea
              ref={letterRef}
              className="pf-field pf-field--flat"
              value={letter}
              onChange={(e) => setLetter(e.target.value.slice(0, LETTER_MAX))}
              rows={7}
              placeholder={tx('pack.will.letterPh', 'What they need to know about {name} that no field can hold.').replace('{name}', dogName)}
              style={{ ...fieldStyle, minHeight: 132, lineHeight: 1.55, resize: 'vertical' }}
            />
            <div
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9.5,
                color: remaining < 100 ? T.alertRed : T.inkFaint, textAlign: 'right', marginTop: 4,
              }}
            >
              {letter.length}/{LETTER_MAX}
            </div>
          </Field>
        </div>

        {error && (
          <p style={{ fontFamily: FONT_UI, fontSize: 12, color: T.alertRed, margin: '12px 0 0' }}>
            {error}
          </p>
        )}

        {/* Odoslanie je druhý krok, nie druhé tlačidlo vedľa uloženia. Závet odchádza
            cudziemu človeku a späť sa vziať nedá — jeden klik na to nestačí. */}
        {sendStep ? (
          <div style={{ ...PACK_BOX.row, padding: '12px 13px', marginTop: 16 }}>
            <p style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.5, color: T.inkStrong, margin: 0 }}>
              {tx('pack.will.confirm', 'Send this to {who} now? They will receive the message and the card.')
                .replace('{who}', [heirEmail, heirEmail2].filter(Boolean).join(', '))}
            </p>
            <div className="flex items-center justify-end" style={{ gap: 10, marginTop: 12 }}>
              <button type="button" className="pass-noteadd" onClick={() => setSendStep(false)} disabled={sending}>
                {tx('pack.will.cancel', 'cancel')}
              </button>
              <button
                type="button"
                className="pk-pill pk-pill--gold pk-pill--tap inline-flex items-center gap-2"
                onClick={send}
                disabled={sending}
                style={{ fontFamily: FONT_TITLE, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}
              >
                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {tx('pack.will.sendNow', 'Send')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between" style={{ gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="pk-pill pk-pill--tap inline-flex items-center gap-2"
              onClick={() => setSendStep(true)}
              disabled={!canSend}
              title={
                !complete
                  ? tx('pack.will.needAll', 'Fill in the successor, a valid e-mail and the message first.')
                  : dirty
                    ? tx('pack.will.saveFirst', 'Save your changes first.')
                    : undefined
              }
              style={{
                fontFamily: FONT_TITLE, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                textTransform: 'uppercase', opacity: canSend ? 1 : 0.45,
                cursor: canSend ? 'pointer' : 'default',
              }}
            >
              <Send className="h-3.5 w-3.5" />
              {tx('pack.will.send', 'Send it')}
            </button>

            <button
              type="button"
              className="pk-pill pk-pill--gold pk-pill--tap inline-flex items-center gap-2"
              onClick={save}
              disabled={!dirty || saving}
              style={{
                fontFamily: FONT_TITLE, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                textTransform: 'uppercase', opacity: dirty || savedAt ? 1 : 0.45,
                cursor: dirty ? 'pointer' : 'default',
              }}
            >
              {saving
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : savedAt ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {saving
                ? tx('pack.will.saving', 'Saving…')
                : savedAt ? tx('pack.will.saved', 'Saved') : tx('pack.will.save', 'Save')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  padding: '9px 11px',
  fontFamily: FONT_UI,
  fontSize: 13,
  color: T.inkStrong,
  outline: 'none',
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col" style={{ gap: 5 }}>
      <span
        style={{
          fontFamily: FONT_UI, fontWeight: 500, fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: T.inkWarm,
        }}
      >
        {label}
      </span>
      {children}
      {hint && (
        <span style={{ fontFamily: FONT_UI, fontSize: 11, lineHeight: 1.45, color: T.inkFaint }}>
          {hint}
        </span>
      )}
    </label>
  );
}
