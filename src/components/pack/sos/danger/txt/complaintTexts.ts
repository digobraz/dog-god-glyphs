// Texty „Nahlásiť nebezpečenstvo“ — časť complaint (en · sk · cs). Lokálne `T`, bez importu zo sosTexts (žiadny kruh).
// sosTexts.ts ich rozprestrie do SOS_TEXTS → gen-sos-i18n.mjs → locales. Dlhá pomlčka v copy NIE.
type Tx = { en: string; sk: string; cs: string };
const T = (en: string, sk: string, cs: string): Tx => ({ en, sk, cs });

export const DANGER_COMPLAINT_TEXTS = {
} as const satisfies Record<string, Tx>;
