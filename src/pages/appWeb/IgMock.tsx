/* Paródia Instagramu — každý pes má VLASTNÝ profil (Matej 6. 11.: tri psy jedného majiteľa, proti jednému
 *  psíčkarskému profilu v DOGYPTe). Tri „mobily" s rámom `phone.svg`, obsah zjednodušený: handle, avatar
 *  s IG kruhom, meno psa, 3 čísla, Follow, mriežka. Príspevky = kreslené mini psy (inline SVG, bez emoji,
 *  bez fotiek). Žiadne logo ani ikonky Instagramu okrem jednoduchého glyfu `IgIcon`. Texty z COPY3 `igN_*`. */
import type { ReactNode } from 'react';

type Kind = 'beagle' | 'dachshund' | 'husky';
type Scene = 'shades' | 'coffee' | 'ball' | 'sleep' | 'hat' | 'bone' | 'snow' | 'selfie' | 'car';
type Dog = { n: 1 | 2 | 3; handle: string; kind: Kind; fur: string; ear: string; mark: string; tiles: Scene[]; bg: string[] };

const DOGS: Dog[] = [
  { n: 1, handle: 'bella.the.beagle', kind: 'beagle', fur: '#F3E7D3', ear: '#9A5B2E', mark: '#C98A4B',
    tiles: ['shades', 'coffee', 'ball', 'sleep', 'hat', 'bone', 'snow', 'selfie', 'car'],
    bg: ['#FFE08A', '#FDEBD0', '#C9F0D2', '#25305E', '#FFC6E0', '#BDEBF0', '#D6E8FF', '#FFD3B0', '#A8D8FF'] },
  { n: 2, handle: 'max.the.dachshund', kind: 'dachshund', fur: '#8A4B22', ear: '#6A3516', mark: '#B8763F',
    tiles: ['bone', 'shades', 'selfie', 'coffee', 'sleep', 'car', 'hat', 'ball', 'snow'],
    bg: ['#C9F0D2', '#FFD6A5', '#E4D4FF', '#FDEBD0', '#2B3A67', '#A8D8FF', '#FFC6E0', '#FFF1A8', '#D6E8FF'] },
  { n: 3, handle: 'luna.the.husky', kind: 'husky', fur: '#6F7C8E', ear: '#566273', mark: '#FFFFFF',
    tiles: ['snow', 'selfie', 'shades', 'sleep', 'ball', 'hat', 'coffee', 'car', 'bone'],
    bg: ['#CFE6FF', '#FFD3E0', '#FFE79A', '#27345F', '#C9F0D2', '#E4D4FF', '#FDEBD0', '#A8D8FF', '#BDEBF0'] },
];

const INK = '#2a1608';

