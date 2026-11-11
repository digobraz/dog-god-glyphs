// ČARODEJNÍCKA KNIŽNICA — obraz steny Moje znalosti (Matej 11. 11. 2026: „zatiaľ daj tú čarodejnícku knižnicu do appky,
// neskôr možno zmeníme“). Predloha: `plany/nakresy/ainubis-plagat-2026-11-10/magicka-v2.html`, návrh 1.
// Sedem kníh v oblúku = sedem svetov (poradie VAULT_WORLDS). Rozčítaný svet = otvorená kniha svieti farbou sveta,
// z jej strán stúpajú iskry. Nedotknutý svet = zavretá kniha so sponou. Kreslí sa ako reťazec SVG, nie React strom,
// lebo je to obraz (vyše tisíc tvarov) a mení sa len s postupom.
import { WORLD_TINT } from '@/components/pack/ainubisSkin';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';

const VW = 358;
const VH = 376;
/** Posun scény nadol pod pás levelu. */
const DY = 52;
const f = (v: number) => v.toFixed(1);
const hex = (rgb: string) => '#' + rgb.split(',').map((x) => (+x).toString(16).padStart(2, '0')).join('');
const mix = (h: string, t: string, a: number) => {
  const n = (x: string) => parseInt(x, 16);
  const c = [n(h.slice(1, 3)), n(h.slice(3, 5)), n(h.slice(5, 7))];
  const d = [n(t.slice(1, 3)), n(t.slice(3, 5)), n(t.slice(5, 7))];
  return '#' + c.map((v, i) => Math.round(v + (d[i] - v) * a).toString(16).padStart(2, '0')).join('');
};

