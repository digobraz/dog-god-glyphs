import { Link } from "react-router-dom";
import dogyptLogo from "@/assets/dogypt-logo-gold.png";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Introduction",
    body: "TODO — kto je DOGYPT (právny subjekt, sídlo, IČO), čo je toto za dokument, kedy nadobúda účinnosť.",
  },
  {
    title: "2. Eligibility",
    body: "TODO — kto môže používať službu (vek 16+, územie, zákonnosť).",
  },
  {
    title: "3. Account & Pack Membership",
    body: "TODO — vznik účtu cez magic link, povinnosti používateľa, zákaz zdieľania prístupu, ukončenie členstva.",
  },
  {
    title: "4. Heroglyph & Digital Goods",
    body: "TODO — čo používateľ kupuje (digitálny certifikát, PDF, GodsGrid záznam), licencia, čo NIE je súčasťou (žiadny fyzický produkt).",
  },
  {
    title: "5. Payments",
    body: "TODO — Stripe ako spracovateľ, mena, zdanenie, zákazka definovaná pred platbou.",
  },
  {
    title: "6. Refunds",
    body: "TODO — politika vrátenia (digitálny obsah – right of withdrawal podľa EU smernice 2011/83/EU vrátane súhlasu so začatím poskytovania pred uplynutím lehoty).",
  },
  {
    title: "7. Acceptable Use",
    body: "TODO — zákaz nahrávania nezákonného obsahu, fotiek bez súhlasu, harassment voči iným členom packu.",
  },
  {
    title: "8. Liability & Disclaimers",
    body: "TODO — žiadna garancia presnosti heroglyph schémy ako veterinárnej či zdravotnej rady, limit zodpovednosti.",
  },
  {
    title: "9. Changes to Terms",
    body: "TODO — DOGYPT môže meniť podmienky, oznámi 30 dní vopred mailom, pokračovanie v používaní = súhlas.",
  },
  {
    title: "10. Governing Law & Disputes",
    body: "TODO — slovenské právo, príslušný súd, alternatívne riešenie sporov.",
  },
  {
    title: "11. Contact",
    body: "TODO — email, poštová adresa.",
  },
];

export default function Terms() {
  return (
    <div className="dark-bg min-h-screen flex flex-col items-center py-10 md:py-16 px-4">
      <Link to="/" className="mb-8 md:mb-10">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-14 object-contain" />
      </Link>

      <article
        className="w-full max-w-3xl rounded-[24px] papyrus-bg border border-border/40 p-6 md:p-12 shadow-sm"
        style={{ color: "#0E0E0E" }}
      >
        <p
          className="text-[10px] tracking-[0.4em] uppercase mb-3"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "#A07423" }}
        >
          DOGYPT · Legal
        </p>
        <h1
          className="text-3xl md:text-5xl font-bold uppercase mb-2 leading-tight"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.02em" }}
        >
          Terms of Service
        </h1>
        <p
          className="text-xs uppercase tracking-[0.2em] mb-10"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(14,14,14,0.5)" }}
        >
          Last updated: TODO · Draft (placeholder)
        </p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
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
            DOGYPT · In DOG We Trust
          </p>
          <Link
            to="/privacy"
            className="text-sm uppercase tracking-[0.18em] underline-offset-4 hover:underline"
            style={{ fontFamily: "'Cinzel', serif", color: "#A07423" }}
          >
            Privacy Policy →
          </Link>
        </div>
      </article>
    </div>
  );
}
