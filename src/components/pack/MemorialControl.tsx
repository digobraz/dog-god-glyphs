import { useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DateDropdowns } from '@/components/DateDropdowns';
import { PACK_THEME } from '@/components/pack/packTheme';

const T = PACK_THEME;

// ── MemorialControl ──────────────────────────────────────────────────────────
// Self-service (V4) — majiteľ (query je gated na user_id, takže kto vidí profil,
// ten psa vlastní) môže:
//   • označiť živého psa ako anjela (s kontrolnou otázkou "Si si istý? — Áno")
//   • doplniť / upraviť dátum úmrtia u psa už označeného ako deceased
// Zápis: dogs.life_status = 'deceased' + dogs.death_date (yyyy-mm-dd).
// Zobrazenie dvoch počítadiel rieši PackDogDetail (V3) — tento komponent len edituje.

type Mode = 'idle' | 'confirm' | 'date';

interface Props {
  dogId: string;
  dogName: string;
  isDeceased: boolean;
  deathDate: string | null;   // yyyy-mm-dd alebo null
  birthYear: number | null;
  poss: string;               // his / her / their (pre EN copy)
  onSaved: (deathISO: string) => void;
}

export function MemorialControl({ dogId, dogName, isDeceased, deathDate, birthYear, poss, onSaved }: Props) {
  const t = useT();
  const { toast } = useToast();
  const now = new Date();

  const [mode, setMode] = useState<Mode>('idle');
  const [saving, setSaving] = useState(false);

  // Predvyplniť picker existujúcim dátumom (edit) alebo dneškom (nový).
  const init = deathDate ? new Date(deathDate) : now;
  const [d, setD] = useState(init.getDate());
  const [m, setM] = useState(init.getMonth() + 1);
  const [y, setY] = useState(init.getFullYear());

  const minYear = birthYear && birthYear >= 1990 ? birthYear : 1990;

  const save = async () => {
    setSaving(true);
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    try {
      const { error } = await (supabase as unknown as {
        from: (table: string) => {
          update: (vals: Record<string, unknown>) => {
            eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
          };
        };
      })
        .from('dogs')
        .update({ life_status: 'deceased', death_date: iso })
        .eq('id', dogId);
      if (error) throw new Error(error.message);
      toast({ title: t('pack.dog.toastSaved') });
      onSaved(iso);
      setMode('idle');
    } catch (err) {
      toast({
        title: t('pack.dog.toastCouldNotSave'),
        description: err instanceof Error ? err.message : '',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const linkStyle: React.CSSProperties = {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: T.inkDim,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    padding: '4px 6px',
  };

  const primaryBtn: React.CSSProperties = {
    padding: '8px 18px',
    borderRadius: 999,
    background: 'linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%)',
    color: '#3d1f00',
    fontFamily: "'Cinzel', serif",
    fontSize: 13,
    fontWeight: 700,
    border: 'none',
    cursor: saving ? 'default' : 'pointer',
    opacity: saving ? 0.6 : 1,
  };

  const ghostBtn: React.CSSProperties = {
    ...primaryBtn,
    background: 'transparent',
    color: T.inkDim,
    border: `1px solid ${T.hairline}`,
  };

  // ── DATE picker (doplniť / upraviť dátum úmrtia) ──
  if (mode === 'date') {
    return (
      <div className="w-full flex flex-col items-center gap-3" style={{ marginTop: 12, maxWidth: 340 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.ink, textAlign: 'center' }}>
          {t('pack.dog.memorial.datePrompt', { name: dogName })}
        </div>
        <DateDropdowns
          day={d}
          month={m}
          year={y}
          minYear={minYear}
          maxYear={now.getFullYear()}
          maxDate={now}
          onChange={(nd, nm, ny) => { setD(nd); setM(nm); setY(ny); }}
        />
        <div className="flex items-center gap-2">
          <button type="button" style={ghostBtn} disabled={saving} onClick={() => setMode('idle')}>
            {t('pack.dog.memorial.cancel')}
          </button>
          <button type="button" style={primaryBtn} disabled={saving} onClick={() => void save()}>
            {t('pack.dog.memorial.save')}
          </button>
        </div>
      </div>
    );
  }

  // ── CONFIRM ("Si si istý? — Áno") ──
  if (mode === 'confirm') {
    return (
      <div className="w-full flex flex-col items-center gap-2.5" style={{ marginTop: 12, maxWidth: 340 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: T.ink }}>
          {t('pack.dog.memorial.confirmTitle')}
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: T.inkDim, textAlign: 'center', lineHeight: 1.4 }}>
          {t('pack.dog.memorial.confirmBody', { name: dogName })}
        </div>
        <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
          <button type="button" style={ghostBtn} onClick={() => setMode('idle')}>
            {t('pack.dog.memorial.cancel')}
          </button>
          <button type="button" style={primaryBtn} onClick={() => setMode('date')}>
            {t('pack.dog.memorial.confirmYes')}
          </button>
        </div>
      </div>
    );
  }

  // ── IDLE ──
  // Deceased bez dátumu → výzva doplniť (kľúčové pre psy zapísané pred FIX9).
  if (isDeceased && !deathDate) {
    return (
      <button type="button" style={{ ...linkStyle, color: T.accentGold }} onClick={() => setMode('date')}>
        🕊 {t('pack.dog.memorial.addDate', { name: dogName })}
      </button>
    );
  }
  // Deceased s dátumom → decentná možnosť upraviť.
  if (isDeceased && deathDate) {
    return (
      <button type="button" style={linkStyle} onClick={() => setMode('date')}>
        {t('pack.dog.memorial.editDate')}
      </button>
    );
  }
  // Alive → decentná možnosť označiť ako anjela.
  return (
    <button type="button" style={linkStyle} onClick={() => setMode('confirm')}>
      🕊 {t('pack.dog.memorial.markLink')}
    </button>
  );
}
