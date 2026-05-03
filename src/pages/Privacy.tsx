import { Link } from "react-router-dom";
import dogyptLogo from "@/assets/dogypt-logo-gold.png";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Who We Are",
    body: "TODO — DOGYPT právny subjekt, sídlo, IČO, kontaktný email pre dotazy o ochrane osobných údajov.",
  },
  {
    title: "2. Data We Collect",
    body: "TODO — email pri checkout, meno psa, fotka (Cloudinary), birthday, owner gender/zodiac, platobné údaje (cez Stripe — DOGYPT karty nevidí).",
  },
  {
    title: "3. How We Use It",
    body: "TODO — generovanie heroglyph certifikátu, doručenie PDF mailom, GodsGrid zobrazenie (verejné), interný analytics o používaní flowa.",
  },
  {
    title: "4. Legal Basis (GDPR)",
    body: "TODO — plnenie zmluvy (čl. 6.1.b), súhlas pri marketing emailoch (čl. 6.1.a), oprávnený záujem pri analytics (čl. 6.1.f).",
  },
  {
    title: "5. Sharing & Sub-processors",
    body: "TODO — Stripe (platby), Cloudinary (fotky), Resend/Postmark (emaily), Supabase (DB), Vercel/Lovable (hosting). Žiadny predaj dát tretím stranám.",
  },
  {
    title: "6. Cookies & Tracking",
    body: "TODO — minimálne cookies (session, preferences), žiadne third-party tracking pixels v MVP. Plánovaný GA4/Plausible po launchi.",
  },
  {
    title: "7. Retention",
    body: "TODO — heroglyph data uchovávame trvalo (kým neexistuje žiadosť o vymazanie). Email logs 12 mesiacov.",
  },
  {
    title: "8. Your Rights",
    body: "TODO — právo na prístup, opravu, vymazanie, prenosnosť, námietku, sťažnosť na ÚOOÚ. Postup uplatnenia: email na privacy@dogypt.com (TODO doména).",
  },
  {
    title: "9. International Transfers",
    body: "TODO — niektoré sub-processory sú v USA (Stripe, Cloudinary, Resend). Spoliehame sa na Standard Contractual Clauses + DPA.",
  },
  {
    title: "10. Changes to This Policy",
    body: "TODO — zmeny oznámime mailom 30 dní vopred. Verzia + dátum účinnosti vždy hore.",
  },
  {
    title: "11. Contact",
    body: "TODO — privacy@dogypt.com, poštová adresa.",
  },
];

export default function Privacy() {
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
          Privacy Policy
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
            to="/terms"
            className="text-sm uppercase tracking-[0.18em] underline-offset-4 hover:underline"
            style={{ fontFamily: "'Cinzel', serif", color: "#A07423" }}
          >
            Terms of Service →
          </Link>
        </div>
      </article>
    </div>
  );
}