/* jeden pes v dlaždici 75×100: telo, uši, hlava, tvár podľa plemena + rekvizita podľa scény */
function DogTile({ d, scene }: { d: Dog; scene: Scene }) {
  const sleepy = scene === 'sleep';
  const dach = d.kind === 'dachshund';
  const body = dach
    ? <ellipse cx="40" cy="90" rx="33" ry="13" fill={d.fur} />
    : <ellipse cx="37" cy="90" rx="25" ry="19" fill={d.fur} />;
  const ears: ReactNode = d.kind === 'husky'
    ? <><path d="M15 22L12 52l20-12z" fill={d.ear} /><path d="M59 22l3 30-20-12z" fill={d.ear} /></>
    : <><ellipse cx="16" cy="52" rx="7" ry={dach ? 20 : 15} fill={d.ear} /><ellipse cx="58" cy="52" rx="7" ry={dach ? 20 : 15} fill={d.ear} /></>;
  const face: ReactNode = d.kind === 'husky'
    ? <><path d="M37 38c-9 4-9 12-9 16 0 8 4 13 9 13s9-5 9-13c0-4 0-12-9-16z" fill="#fff" /><path d="M20 40c4-8 12-10 17-6-5 3-8 8-8 14-4-2-8-4-9-8z" fill={d.ear} opacity=".35" /></>
    : d.kind === 'beagle'
      ? <path d="M33 34h8v10l4 12c0 6-4 10-8 10s-8-4-8-10l4-12z" fill="#fff" />
      : <ellipse cx="37" cy="58" rx="11" ry="9" fill={d.mark} />;
  return (
    <svg viewBox="0 0 75 100" aria-hidden="true">
      <rect width="75" height="100" fill={d.bg[d.tiles.indexOf(scene)]} />
      {scene === 'snow' && [[10, 14], [60, 10], [22, 30], [66, 40], [8, 60], [52, 24], [64, 68]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill="#fff" />)}
      {scene === 'car' && <><rect x="3" y="3" width="69" height="94" rx="6" fill="none" stroke={INK} strokeWidth="3" opacity=".7" /><path d="M6 20h14M4 34h10M60 14h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></>}
      {scene === 'sleep' && <><circle cx="60" cy="14" r="7" fill="#FFE58A" /><circle cx="64" cy="12" r="6" fill={d.bg[d.tiles.indexOf('sleep')]} /><text x="50" y="34" fill="#fff" fontSize="10" fontWeight="700" fontFamily="sans-serif">z z</text></>}
      {body}
      {ears}
      <ellipse cx="37" cy="50" rx="20" ry="18" fill={d.fur} />
      {face}
      {scene === 'snow' && <><rect x="14" y="66" width="46" height="8" rx="4" fill="#E8493F" /><rect x="40" y="66" width="7" height="20" rx="3" fill="#E8493F" /></>}
      {sleepy
        ? <><path d="M26 49q4 3 8 0M40 49q4 3 8 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" /></>
        : <><circle cx="29" cy="47" r="2.6" fill={INK} /><circle cx="45" cy="47" r="2.6" fill={INK} /></>}
      {scene === 'shades' && <><rect x="22" y="42" width="14" height="9" rx="4" fill={INK} /><rect x="38" y="42" width="14" height="9" rx="4" fill={INK} /><path d="M36 46h2" stroke={INK} strokeWidth="2" /></>}
      <ellipse cx="37" cy="57" rx="4.2" ry="3" fill={INK} />
      <path d="M32 62q5 4 10 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      {(scene === 'ball' || scene === 'car' || scene === 'selfie') && <path d="M34 62q3 9 6 0z" fill="#F0708C" />}
      {scene === 'hat' && <><path d="M37 8l-13 26h26z" fill="#7A2FBF" /><circle cx="37" cy="8" r="3.5" fill="#F5C73D" /><circle cx="33" cy="26" r="2" fill="#F5C73D" /><circle cx="42" cy="22" r="2" fill="#F5C73D" /></>}
      {scene === 'coffee' && <><path d="M44 74h18v10a9 9 0 0 1-9 9h0a9 9 0 0 1-9-9z" fill="#fff" stroke={INK} strokeWidth="2" /><path d="M62 77h3a4 4 0 0 1 0 8h-3" fill="none" stroke={INK} strokeWidth="2" /><path d="M49 70q-2-4 0-7M55 70q-2-4 0-7" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></>}
      {scene === 'ball' && <><circle cx="58" cy="84" r="9" fill="#C8E83A" stroke={INK} strokeWidth="1.5" /><path d="M50 80q8 4 16 0M50 88q8-4 16 0" fill="none" stroke="#fff" strokeWidth="1.6" /></>}
      {scene === 'bone' && <path d="M14 82a5 5 0 1 1 3-8l40 0a5 5 0 1 1 3 8 5 5 0 1 1-3 8l-40 0a5 5 0 1 1-3-8z" fill="#fff" stroke={INK} strokeWidth="1.8" transform="translate(7 -3) scale(.85)" />}
      {scene === 'selfie' && <><ellipse cx="58" cy="76" rx="6" ry="9" fill={d.fur} transform="rotate(25 58 76)" /><rect x="56" y="56" width="14" height="24" rx="3" fill={INK} /><rect x="58" y="59" width="10" height="16" rx="1.5" fill="#9CD8FF" /><path d="M10 14c0-4 5-4 5 0 0-4 5-4 5 0 0 4-5 7-5 7s-5-3-5-7z" fill="#F0708C" /></>}
    </svg>
  );
}

/* ikonka appky Instagram v pôvodnej podobe (Matej 6. 11.: „IG ikonku daj takú, aká je originál“) —
   radiálny prechod zdola zľava, biely obrys fotoaparátu */
export function IgIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label="Instagram" className="vs-ico">
      <defs>
        <radialGradient id="ig-gr" cx="30" cy="107" r="150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fdf497" /><stop offset=".05" stopColor="#fdf497" />
          <stop offset=".45" stopColor="#fd5949" /><stop offset=".6" stopColor="#d6249f" /><stop offset=".9" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#ig-gr)" />
      <rect x="21" y="21" width="58" height="58" rx="17" fill="none" stroke="#fff" strokeWidth="7" />
      <circle cx="50" cy="50" r="14" fill="none" stroke="#fff" strokeWidth="7" />
      <circle cx="66.5" cy="33.5" r="4.4" fill="#fff" />
    </svg>
  );
}

export function IgMock({ c }: { c: (k: string) => string }) {
  return (
    <div className="igrow">
      {DOGS.map(d => (
        <div key={d.n} className={`igph igph${d.n}`}>
          <img className="fr" src="/web-app/phone.svg" alt="" />
          <div className="scr"><div className="igs">
            <div className="igs-top"><span className="igs-back" /><b>{d.handle}</b><span className="igs-dots"><i /><i /><i /></span></div>
            <div className="igs-head">
              <span className="igs-av"><span className="igs-avin"><DogTile d={d} scene="selfie" /></span></span>
              <div className="igs-st">
                <div><b>{c(`ig${d.n}_posts`)}</b>{c('ig_posts')}</div>
                <div><b>{c(`ig${d.n}_fol`)}</b>{c('ig_fol')}</div>
                <div><b>{c(`ig${d.n}_ing`)}</b>{c('ig_ing')}</div>
              </div>
            </div>
            <p className="igs-nm"><b>{c(`ig${d.n}_name`)}</b> {c(`ig${d.n}_bio`)}</p>
            <span className="igs-fol">{c('ig_follow')}</span>
            <div className="igs-gr">{d.tiles.map((s, i) => <DogTile key={i} d={d} scene={s} />)}</div>
          </div></div>
        </div>
      ))}
    </div>
  );
}
