/** Odznaky App Store a Google Play — spoločné pre /app a /story (vytiahnuté z AppWeb.tsx 11. 11. 2026). */
const AppleSvg = () => <svg viewBox="0 0 24 24"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.4-.9C5.7 6.8 4 7.8 3.1 9.4c-1.9 3.3-.5 8.2 1.4 10.9.9 1.3 2 2.8 3.4 2.8 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.5.9c1.5 0 2.4-1.3 3.3-2.7 1-1.5 1.5-3 1.5-3.1-.1 0-2.9-1.1-3.3-4.7zM13.8 4.9c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" /></svg>;
const PlaySvg = () => <svg viewBox="0 0 24 24"><path d="M3.6 1.8 13.5 12l-9.9 10.2c-.4-.2-.6-.7-.6-1.2V3c0-.5.2-1 .6-1.2zm11 11.3 2.6 2.6-11.7 6.7 9.1-9.3zm3.9-3.9 3 1.7c.9.5.9 1.8 0 2.3l-3 1.7-2.9-2.9 2.9-2.8zM5.5 1.6l11.7 6.7-2.6 2.6-9.1-9.3z" /></svg>;

/** Odkazy do obchodov — doplníme, keď bude appka verejne v obchodoch. */
const STORE_IOS = '#';
const STORE_PLAY = '#';

export function Stores() {
  return (
    <div className="stores">
      <a className="store" href={STORE_IOS}><AppleSvg /><span><small>Download on the</small><b>App Store</b></span></a>
      <a className="store" href={STORE_PLAY}><PlaySvg /><span><small>GET IT ON</small><b>Google Play</b></span></a>
    </div>
  );
}
