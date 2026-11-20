// `/pack/sos/tyranie` — NAHLÁSIŤ TÝRANIE (Matej 20. 11. 2026: „presný postup s číslami na zavolanie na jeden klik! nebudme ľahostajní“).
// Postup a čísla overené 20. 11. 2026: polícia 158 (SK aj CZ), tiesňová 112, mestská polícia SK 159 / CZ 156,
// úradný veterinár = RVPS (svps.sk/rvps, 40 regionálnych správ) · KVS SVS (svs.gov.cz, podľa kraja).
// Zásada „zdokumentuj, oznám, nezverejňuj“ podľa CNN Prima News (CZ) a letáku MZe o ochrane zvierat.
// Texty sú dáta obrazovky ako pri prvej pomoci (aidSk/aidCs/aidEn) — SK, CS, ostatné jazyky EN s 112.
import { PACK_THEME as T, PACK_R, PACK_SPACE as S, PACK_TEXT } from '@/components/pack/packTheme';
import { useLang } from '@/i18n/LanguageContext';
import { openExternal } from '@/lib/appLinks';
import { useBack, useSosT } from './sosShared';
import { SosTaskShell } from './SosTaskShell';

type Call = { tel: string; label: string; red?: boolean };
type Txt = { title: string; lead: string; steps: string[]; calls: Call[]; vet: { label: string; url: string } | null; never: string };

const TXT: Record<'sk' | 'cs' | 'en', Txt> = {
  sk: {
    title: 'Nahlásiť týranie',
    lead: 'Nebuď ľahostajný. Týranie zvieraťa je trestný čin a nahlásiť ho môže každý.',
    steps: [
      'Zviera trpí práve teraz? Volaj políciu. Povedz, kde si, čo vidíš a že ide o týranie zvieraťa.',
      'Zdokumentuj to: fotka, video, miesto, dátum a čas. Zapíš si, kto to robí, ak to vieš.',
      'Nie je to akútne? Podaj podnet úradnému veterinárovi (RVPS) v okrese, kde sa to deje. Pošli mu fotky a popis.',
      'Zapamätaj si, komu a kedy si to nahlásil. Ak sa nič nedeje, ozvi sa znova.',
    ],
    calls: [
      { tel: '158', label: 'Polícia', red: true },
      { tel: '112', label: 'Tiesňová linka', red: true },
      { tel: '159', label: 'Mestská polícia' },
    ],
    vet: { label: 'Nájdi svoju RVPS', url: 'https://svps.sk/rvps/' },
    never: 'Nevstupuj na cudzí pozemok a nehádaj sa s majiteľom. Kým to nenahlásiš, nezverejňuj to na sieťach, varoval by si ho.',
  },
  cs: {
    title: 'Nahlásit týrání',
    lead: 'Nebuď lhostejný. Týrání zvířete je trestný čin a nahlásit ho může každý.',
    steps: [
      'Zvíře trpí právě teď? Volej policii. Řekni, kde jsi, co vidíš a že jde o týrání zvířete.',
      'Zdokumentuj to: fotka, video, místo, datum a čas. Zapiš si, kdo to dělá, pokud to víš.',
      'Není to akutní? Podej podnět krajské veterinární správě (KVS) v kraji, kde se to děje. Pošli jí fotky a popis.',
      'Zapamatuj si, komu a kdy jsi to nahlásil. Pokud se nic neděje, ozvi se znovu.',
    ],
    calls: [
      { tel: '158', label: 'Policie', red: true },
      { tel: '112', label: 'Tísňová linka', red: true },
      { tel: '156', label: 'Městská policie' },
    ],
    vet: { label: 'Najdi svou KVS', url: 'https://svs.gov.cz/statni-veterinarni-sprava/organizacni-utvary-statni-veterinarni-spravy/' },
    never: 'Nevstupuj na cizí pozemek a nehádej se s majitelem. Dokud to nenahlásíš, nezveřejňuj to na sítích, varoval bys ho.',
  },
  en: {
    title: 'Report abuse',
    lead: 'Do not look away. Animal cruelty is a crime and anyone can report it.',
    steps: [
      'Is the animal suffering right now? Call the emergency line. Say where you are, what you see and that it is animal cruelty.',
      'Document it: photo, video, place, date and time. Write down who is doing it, if you know.',
      'Not urgent? Report it to the official veterinary authority or animal welfare inspector where it is happening. Send photos and a description.',
      'Note whom you told and when. If nothing happens, follow up.',
    ],
    calls: [{ tel: '112', label: 'Emergency', red: true }],
    vet: null,
    never: 'Do not enter private property or confront the owner. Until you have reported it, do not post it online, it would warn them.',
  },
};

const CSS = `
.abu-lead{margin:0;font-size:${PACK_TEXT.lead}px;font-weight:500;line-height:1.4;color:${T.inkStrong};}
.abu-calls{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:${S.sm}px;}
.abu-calls .sos-cta{flex-direction:column;gap:${S.xs}px;min-height:72px;padding:${S.sm}px;text-decoration:none;}
.abu-calls .sos-cta b{font-size:${PACK_TEXT.h2}px;line-height:1;}
.abu-calls .sos-cta span{font-size:${PACK_TEXT.label}px;line-height:1.2;text-align:center;}
.abu-steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:${S.md}px;counter-reset:abu;}
.abu-steps li{display:grid;grid-template-columns:32px 1fr;gap:${S.md}px;align-items:start;font-size:${PACK_TEXT.body}px;line-height:1.45;color:${T.inkStrong};counter-increment:abu;}
.abu-steps li::before{content:counter(abu);display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:${PACK_R.pill}px;border:2px solid ${T.inkStrong};font-weight:600;}
.abu-never{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.45;font-weight:500;color:${T.sosRedDark};}
`;

export default function PackSosAbuse() {
  const s = useSosT();
  const { lang } = useLang();
  const back = useBack('/pack');
  const x = TXT[lang === 'sk' || lang === 'cs' ? lang : 'en'];
  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <h1 className="sos-h2">{x.title}</h1>
      <p className="abu-lead">{x.lead}</p>
      <div className="abu-calls">
        {x.calls.map((c) => (
          <a key={c.tel} className={`sos-cta${c.red ? ' sos-cta--red' : ' sos-cta--ghost'}`} href={`tel:${c.tel}`}>
            <b>{c.tel}</b><span>{c.label}</span>
          </a>
        ))}
      </div>
      <ol className="abu-steps">
        {x.steps.map((t, i) => <li key={i}>{t}</li>)}
      </ol>
      {x.vet && <button type="button" className="sos-cta" onClick={() => openExternal(x.vet!.url)}>{x.vet.label}</button>}
      <p className="abu-never">{x.never}</p>
    </SosTaskShell>
  );
}
