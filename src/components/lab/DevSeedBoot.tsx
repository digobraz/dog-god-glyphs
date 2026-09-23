import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { readDevSeed } from '@/lib/devSeed';
import { openPhotoConfirm } from '@/components/gods/photoConfirm';
import { setFlowSkin } from '@/components/screens/flowRedress';

// ════════════════════════════════════════════════════════════════════════════
// DRUHÁ POLOVICA SEEDU — čo sa dá spraviť až po renderi (23. 9. 2026)
//
// Dáta do store nalieva `lib/devSeedApply.ts` ešte PRED prvým renderom (inak by
// obrazovky štartovali s prázdnymi poľami — pozri tamojší komentár). Sem patrí
// len to, čo potrebuje hotový DOM a router: otvorenie popupu a šat vstupu.
//
// Visí v `App.tsx` za `import.meta.env.DEV` nad routami, takže beží v KAŽDOM
// dokumente appky — teda aj v ráme, ktorý dielňa otvorí.
//
// ⚠️ SEED SA NEMAŽE. Refresh rámu (a je ho pri ladení treba) musí skončiť v tej
//    istej polohe, inak guard odhodí Mateja na prvý krok a vyzerá to ako chyba
//    flow. Maže ho výhradne dielňa tlačidlom „vyčistiť".
// ════════════════════════════════════════════════════════════════════════════

export function DevSeedBoot() {
  const done = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Raz za život dokumentu: seed je ŠTARTOVACIA POLOHA, nie stav. Druhé
    // spustenie by prepísalo to, čo Matej v ráme práve naklikal.
    if (done.current) return;
    const seed = readDevSeed();
    if (!seed) return;
    done.current = true;

    // Nový vstup je bledý (`flowRedress`). Seedom prichádza celý, aj so šatom —
    // inak by rám vyzeral čierny a rozdiel by sa pripísal obrazovke.
    setFlowSkin('pale');

    if (seed.popup === 'photo') {
      // Tá istá karta, akú dostane človek na stene (`GodsGridLab.tsx`,
      // `showConfirm`) — vrátane CTA na meno. Výber súboru sa tu neotvára,
      // fotka prichádza zo seedu.
      openPhotoConfirm({
        photoUrl: seed.photoUrl,
        packNumber: seed.packNumber,
        onContinue: () => navigate('/heroglyph/name'),
        onPickAnother: () => { /* v dielni sa fotka mení hore v paneli */ },
      });
    }
    // 🚩 `popup === 'crop'` zatiaľ nemá čo otvoriť — popup s auto-výrezom sa
    //    ešte stavia. Do tej doby dielňa na tom riadku otvára starú obrazovku
    //    `/heroglyph/crop`, aby bolo vidno, z čoho sa vychádza.
  }, [navigate]);

  return null;
}
