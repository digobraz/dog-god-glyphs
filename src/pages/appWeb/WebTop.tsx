/** Hlavička webu — JEDNA pre homepage aj /story (Matej 21. 11.: „header musí byť rovnaký aj na STORY“).
 *  Dovtedy mal /story vlastnú kópiu so starým CTA „Začni hrať“, bez kľúča a mapy.
 *  `base` = '' na homepage (kotvy na tej istej stránke), '/' inde (kotva vedie na homepage).
 *  Stav pásu (stuck · dark · away · sx-onphoto) určuje stránka cez `cls`, alebo ho prepína cez `ref`. */
import { forwardRef, useEffect, useRef, useState, type MouseEvent as RME } from 'react';
import { useLang } from '@/i18n/LanguageContext';
import { flagUrl } from '@/lib/flagUrl';
import { WEB_LANGS } from './langs';
import { Stores } from './Stores';

const START = '/heroglyph/name';

/** Doroluje na sekciu a po dobehnutí ju DOROVNÁ. Sekcie nad cieľom počas rolovania ešte rastú
 *  (dočítané obrázky, odhalenia), takže holý `scrollIntoView` skončil o kus vedľa — PSY napr.
 *  ukázalo planétku len do polovice (Matej 21. 11.). Max 3 dorovnania. */
export function scrollToId(id: string, smooth = true) {
  const el = document.getElementById(id);
  if (!el) return;
  let n = 0;
  const go = (b: ScrollBehavior) => el.scrollIntoView({ behavior: b, block: 'start' });
  const fix = () => {
    const want = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    if (Math.abs(el.getBoundingClientRect().top - want) > 4 && n++ < 3) { go('auto'); setTimeout(fix, 350); }
  };
  go(smooth ? 'smooth' : 'auto');
  if ('onscrollend' in window && smooth) window.addEventListener('scrollend', () => setTimeout(fix, 120), { once: true });
  else setTimeout(fix, smooth ? 900 : 350);
}

type Props = { c: (k: string) => string; v2: boolean; base?: string; cls?: string; active?: 'story' };

