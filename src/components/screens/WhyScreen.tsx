import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTopBar } from '@/components/PageTopBar';
import { useT } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { track } from '@/lib/analytics';
import { FLOW_PALE_CSS } from './flowPaleSkin';
import cleopatraImg from '@/assets/cleopatra-cartouche.png';
import alba43Foto from '@/assets/alba43-foto.jpg';
import alba59Foto from '@/assets/alba59-foto.jpg';
import alba61Foto from '@/assets/alba61-foto.jpg';
import alba43Glyf from '@/assets/alba43.png';
import alba59Glyf from '@/assets/alba59.png';
import alba61Glyf from '@/assets/alba61.png';

// ── /heroglyph/why — jediná obrazovka vstupu, ktorá NIČ NEPÝTA.
//
// Stojí medzi e-mailom a papierovačkami zámerne: dovtedy človek dal tri veci
// (fotku, meno, adresu) a ešte nevie, na čo. Ďalej ho čaká trinásť otázok
// o psovi — tie sa vypĺňajú inak, keď vieš, do čoho idú.
//
// PRESTAVANÉ 31. 8. 2026 podľa `plany/nakres-heroflow-why-2026-08-31.html`
// (Matejov Canva náčrt, variant „dva bloky"). Matej: *„potrebujeme to fakt čo
// najstručnejšie: HEROGLYF robí z tvojho psa unikát / ALBA — 3 foto / 3
// heroglyphy / symboly opisujú konkrétneho psíka, vytvoriť… a (i) na boku
// inšpirácia z egyptu"*.
//
// 🔑 **Obrazovka netvrdí, ukazuje.** Traja psi menom ALBA sú SKUTOČNÍ — #43,
//    #59 a #61 z našej živej steny (70 zaplatených psov, 64 rôznych mien, ALBA
//    je tam trikrát). Dôkaz unikátnosti sa preto nevyrába, len sa ukáže.
//    Mená a poradové čísla sú verejné; **mená majiteľov sa nepoužívajú.**
// ⚠️ Obrázky sú v `assets/`, NIE naživo z Cloudinary — prekreslený alebo
//    zmazaný pes by ticho zmenil obrazovku. Podklady a postup, ako sa k nim
//    dostať znova: pamäť `reference_dogypt_artefakty_psa_kde_lezia`.
//
// Zaniklo pritom: bublina s Hektorom (obrazovka nič nepýta, nemá koho
// predstavovať), tmavá doska s JEDNÝM heroglyfom a kľúče `why.title` /
// `why.sub` / `why.note`.
//
// Back: /heroglyph/email  ·  Continue: /heroglyph/breed (papierovačky zrušené 31. 8. 2026)
const ALBY = [
  { key: '43', foto: alba43Foto, glyf: alba43Glyf },
  { key: '59', foto: alba59Foto, glyf: alba59Glyf },
  { key: '61', foto: alba61Foto, glyf: alba61Glyf },
];

