/**
 * Filter „ako vidí pes" — psy sú dichromati (modrá + žltá, červenú a zelenú
 * nerozlíšia). Variant E z nákresu plany/nakres-psie-videnie-2026-09-26 (Matej 26. 9.: *„dal by som E ale miernejšie rozostrenie"*): žltý kanál ťahá zelená (tráva → bledožltá, červená → tmavá), modrá ostáva, mierne vybledlé + jemné rozostrenie (psie oko vidí menej ostro). SVG sa vloží do
 * dokumentu raz; CSS naň odkazuje cez `url(#dogypt-dog-vision)`.
 *
 * Jeden zdroj pre stenu (`GodsGrid`) aj ukážku karty v ZADRŽANÍ
 * (`FlowStayScreen`) — pokladňa nesmie kvôli filtru ťahať celú stenu.
 */
export function ensureDogVisionFilter() {
  if (typeof document === 'undefined' || document.getElementById('dogypt-dog-vision')) return;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML = '<filter id="dogypt-dog-vision" color-interpolation-filters="sRGB">'
    + '<feColorMatrix type="matrix" values="0.2 0.8 0 0 0  0.2 0.8 0 0 0  0 0.1 0.9 0 0  0 0 0 1 0"/>'
    + '<feColorMatrix type="saturate" values="0.8"/>'
    + '<feGaussianBlur stdDeviation="0.35"/>'
    + '</filter>';
  document.body.appendChild(svg);
}
