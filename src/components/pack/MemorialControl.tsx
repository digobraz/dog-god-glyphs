import { useEffect, useState } from 'react';
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
//
// FIX9 polish: akcia sa už nespúšťa inline na prednej strane profilu (morbídne
// pri živom psovi) — trigger žije v Documents paneli (PackDogDetail), tento
// komponent je odteraz ČISTO modal, otváraný/riadený zvonku cez `open` +
// `initialStep`. Zobrazenie dvoch počítadiel rieši PackDogDetail (V3).

type Step = 'confirm' | 'date';

interface Props {
  dogId: string;
  dogName: string;
  isDeceased: boolean;
  deathDate: string | null;   // yyyy-mm-dd alebo null
  birthYear: number | null;
  poss: string;               // his / her / their (pre EN copy)
  open: boolean;
  initialStep: Step;
  onClose: () => void;
  onSaved: (deathISO: string) => void;
}

export function MemorialControl({ dogId, dogName, isDeceased, deathDate, birthYear, poss, open, initialStep, onClose, onSaved }: Props) {
  const t = useT();
  const { toast } = useToast();
  const now = new Date();

  const [step, setStep] = useState<Step>(initialStep);
  const [saving, setSaving] = useState(false);

  const init = deathDate ? new Date(deathDate) : now;
  const [d, setD] = useState(init.getDate());
  const [m, setM] = useState(init.getMonth() + 1);
  const [y, setY] = useState(init.getFullYear());

  // Zakaždým keď sa modal otvorí, nastav krok podľa triggeru a predvyplň picker
  // existujúcim dátumom (edit) alebo dneškom (nový záznam).
  useEffect(() => {
    if (!open) return;
    setStep(initialStep);
    const seed = deathDate ? new Date(deathDate) : new Date();
    setD(seed.getDate());
    setM(seed.getMonth() + 1);
    setY(seed.getFullYear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialStep, deathDate]);

  if (!open) return null;

  const minYear = birthYear && birthYear >= 1990 ? birthYear : 1990;

  const save = async () => {
    setSaving(true);
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await (supabase as unknown as {
        from: (table: string) => {
          update: (vals: Record<string, unknown>) => {
            eq: (col: string, val: string) => {
              eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
            };
          };
        };
      })
        .from('dogs')
        .update({ life_status: 'deceased', death_date: iso })
        .eq('id', dogId)
        .eq('user_id', user.id);
      if (error) throw new Error(error.message);
      toast({ title: t('pack.dog.toastSaved') });
      onSaved(iso);
      onClose();
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

  const primaryBtn: React.CSSProperties = {
    padding: '9px 20px',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
    border: '1px solid rgba(250, 244, 236, 0.30)',
    color: '#3d1f00',
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontWeight: 700,
    cursor: saving ? 'default' : 'pointer',
    opacity: saving ? 0.6 : 1,
    boxShadow: '0 8px 20px -8px rgba(201, 154, 63, 0.65)',
  };

  const ghostBtn: React.CSSProperties = {
    padding: '9px 18px',
    borderRadius: 10,
    background: 'transparent',
    border: `1px solid ${T.border}`,
    color: T.inkDim,
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: saving ? 'default' : 'pointer',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 50, background: 'rgba(10,8,20,0.72)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `linear-gradient(180deg, ${T.card} 0%, ${T.cardSoft} 100%)`,
          border: `1px solid rgba(201, 154, 63, 0.40)`,
          borderRadius: 20,
          padding: '28px 26px',
          maxWidth: 360,
          width: '90vw',
          boxShadow: '0 28px 60px -18px rgba(20,8,40,0.6)',
        }}
      >
        {step === 'confirm' ? (
          <>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', color: T.ink, marginBottom: 10 }}>
              {t('pack.dog.memorial.confirmTitle')}
            </h3>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, lineHeight: 1.5, color: T.inkDim, marginBottom: 22 }}>
              {t('pack.dog.memorial.confirmBody', { name: dogName })}
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button type="button" style={ghostBtn} onClick={onClose}>
                {t('pack.dog.memorial.cancel')}
              </button>
              <button type="button" style={primaryBtn} onClick={() => setStep('date')}>
                {t('pack.dog.memorial.confirmYes')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', color: T.ink, marginBottom: 16, textAlign: 'center' }}>
              {t('pack.dog.memorial.datePrompt', { name: dogName })}
            </h3>
            <div className="flex justify-center" style={{ marginBottom: 22 }}>
              <DateDropdowns
                day={d}
                month={m}
                year={y}
                minYear={minYear}
                maxYear={now.getFullYear()}
                maxDate={now}
                onChange={(nd, nm, ny) => { setD(nd); setM(nm); setY(ny); }}
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button type="button" style={ghostBtn} disabled={saving} onClick={onClose}>
                {t('pack.dog.memorial.cancel')}
              </button>
              <button type="button" style={primaryBtn} disabled={saving} onClick={() => void save()}>
                {t('pack.dog.memorial.save')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