export function WhyScreen() {
  const flowOk = useFlowGuard();
  const navigate = useNavigate();
  const t = useT();
  const [egypt, setEgypt] = useState(false);

  // Odchod z panela: klik mimo alebo Esc. Krížik nemá (lock 28. 8.).
  useEffect(() => {
    if (!egypt) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEgypt(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [egypt]);

  const go = () => {
    track('flow_why_continue');
    navigate('/heroglyph/breed');
  };

  if (!flowOk) return null;

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/heroglyph/email')} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center">

          {/* Prvá fáza — človek je stále pri psovi (fotka, meno, ďalší psi). */}

          <motion.div
            className="hf-block"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="hf-plate">

              {/* Druhá veta je ZLATÁ — je to tá polovica, ktorú tri stĺpce pod
                  ňou dokazujú, takže oko ide rovno na dôkaz. */}
              <h2 className="hf-head">
                {t('heroglyph.flow.why.head1')}{' '}
                <em>{t('heroglyph.flow.why.head2')}</em>
              </h2>

              {/* ── TRI STĹPCE: fotka · meno · heroglyf ─────────────────────
                  Veta nad nimi hovorí, čo je zhodné (meno), veta pod nimi to, čo
                  zhodné nie je (znak) — dôkaz stojí medzi nimi, preto sú všetky
                  tri veci v jednej skupine a nie tri samostatné prvky dosky.
                  Heroglyf je čierna kresba s alfou, ide priamo na papyrus; tmavý
                  podklad potrebuje až ZLATÁ podoba (po memoriáli, DOGMA 8.3). */}
              <div className="hf-group">
                <p className="hf-lead">
                  <strong>{t('heroglyph.flow.why.leadStrong')}</strong>{' '}
                  {t('heroglyph.flow.why.leadRest')}
                </p>
                <div className="hf-albs">
                  {ALBY.map((a) => (
                    <div className="hf-alb" key={a.key}>
                      {/* Číslo psa je zlatá pilulka NA fotke — ten istý prvok, aký
                          nesie kruh na `/pack/dogs` a na DOG ID. Meno pod fotkou
                          zaniklo (Matej 31. 8.); že sú to tri ALBY, hovorí veta nad
                          stĺpcami. Číslo je verejné, meno majiteľa sa nepoužíva. */}
                      <span className="pw">
                        <img className="pic" src={a.foto} alt="" />
                        <span className="num">#{a.key}</span>
                      </span>
                      <img className="glyf" src={a.glyf} alt="" />
                    </div>
                  ))}
                </div>
                <p className="hf-albnote">{t('heroglyph.flow.why.albNote')}</p>
              </div>

              <div className="hf-group">
                <button type="button" className="hf-cta" onClick={go}>
                  {t('heroglyph.flow.why.cta')}
                </button>
                {/* Textový odkaz, nie krúžok v rohu: je to otázka, ktorú si človek
                    naozaj kladie, a ako otázka sa má aj čítať. Značka „ⓘ" je v JSX,
                    nie v preklade — je to typografia, nemusí ju niesť 18 jazykov. */}
                <button type="button" className="hf-hint" onClick={() => setEgypt(true)}>
                  ⓘ {t('heroglyph.flow.why.link')}
                </button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* ── POPUP „VEČNÝ ODKAZ" — bez krížika, von klikom mimo alebo Esc ─────
          Panel je ten istý recept, aký nesie panel psa na `/dogs` (`.hf-leg*`
          zo šatu) — vstup má jeden tvar plávajúceho panela, nie dva.

          PORADIE: nadpis → text → kartuša → popiska (Matej 31. 8.: „urob to tak
          že nadpis potom text a až potom kartuša a vysvetlenie"). Obrázok teda
          NIE JE ilustrácia na úvod, ale dôkaz na záver — človek si najprv prečíta,
          čo kartuša bola, a až potom ju uvidí. Predtým stál hneď pod nadpisom
          a vysvetľoval sa skôr, než bolo čo vysvetľovať. */}
      {egypt && (
        <div className="hf-legwrap" role="dialog" aria-modal="true">
          <div className="hf-legveil" onClick={() => setEgypt(false)} />
          <div className="hf-legpanel">
            <p className="who">{t('heroglyph.flow.why.egyptTitle')}</p>

            {/* Tri odstavce: pôvod → čo je heroglyf → kľúč.
                ⚠️ Tretí NETVRDÍ, že druhý rovnaký nemôže vzniknúť — heroglyf je
                dvanásť výberov z konečných zoznamov a dvaja ľudia s rovnakými
                odpoveďami dostanú ten istý obrázok. Unikátnosť dokázal OBRÁZOK
                na obrazovke (tri ALBY), text ju netvrdí druhýkrát.
                → pamäť `reference_dogypt_heroglyf_kombinacny_priestor` */}
            <p className="hf-note">{t('heroglyph.flow.why.egyptP1')}</p>
            <p className="hf-note">{t('heroglyph.flow.why.egyptP2')}</p>
            <p className="hf-note">{t('heroglyph.flow.why.egyptP3')}</p>

            <img
              src={cleopatraImg}
              alt={t('heroglyph.flow.ownerFinal.cleopatraAlt')}
              className="w-full max-w-[190px] self-center object-contain"
            />
            {/* Popiska pod kartušou (Matej 31. 8.: „a dolu pod kartušov"). Má vlastný
                kľúč — `cleopatraAlt` ostáva popisom obrázka pre čítačky. */}
            <p className="hf-note">{t('heroglyph.flow.why.cleopatraCaption')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
