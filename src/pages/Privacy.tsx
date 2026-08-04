import { Link } from "react-router-dom";
import dogyptLogo from "@/assets/dogypt-logo-gold.png";
import { useT } from "@/i18n/LanguageContext";

// 13 sekcií — texty žijú v i18n slovníkoch (privacy.sN.title / privacy.sN.body).
// Právne záväzná je EN verzia (legal.langNote).
// 12–13 (viditeľnosť v packu / správy a nahlásenia) pribudli 2026-08-04 pre /pack —
// pripojené na koniec zámerne, prečíslovanie by znamenalo prepísať 18 slovníkov.
const SECTION_COUNT = 13;

export default function Privacy() {
  const t = useT();
  const sections = Array.from({ length: SECTION_COUNT }, (_, i) => ({
    title: t(`privacy.s${i + 1}.title`),
    body: t(`privacy.s${i + 1}.body`),
  }));

  return (
    <div className="dark-bg min-h-screen flex flex-col items-center py-10 md:py-16 px-4">
      <Link to="/" className="mb-8 md:mb-10">
        <img src={dogyptLogo} alt="DOGYPT" className="h-9 md:h-12 object-contain" />
      </Link>

      <article
        className="w-full max-w-3xl rounded-[24px] papyrus-bg border border-border/40 p-6 md:p-12 shadow-sm"
        style={{ color: "#0E0E0E" }}
      >
        <p
          className="text-[10px] tracking-[0.4em] uppercase mb-3"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "#A07423" }}
        >
          {t("legal.eyebrow")}
        </p>
        <h1
          className="text-3xl md:text-5xl font-bold uppercase mb-2 leading-tight"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.02em" }}
        >
          {t("privacy.title")}
        </h1>
        <p
          className="text-xs uppercase tracking-[0.2em] mb-3"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(14,14,14,0.5)" }}
        >
          {t("legal.updated")}
        </p>
        <p
          className="text-xs italic mb-10"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(14,14,14,0.5)" }}
        >
          {t("legal.langNote")}
        </p>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2
                className="text-lg md:text-xl uppercase mb-2"
                style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.04em" }}
              >
                {s.title}
              </h2>
              <p
                className="leading-relaxed"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(14,14,14,0.75)" }}
              >
                {s.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(14,14,14,0.45)" }}
          >
            {t("legal.motto")}
          </p>
          <Link
            to="/terms"
            className="text-sm uppercase tracking-[0.18em] underline-offset-4 hover:underline"
            style={{ fontFamily: "'Cinzel', serif", color: "#A07423" }}
          >
            {t("privacy.linkTerms")}
          </Link>
        </div>
      </article>
    </div>
  );
}
