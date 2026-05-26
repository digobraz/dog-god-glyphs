import { Link } from "react-router-dom";
import dogyptLogo from "@/assets/dogypt-logo-gold.png";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Who We Are",
    body: "DOGYPT s.r.o., a Slovak limited liability company (IČO 54 444 594), registered seat Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovakia. We are the controller of the personal data described below. For any privacy-related question write to privacy@dogypt.com. We have not appointed a Data Protection Officer because our processing does not meet the GDPR Art. 37 thresholds. Effective date: 4 May 2026.",
  },
  {
    title: "2. Data We Collect",
    body: "When you use the HEROGLYPH flow we collect: your email address, your dog’s name, the photo of your dog you upload (stored on Cloudinary), the symbolic answers you select (gender, colour, fate, bloodline, character, your zodiac, your initial), and your dog’s birth date if provided. Stripe collects your payment details directly — we receive only a payment confirmation, the last 4 digits of the card, and country. Our servers automatically log technical data (IP address, user-agent, request time) for security and abuse prevention.",
  },
  {
    title: "3. How We Use It",
    body: "We use your data to: generate and deliver your HEROGLYPH certificate; send you the certificate email and a small number of follow-up Pack messages; display your dog’s entry in the public GodsGrid (only the dog’s name, photo, and HEROGLYPH symbol appear publicly — never your email, your name, or your private code); operate, secure, and improve the Service; comply with legal obligations such as accounting and consumer protection.",
  },
  {
    title: "4. Legal Basis (GDPR)",
    body: "We rely on Art. 6(1)(b) GDPR (performance of a contract) for the HEROGLYPH delivery and Pack membership; Art. 6(1)(a) (consent) for any marketing email beyond service messages — you can withdraw at any time; Art. 6(1)(f) (legitimate interest) for security logging, abuse prevention, and aggregate analytics; and Art. 6(1)(c) (legal obligation) for tax and accounting records.",
  },
  {
    title: "5. Sharing & Sub-processors",
    body: "We do not sell your data. We share it only with sub-processors that help us run the Service: Stripe Payments Europe, Ltd. (payments) · Cloudinary Ltd. (photo storage and delivery) · Resend, Inc. (transactional email) · Supabase, Inc. (database and authentication) · WebSupport s.r.o. (web hosting) · GitHub, Inc. (deployment pipeline). Each sub-processor is bound by its own data processing agreement.",
  },
  {
    title: "6. Cookies & Tracking",
    body: "We use only the cookies and local storage we need to make the Service work (session, language, your in-progress HEROGLYPH selections). We do not run third-party advertising or cross-site tracking pixels. If we add privacy-friendly product analytics (such as Plausible) we will update this section before turning them on.",
  },
  {
    title: "7. Retention",
    body: "Your HEROGLYPH and Pack profile are kept for as long as your account exists, because the GodsGrid is the lifetime registry of every member of the Pack. Transactional email logs are kept for 12 months for support and fraud prevention. Accounting records are kept for 10 years as required by Slovak law (Act 431/2002 Coll.). When you ask us to delete your account, we remove personal identifiers within 30 days and keep only the legally required minimum.",
  },
  {
    title: "8. Your Rights",
    body: "Under GDPR you have the right to access your data, to correct it, to have it erased, to restrict or object to processing, to data portability, and to withdraw consent at any time. You can also lodge a complaint with the Slovak supervisory authority — Úrad na ochranu osobných údajov SR, Hraničná 12, 820 07 Bratislava 27, statny.dozor@pdp.gov.sk. To exercise any of these rights write to privacy@dogypt.com — we reply within 30 days.",
  },
  {
    title: "9. International Transfers",
    body: "Some of our sub-processors (Stripe, Cloudinary, Resend, Supabase, GitHub) operate servers outside the EU/EEA, mostly in the United States. Where personal data leaves the EU/EEA we rely on the European Commission’s Standard Contractual Clauses, the EU–US Data Privacy Framework, and additional safeguards required by GDPR Chapter V.",
  },
  {
    title: "10. Changes to This Policy",
    body: "We will tell you about material changes by email at least 30 days before they take effect. Minor edits — typos, sub-processor name updates, new contact addresses — take effect on publication. The current version and date are always at the top of this page; older versions are available on request.",
  },
  {
    title: "11. Contact",
    body: "Privacy & data requests: privacy@dogypt.com · General questions: info@dogypt.com · Postal: DOGYPT s.r.o., Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovakia.",
  },
];

export default function Privacy() {
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
          Last updated: 4 May 2026 · v1.0
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
