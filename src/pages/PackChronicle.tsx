// ════════════════════════════════════════════════════════════════════════════
// KRONIKA — `/pack/dogs/chronicle`. Denník + galéria na JEDNOM mieste (8. 10. 2026).
//
// Matej nad nákresom `plany/nakres-dogs-konsolidacia-2026-10-08.html`:
// *„denník musí mať svoj vlastný dashboard, kde vidí prehľadne svoje zápisky — taká
// kronika s možnosťou zápisu v hlasovke… pri viacerých psoch možnosť vybrať jedného
// alebo všetkých"* · *„denník zlúčiť s galériou, pretože sa tam bude ukladať aj foto"*.
// Podnet: testerka Daniela nevidela, čo už zapísala.
//
// ⚠️ KÔŠ 2 „POZERÁM SA" (lock `architektura-pack.md` §3) — čítanie, lišta ostáva,
//    hore šípka späť. Písanie je formulár `DiaryEntry` NAD stránkou (prekryv), takže
//    zápis človeka z kroniky neodnesie (§4.2).
// ⚠️ ŽIADNE NOVÉ ÚLOŽISKO — `dog_events` cez `useDiaryRows`. Galéria = zápisy s fotkou.
// ✍️ JEDINÉ CTA = NAPÍSAŤ (Matej 8. 10.: „bez CTA photo — iba write"). Fotka je príloha
//    vo formulári zápisu. Formulár je široký 640 px (`.dia-pop--write`).
// 🟡 HLASOVKA S PREPISOM je schválená, ale je to DRUHÝ krok (úložisko zvuku + prepis
//    sa platí za minútu — cena sa Matejovi ukáže pred stavbou). Filter „Hlasovky"
//    preto ešte nie je: filter bez jediného možného zápisu by klamal.
// ════════════════════════════════════════════════════════════════════════════
import { canStepBack } from '@/lib/stepBack';
import { useNavigate } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME, PACK_BOX, PACK_HEAD, PACK_SPACE } from '@/components/pack/packTheme';
import { ChronicleBody } from '@/components/pack/diary/ChronicleBody';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
type Tx = (key: string, fallback: string) => string;

export default function PackChronicle() {
  const t = useT();
  const tx: Tx = (key, fallback) => { const v = t(key); return v === key ? fallback : v; };
  const navigate = useNavigate();
  const back = () => { if (canStepBack()) navigate(-1); else navigate('/pack/dogs'); };

  return (
    <PackLayout onBack={back} backLabel={tx('pack.chronicle.back', 'Back')}>
      <section style={{ ...PACK_BOX.card, padding: PACK_SPACE.xl }}>
        {/* Šípka späť je v spoločnej hlavičke (PackTopRow), nie v karte — Matej 28. 10. 2026. */}
        <h1 style={{ ...PACK_HEAD.card, color: T.inkStrong, margin: `0 0 ${PACK_SPACE.lg}px` }}>{tx('pack.chronicle.title', 'Chronicle')}</h1>
        <ChronicleBody tx={tx} />
      </section>
    </PackLayout>
  );
}