/** `p` = postup v každom svete 0…1, v poradí VAULT_WORLDS. */
export function kniznicaSvg(p: number[]): string {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const COL = VAULT_WORLDS.map((w) => hex(WORLD_TINT[w.key] || '65,217,240'));
  const P = COL.map((_, i) => Math.min(1, Math.max(0, p[i] || 0)));
  const motes = (n: number, x0: number, y0: number, w: number, h: number, col: string, op = 0.8) => {
    let s = '';
    for (let i = 0; i < n; i++) s += `<circle cx="${f(x0 + rnd() * w)}" cy="${f(y0 + rnd() * h)}" r="${f(0.5 + rnd() * 1.4)}" fill="${col}" opacity="${f(op * (0.3 + rnd() * 0.7))}"/>`;
    return s;
  };
  const star = (x: number, y: number, r: number, col: string) =>
    `<path d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z" fill="${col}"/>`;
  const candle = (x: number, y: number, h = 20, w = 7) =>
    `<circle cx="${x}" cy="${y - h - 6}" r="22" fill="url(#kn-flame)"/><path d="M${x - w / 2} ${y} V${y - h} q${w / 2} -2 ${w} 0 V${y}Z" fill="#EADFC6"/><path d="M${x + w / 2 - 2} ${y - h} v${h}" stroke="#C9B994" stroke-width="2"/><path d="M${x} ${y - h - 13} q5 7 0 11 q-5 -4 0 -11Z" fill="#FFE29A"/><path d="M${x} ${y - h - 8} q2 3 0 5 q-2 -2 0 -5Z" fill="#fff"/>`;

  let d = `<radialGradient id="kn-vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
<radialGradient id="kn-flame" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6D8"/><stop offset=".35" stop-color="#FFC765" stop-opacity=".55"/><stop offset="1" stop-color="#FF9A2E" stop-opacity="0"/></radialGradient>
<linearGradient id="kn-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D0B1C"/><stop offset=".7" stop-color="#1A1430"/><stop offset="1" stop-color="#120E1E"/></linearGradient>
<linearGradient id="kn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040B1E"/><stop offset=".6" stop-color="#0F2F57"/><stop offset="1" stop-color="#1E5C7E"/></linearGradient>
<linearGradient id="kn-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FF3FF" stop-opacity=".32"/><stop offset="1" stop-color="#9FF3FF" stop-opacity="0"/></linearGradient>
<linearGradient id="kn-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B1424"/><stop offset="1" stop-color="#0B0810"/></linearGradient>
<radialGradient id="kn-sir" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="#C9F8FF" stop-opacity=".9"/><stop offset="1" stop-color="#41D9F0" stop-opacity="0"/></radialGradient>
<radialGradient id="kn-rug" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#41D9F0" stop-opacity=".22"/><stop offset="1" stop-color="#41D9F0" stop-opacity="0"/></radialGradient>`;
  COL.forEach((c, i) => {
    d += `<radialGradient id="kn-g${i}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${mix(c, '#ffffff', 0.6)}"/><stop offset=".35" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
<linearGradient id="kn-c${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(c, '#000000', 0.35)}"/><stop offset="1" stop-color="${mix(c, '#000000', 0.62)}"/></linearGradient>`;
  });
  // Scéna je o DY nižšie ako na plagáte: v appke na vrchu steny leží meno a pás levelu a oblúk kníh by zakryli.
  let s = `<defs>${d}</defs><rect width="${VW}" height="${VH}" fill="url(#kn-w)"/><g transform="translate(0 ${DY})">`;
  // zadná stena
  for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) {
    const x = 96 + c * 42 - (r % 2 ? 21 : 0), y = 60 + r * 30;
    if (x > 92 && x < 262) s += `<rect x="${x}" y="${y}" width="40" height="28" rx="2" fill="#1D1733" opacity=".55"/>`;
  }
  // gotické okno so Síriom
  const wx = 179, wt = 74, wb = 232, ww = 40;
  const arch = `M${wx - ww} ${wb} V${wt + 44} Q${wx - ww} ${wt} ${wx} ${wt - 8} Q${wx + ww} ${wt} ${wx + ww} ${wt + 44} V${wb}Z`;
  s += `<path d="${arch}" fill="url(#kn-sky)"/>`;
  s += `<clipPath id="kn-win"><path d="${arch}"/></clipPath><g clip-path="url(#kn-win)">${motes(26, wx - ww, wt, ww * 2, wb - wt, '#E6FBFF', 1)}<circle cx="${wx + 8}" cy="${wt + 48}" r="44" fill="url(#kn-sir)"/>${star(wx + 8, wt + 48, 16, '#fff')}${star(wx + 8, wt + 48, 8, '#E9FDFF')}</g>`;
  s += `<path d="${arch}" fill="none" stroke="#3A2A1C" stroke-width="8"/><path d="${arch}" fill="none" stroke="#C99A3F" stroke-width="1.4" opacity=".55"/>`;
  s += `<path d="M${wx} ${wt - 6} V${wb} M${wx - ww} ${wt + 92} H${wx + ww}" stroke="#3A2A1C" stroke-width="4"/>`;
  s += `<rect x="${wx - ww - 10}" y="${wb}" width="${ww * 2 + 20}" height="8" rx="2" fill="#3A2A1C"/>`;
  s += `<path d="M${wx - ww} ${wb} L${wx - ww - 70} 330 L${wx + ww + 70} 330 L${wx + ww} ${wb}Z" fill="url(#kn-beam)"/>`;
  for (let i = 0; i < 5; i++) { const x = wx - ww + 8 + i * 18; s += `<path d="M${x} ${wt + 40} L${x - 40 + i * 20} 330 L${x - 26 + i * 20} 330 L${x + 8} ${wt + 40}Z" fill="#BDF6FF" opacity=".06"/>`; }
  // bočné regály v perspektíve
  const shelf = (side: number) => {
    const x0 = side < 0 ? 0 : VW, inn = side < 0 ? 92 : 266, top = 54, bot = 300;
    let q = `<polygon points="${x0} ${top - 24} ${inn} ${top} ${inn} ${bot} ${x0} ${bot + 30}" fill="#1A110B"/>`;
    const rows = 5;
    for (let r = 0; r <= rows; r++) {
      const t = r / rows, yi = top + (bot - top) * t, yo = top - 24 + (bot + 30 - top + 24) * t;
      if (r < rows) {
        const ni = top + (bot - top) * (r + 1) / rows, no = top - 24 + (bot + 30 - top + 24) * (r + 1) / rows;
        let bx = 0;
        while (bx < 1) {
          const bw = 0.045 + rnd() * 0.05, a = bx, b = Math.min(1, bx + bw);
          const xa = x0 + (inn - x0) * a, xb = x0 + (inn - x0) * b;
          const ha = (no - yo) * (1 - a) + (ni - yi) * a, hb = (no - yo) * (1 - b) + (ni - yi) * b;
          const ya = yo * (1 - a) + yi * a, yb2 = yo * (1 - b) + yi * b;
          const fill = 0.62 + rnd() * 0.32;
          const col = ['#4A2342', '#1E3560', '#2A4D35', '#5C331C', '#33275F', '#5A1E28', '#244A52', '#4D3A1A'][Math.floor(rnd() * 8)];
          const y1a = ya + ha, y1b = yb2 + hb, y0a = y1a - ha * fill, y0b = y1b - hb * fill;
          q += `<polygon points="${f(xa)} ${f(y0a)} ${f(xb)} ${f(y0b)} ${f(xb)} ${f(y1b - 2)} ${f(xa)} ${f(y1a - 2)}" fill="${col}"/>`;
          if (rnd() < 0.35) q += `<path d="M${f(xa)} ${f(y0a + (y1a - y0a) * 0.3)} L${f(xb)} ${f(y0b + (y1b - y0b) * 0.3)}" stroke="#C99A3F" stroke-width="1" opacity=".7"/>`;
          bx = b + 0.004;
        }
      }
      q += `<path d="M${x0} ${f(yo)} L${inn} ${f(yi)}" stroke="#4A2F1A" stroke-width="${r === 0 || r === rows ? 6 : 4}"/>`;
    }
    q += `<path d="M${inn} ${top} V${bot}" stroke="#4A2F1A" stroke-width="6"/><path d="M${inn} ${top} V${bot}" stroke="#C99A3F" stroke-width="1" opacity=".35"/>`;
    return q;
  };
  s += shelf(-1) + shelf(1);
  // podlaha a magický kruh
  s += `<path d="M0 330 L92 300 H266 L358 330 V376 H0Z" fill="url(#kn-floor)"/>`;
  for (let i = 0; i < 9; i++) { const x = 92 + i * (174 / 8); s += `<path d="M${f(x)} 300 L${f(179 + (x - 179) * 2.6)} 376" stroke="#251C30" stroke-width="1"/>`; }
  s += `<ellipse cx="179" cy="326" rx="118" ry="24" fill="url(#kn-rug)"/>`;
  s += `<ellipse cx="179" cy="326" rx="104" ry="20" fill="none" stroke="#41D9F0" stroke-width="1.6" opacity=".7"/><ellipse cx="179" cy="326" rx="84" ry="15" fill="none" stroke="#41D9F0" stroke-width="1" opacity=".45" stroke-dasharray="2 6"/>`;
  for (let i = 0; i < 7; i++) { const a = Math.PI * 2 * i / 7; s += `<circle cx="${f(179 + Math.cos(a) * 94)}" cy="${f(326 + Math.sin(a) * 17.5)}" r="2.2" fill="${P[i] > 0 ? COL[i] : '#2C4A5E'}"/>`; }
  // sedem kníh v oblúku
  const pos = [[58, 226, -14], [100, 186, -8], [140, 160, -3], [179, 150, 0], [218, 160, 3], [258, 186, 8], [300, 226, 14]];
  [0, 6, 1, 5, 2, 4, 3].forEach((i) => {
    const [x, y, rot] = pos[i], g = P[i], c = COL[i];
    s += `<g transform="translate(${x} ${y}) rotate(${rot})">`;
    if (g > 0) {
      s += `<circle cx="0" cy="-8" r="${f(26 + g * 22)}" fill="url(#kn-g${i})" opacity="${f(0.55 + g * 0.45)}"/>`;
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI / 2 + (k - 2) * 0.32, L = 40 + g * 30;
        s += `<path d="M0 -6 L${f(Math.cos(a - 0.06) * L)} ${f(-6 + Math.sin(a - 0.06) * L)} L${f(Math.cos(a + 0.06) * L)} ${f(-6 + Math.sin(a + 0.06) * L)}Z" fill="${mix(c, '#ffffff', 0.5)}" opacity="${f(0.12 + g * 0.15)}"/>`;
      }
      s += `<path d="M-27 4 Q-14 -2 0 3 Q14 -2 27 4 L26 8 Q13 3 0 8 Q-13 3 -26 8Z" fill="url(#kn-c${i})"/>`;
      s += `<path d="M0 3 Q-12 -4 -25 1 L-24 -15 Q-12 -20 0 -13Z" fill="#EFE2C4"/><path d="M0 3 Q12 -4 25 1 L24 -15 Q12 -20 0 -13Z" fill="#E3D3AE"/>`;
      s += `<path d="M0 0 Q-12 -7 -24 -2 L-23 -17 Q-11 -23 0 -16Z" fill="#FBF3DF"/><path d="M0 0 Q12 -7 24 -2 L23 -17 Q11 -23 0 -16Z" fill="#F2E6C8"/>`;
      for (let k = 0; k < 4; k++) {
        const ln = mix(c, '#000000', 0.3);
        s += `<path d="M-20 ${-14 + k * 3.4} Q-11 ${-18 + k * 3.4} -4 ${-14 + k * 3.4}" stroke="${ln}" stroke-width=".7" opacity=".55" fill="none"/><path d="M4 ${-14 + k * 3.4} Q11 ${-18 + k * 3.4} 20 ${-14 + k * 3.4}" stroke="${ln}" stroke-width=".7" opacity=".55" fill="none"/>`;
      }
      s += `<path d="M0 -16 V0" stroke="#B9A57E" stroke-width="1"/><path d="M1 0 v10 l-2 -2 l-2 2 v-10" fill="${c}"/>`;
      for (let k = 0; k < Math.round(3 + g * 7); k++) {
        s += `<circle cx="${f((rnd() - 0.5) * 34)}" cy="${f(-24 - rnd() * 36 * (0.5 + g))}" r="${f(0.7 + rnd() * 1.4)}" fill="${mix(c, '#ffffff', 0.55)}" opacity="${f(0.5 + rnd() * 0.5)}"/>`;
      }
      s += `<g transform="translate(${f((rnd() - 0.5) * 16)} ${f(-34 - g * 14)}) scale(.5)" opacity="${f(0.4 + g * 0.5)}">${star(0, 0, 8, mix(c, '#ffffff', 0.6))}</g>`;
    } else {
      s += `<rect x="-15" y="-20" width="30" height="22" rx="3" fill="${mix(c, '#000000', 0.62)}"/><rect x="-15" y="-20" width="30" height="22" rx="3" fill="none" stroke="${mix(c, '#000000', 0.4)}" stroke-width="1.2"/>`;
      s += `<rect x="12" y="-17" width="4" height="16" rx="1" fill="#D9CDB0" opacity=".5"/><rect x="-15" y="-11" width="33" height="4" rx="1" fill="#8A6A3A" opacity=".8"/><circle cx="16" cy="-9" r="2.2" fill="#C99A3F" opacity=".8"/>`;
      s += `<path d="M-11 -16 h8 v8 h-8Z" fill="none" stroke="${mix(c, '#000000', 0.25)}" stroke-width="1" opacity=".7"/>`;
    }
    s += `</g>`;
  });
  s += motes(30, 100, 90, 160, 230, '#DDF8FF', 0.6);
  s += candle(26, 330, 26) + candle(40, 334, 16, 6) + candle(332, 332, 22) + candle(318, 336, 12, 6);
  s += `</g><rect width="${VW}" height="${VH}" fill="url(#kn-vig)"/>`;
  return `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${s}</svg>`;
}
