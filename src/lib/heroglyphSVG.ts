// Egyptian cartouche SVG generator — two sizes:
//   'sm' → hover overlay (horizontal, 210×68)
//   'lg' → click overlay (vertical, 120×200)
// Input: heroglyph_code string (16 segments joined by '-')

const GOLD = '#C99A3F';

// VS15 forces text (non-emoji) rendering for Unicode symbols
const VS15 = '︎';
const ZODIAC_SYMS = [
  '♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓',
].map(s => s + VS15);

function parseSegments(code: string) {
  const s = (code || '').split('-');
  const letter = (v: string | undefined) => /^[A-Z]$/.test(v || '') ? v! : 'X';
  return {
    dogInitial:   letter(s[0]),
    dogGender:    s[1] || 'XX',
    color:        s[2] || 'X',
    ownerGender:  s[7] || 'XX',
    westernZ:     s[9] || 'ZXX',
    ownerInitial: letter(s[10]),
    country:      s[14] || 'XXX',
    year:         s[15] || 'XXXX',
  };
}

function genderSym(g: string) {
  if (g === 'XY') return '♂' + VS15;
  if (g === 'XX') return '♀' + VS15;
  return '·';
}
// Color as inline SVG shapes (avoids emoji rendering entirely)
function colorShape(c: string, x: number, y: number, size = 10): string {
  if (c === 'M') return `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" fill="${GOLD}" opacity="0.7"/>`;
  if (c === 'R') return `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.7"/>
    <line x1="${x - size/2}" y1="${y}" x2="${x + size/2}" y2="${y}" stroke="${GOLD}" stroke-width="1.5" opacity="0.7"/>`;
  if (c === 'S') return `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.65"/>`;
  return `<circle cx="${x}" cy="${y}" r="2" fill="${GOLD}" opacity="0.5"/>`;
}
function zodiacSym(z: string) {
  const m = z.match(/Z(\d{2})/);
  if (!m) return '·';
  return (ZODIAC_SYMS[parseInt(m[1]) - 1] || '·');
}

// Horizontal cartouche for hover state
export function heroglyphSVGSmall(code: string): string {
  const p = parseSegments(code);
  const W = 210, H = 68;
  const cx = W / 2;
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4" width="${W - 12}" height="52" rx="26" fill="none" stroke="${GOLD}" stroke-width="1.8"/>
    <line x1="4" y1="60" x2="${W - 4}" y2="60" stroke="${GOLD}" stroke-width="3.5"/>
    <line x1="10" y1="65" x2="${W - 10}" y2="65" stroke="${GOLD}" stroke-width="1.2"/>
    <text x="36" y="38" text-anchor="middle" font-size="16" font-family="serif" fill="${GOLD}" opacity="0.72">${genderSym(p.dogGender)}</text>
    ${colorShape(p.color, 66, 30, 11)}
    <text x="${cx}" y="39" text-anchor="middle" font-size="28" font-family="Cinzel,serif" font-weight="700" fill="${GOLD}">${p.dogInitial}</text>
    <text x="${W - 66}" y="37" text-anchor="middle" font-size="14" font-family="serif" fill="${GOLD}" opacity="0.65">${zodiacSym(p.westernZ)}</text>
    <text x="${W - 36}" y="38" text-anchor="middle" font-size="16" font-family="serif" fill="${GOLD}" opacity="0.65">${genderSym(p.ownerGender)}</text>
  </svg>`;
}

// Vertical cartouche for click overlay
// packLabel: number → '#42', string → displayed as-is (e.g. 'FOUNDER'), undefined → omitted
export function heroglyphSVGLarge(code: string, packLabel?: number | string): string {
  const p = parseSegments(code);
  const W = 120, H = 198;
  const cx = W / 2;
  const hasLabel = packLabel != null;
  const labelStr = typeof packLabel === 'number' ? `#${packLabel}` : (packLabel || '');
  const initialY = hasLabel ? 103 : 92;

  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4" width="${W - 12}" height="180" rx="50" fill="none" stroke="${GOLD}" stroke-width="2"/>
    <line x1="4" y1="188" x2="${W - 4}" y2="188" stroke="${GOLD}" stroke-width="4"/>
    <line x1="10" y1="195" x2="${W - 10}" y2="195" stroke="${GOLD}" stroke-width="1.5"/>
    ${hasLabel ? `
    <text x="${cx}" y="38" text-anchor="middle" font-size="9" font-family="Cinzel,serif" fill="${GOLD}" opacity="0.55" letter-spacing="1">${labelStr}</text>
    <line x1="${cx - 22}" y1="44" x2="${cx + 22}" y2="44" stroke="${GOLD}" stroke-width="0.7" opacity="0.4"/>` : ''}
    <text x="${cx}" y="${initialY}" text-anchor="middle" font-size="44" font-family="Cinzel,serif" font-weight="700" fill="${GOLD}">${p.dogInitial}</text>
    <line x1="${cx - 28}" y1="118" x2="${cx + 28}" y2="118" stroke="${GOLD}" stroke-width="0.9" opacity="0.5"/>
    <text x="${cx - 20}" y="135" text-anchor="middle" font-size="13" font-family="serif" fill="${GOLD}" opacity="0.78">${genderSym(p.dogGender)}</text>
    ${colorShape(p.color, cx, 128, 10)}
    <text x="${cx + 20}" y="134" text-anchor="middle" font-size="13" font-family="serif" fill="${GOLD}" opacity="0.65">${zodiacSym(p.westernZ)}</text>
    <line x1="${cx - 22}" y1="144" x2="${cx + 22}" y2="144" stroke="${GOLD}" stroke-width="0.7" opacity="0.4"/>
    <text x="${cx}" y="156" text-anchor="middle" font-size="8" font-family="Cinzel,serif" fill="${GOLD}" opacity="0.5" letter-spacing="1.5">${p.country}</text>
    <text x="${cx}" y="168" text-anchor="middle" font-size="8" font-family="Cinzel,serif" fill="${GOLD}" opacity="0.4" letter-spacing="0.5">${p.year}</text>
  </svg>`;
}