export const WebTop = forwardRef<HTMLElement, Props>(function WebTop({ c, v2, base = '', cls = '', active }, ref) {
  const { lang, setLang } = useLang();
  const curLang = WEB_LANGS.find((x) => x.code === lang) ?? WEB_LANGS[0];
  const [langOpen, setLangOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mmLang, setMmLang] = useState(false);
  /* otvorené menu = trieda `mm-open` cez classList, NIE cez className — /story prepína `sx-onphoto`/`stuck` tiež cez classList
     a prepis className pri otvorení menu by mu ich zmazal (Matej 22. 11.: „header zostane priesvitný… mal by sa aj on zafarbiť“) */
  const hdr = useRef<HTMLElement | null>(null);
  const setHdr = (el: HTMLElement | null) => { hdr.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; };
  useEffect(() => { hdr.current?.classList.toggle('mm-open', menu); }, [menu]);
  useEffect(() => { if (!langOpen) return; const off = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest('.lang-wrap')) setLangOpen(false); }; document.addEventListener('pointerdown', off); return () => document.removeEventListener('pointerdown', off); }, [langOpen]);

  /* PSY = posledná planétka so psami (Matej 21. 11.: „v menu by mal byť aj odkaz na poslednú planétku so psami“) */
  const onNav = (e: RME) => {
    const a = (e.target as HTMLElement).closest('a'); const h = a?.getAttribute('href') ?? '';
    if (base || !h.startsWith('#') || h.length < 2) return;
    e.preventDefault(); history.replaceState(null, '', `${location.search}${h}`); scrollToId(h.slice(1));
  };
  const links = (
    <>
      <a href={`${base}#features`}>{c('nav2')}</a><a href={`${base}#trips`}>{c('nav_trips')}</a><a href={`${base}#ainubis`}>AINUBIS</a><a href={`${base}#badges`}>{c('nav3')}</a>
      {v2 && <a href={`${base}#join`}>{c('nav_dogs')}</a>}
      <a className={active === 'story' ? 'sx-on' : undefined} href="/story">{c('nav5')}</a>
    </>
  );

  return (
    <header className={`top${v2 ? ' v2' : ''}${cls ? ` ${cls}` : ''}`} ref={setHdr}>
      <div className="wrap">
        <a className="logo" href={base || '#'} aria-label="DOGYPT"><img src="/web-app/logo-napis.webp" alt="DOGYPT" /></a>
        <nav onClick={onNav}>{links}</nav>
        <div className="lang-wrap">
          <button className="lang" aria-expanded={langOpen} onClick={() => setLangOpen(!langOpen)}><img src={flagUrl(curLang.flag, 40)} alt="" />{curLang.code.slice(0, 2).toUpperCase()}</button>
          {langOpen && (
            <div className="lang-pop" onClick={() => setLangOpen(false)}>
              {WEB_LANGS.map((x) => <button key={x.code} className={x.code === lang ? 'on' : ''} onClick={() => setLang(x.code)}><img src={flagUrl(x.flag, 40)} alt="" />{x.name}</button>)}
            </div>
          )}
        </div>
        {/* planétka (ikonka VON z appky) = verejná mapa výletov bez registrácie, nová karta; ZA tlačidlom, len veľká ikonka bez rámu, vzor MysteryHike (Matej 11. 11.) */}
        {/* FLIP 17. 11. (Matej): najprv heroflow, až potom appka — jedno CTA všade. */}
        {/* prihlásenie = ikonka KĽÚČA (heroglyf je kľúč do appky), popis v title (Matej 21. 11.: „header je moc plný“) */}
        {v2 && <a className="top-login" href="/login" aria-label={c('login')} title={c('login')}><img src="/icons/sys/kluc.webp" alt="" /></a>}
        {/* úzka hlavička: krátky popis, inak dlhšie CTA vytlačí hamburger za okraj */}
        <a className="pk-cta" href={START}>{v2 ? c('start_s') : c('start')}</a>
        {(v2 || !active) && <a className="trips-btn" href="/map" target="_blank" rel="noopener" aria-label={c('nav_trips')} title={c('nav_trips')}><img src="/icons/sys/von.webp" alt="" /></a>}
        {/* mobil: hamburger — sekcie, jazyky, GET THE APP (Matej 6. 11., vzor MysteryHike) */}
        <button className={`burger${menu ? ' on' : ''}`} aria-label={c('menu')} aria-expanded={menu} onClick={() => setMenu(!menu)}><i /><i /><i /></button>
      </div>
      {menu && (
        <div className="mmenu" onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setMenu(false); }}>
          <nav onClick={onNav}>{links}</nav>
          {/* jazyk = JEDEN riadok s aktuálnym, zoznam až po ťuknutí (Matej 17. 11.) */}
          <button className={`mm-cur${mmLang ? ' on' : ''}`} aria-expanded={mmLang} onClick={() => setMmLang(!mmLang)}><img src={flagUrl(curLang.flag, 40)} alt="" />{curLang.name}<i aria-hidden /></button>
          {mmLang && <div className="mm-lang">{WEB_LANGS.filter((x) => x.code !== lang).map((x) => <button key={x.code} onClick={() => { setLang(x.code); setMmLang(false); setMenu(false); }}><img src={flagUrl(x.flag, 40)} alt="" />{x.name}</button>)}</div>}
          <a className="pk-cta" href={START}>{c('start')}</a>
          {/* CLAIM 2 (Matej 21. 11.: „v menu musí byť aj stiahnuť appku a prihlásenie na web“) */}
          {v2 && <Stores soon={c('soon')} />}
          <a className={`mm-login${v2 ? ' v2' : ''}`} href="/login">{v2 && <img src="/icons/sys/kluc.webp" alt="" />}{c('have_acc')} <b>{c('login')}</b></a>
        </div>
      )}
    </header>
  );
});
