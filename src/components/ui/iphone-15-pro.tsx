/**
 * iPhone 15 Pro — rám telefónu ako SVG (433 × 882). Prevzaté z 21st.dev
 * `@solaceui/phone-mockups-1` (Matej 27. 9. 2026: *„chcem ich ako v tom
 * prompte"*), svetlá téma natvrdo — film beží na papyruse, tmavý variant
 * komponentu tu nemá kde nastať.
 * Obsah displeja: `src` (screenshot) alebo `children` (zástupca, kým chýba).
 */
import type { ImgHTMLAttributes, ReactNode } from 'react';

export const IPHONE_W = 433;
export const IPHONE_H = 882;
/** Displej v súradniciach rámu. */
const SX = 21.25, SY = 19.25, SW = 389.5, SH = 843.5, SR = 55.75;

type Props = {
  width?: number | string;
  src?: string;
  alt?: string;
  className?: string;
  children?: ReactNode;
  /** Doplnkové atribúty snímky (napr. `loading`) — film nimi odkladá telefóny mimo prvej obrazovky. */
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
};

export default function Iphone15Pro({ width = '100%', src, alt = '', className, children, imgProps }: Props) {
  return (
    <div className={className} style={{ position: 'relative', width }}>
      <svg width="100%" viewBox={`0 0 ${IPHONE_W} ${IPHONE_H}`} preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <path d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z" fill="#404040" />
        <path d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z" fill="#404040" />
        <path d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z" fill="#404040" />
        <path d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z" fill="#404040" />
        <path d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z" fill="#404040" />
        <path d="M6 74C6 35.3401 37.3401 4 76 4H356C394.66 4 426 35.3401 426 74V808C426 846.66 394.66 878 356 878H76C37.3401 878 6 846.66 6 808V74Z" fill="#262626" />
        <path opacity="0.5" d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z" fill="#404040" />
        <path d="M21.25 75C21.25 44.2101 46.2101 19.25 77 19.25H355C385.79 19.25 410.75 44.2101 410.75 75V807C410.75 837.79 385.79 862.75 355 862.75H77C46.2101 862.75 21.25 837.79 21.25 807V75Z" fill="#404040" stroke="#404040" strokeWidth="0.5" />
      </svg>
      {/* 🔴 DISPLEJ JE HTML NAD RÁMOM, NIE <foreignObject> (5. 10. 2026, Matejov iPhone):
          WebKit foreignObject neškáluje podľa viewBox a neoreže clipPathom — screenshot sa
          v Safari vykreslil v plných 390 px cez rám aj cez ostrovček. Chrome to robil dobre,
          preto to emulácia neukázala. Poloha a zaoblenie = tie isté čísla v percentách rámu. */}
      <div style={{
        position: 'absolute', overflow: 'hidden',
        left: `${(SX / IPHONE_W) * 100}%`, top: `${(SY / IPHONE_H) * 100}%`,
        width: `${(SW / IPHONE_W) * 100}%`, height: `${(SH / IPHONE_H) * 100}%`,
        borderRadius: `${(SR / SW) * 100}% / ${(SR / SH) * 100}%`,
      }}>
        {src
          ? <img {...imgProps} src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : children}
      </div>
      {/* Ostrovcek (kamera) sa NEKRESLI: Matej 6. 10. 2026 - zakryval KM a hornu listu appky na kazdom mockupe. */}
    </div>
  );
}
