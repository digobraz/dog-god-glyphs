import { Link } from "react-router-dom";
import dogyptLogo from "@/assets/dogypt-logo-gold.png";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Who We Are",
    body: "DOGYPT s.r.o., a Slovak limited liability company registered in the Commercial Register (IČO 54 444 594), with its registered seat at Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovakia. Throughout these Terms we refer to ourselves as “DOGYPT”, “we”, or “us”, and to you as “you” or “Member”. By using dogypt.com, the HEROGLYPH flow, or any related service (together, the “Service”) you agree to these Terms. Effective date: 4 May 2026.",
  },
  {
    title: "2. Eligibility",
    body: "You must be at least 16 years old to use the Service. By creating an account or completing a purchase you confirm that you are 16+, that any information you provide is true, and that your use of the Service is lawful in the country where you live.",
  },
  {
    title: "3. Account & Pack Membership",
    body: "Access is granted through a magic link sent to your email; no password is stored. Your account is personal to you — please do not share access. We may suspend or close accounts that abuse the Service, harass other Members, or violate these Terms. You can request deletion of your account at any time by emailing privacy@dogypt.com.",
  },
  {
    title: "4. Heroglyph & Digital Goods",
    body: "What you purchase is a digital good: a personal HEROGLYPH (a unique symbolic certificate), a PDF version of that certificate, your dog’s entry in the public GodsGrid, and ongoing access to your Pack profile. We grant you a personal, non-transferable, non-exclusive licence to use these digital goods for non-commercial personal use. Nothing physical is shipped. Reproduction, resale, or commercial exploitation of HEROGLYPH artwork or assets requires our prior written consent.",
  },
  {
    title: "5. Payments",
    body: "Payments are processed by Stripe Payments Europe, Ltd. We never see or store your full card details. Prices are shown in the currency at checkout (default USD); any applicable VAT is calculated and displayed before you pay. The order you confirm at checkout is the order we deliver — we will not change scope or price after the fact.",
  },
  {
    title: "6. Refunds & Right of Withdrawal",
    body: "Under EU Directive 2011/83/EU consumers normally have 14 days to withdraw from a distance contract. Because the HEROGLYPH is delivered as digital content immediately after payment, by clicking “Pay” you give your express prior consent to immediate performance and acknowledge that you thereby lose your right of withdrawal as soon as delivery begins (Art. 16(m) of the Directive). If something on our side goes wrong — a broken file, a duplicate charge, a cancelled order — write to support@dogypt.com within 14 days and we will refund or re-deliver, no questions asked.",
  },
  {
    title: "7. Acceptable Use",
    body: "Don’t upload anything you don’t have the right to upload. That includes other people’s photos, copyrighted material, or content depicting cruelty, illegal activity, or sexual content involving minors. Don’t harass, impersonate, or threaten other Members. Don’t scrape, mass-download, reverse-engineer, or attempt to disrupt the Service. We may remove content or accounts that break these rules, with or without notice.",
  },
  {
    title: "8. Liability & Disclaimers",
    body: "The HEROGLYPH is a symbolic, ceremonial product — it is not veterinary, medical, behavioural, or breeding advice. The Service is provided “as is”. To the maximum extent allowed by Slovak and EU law, our total liability for any claim arising from the Service is limited to the amount you paid us in the 12 months before the claim. Nothing here limits liability for fraud, gross negligence, or rights that cannot be waived under applicable law.",
  },
  {
    title: "9. Changes to These Terms",
    body: "We may update these Terms as the Service grows. Material changes will be announced by email at least 30 days before they take effect. Minor clarifications take effect on publication. Continued use of the Service after the effective date means you accept the new Terms. Older versions are kept on file and available on request.",
  },
  {
    title: "10. Governing Law & Disputes",
    body: "These Terms are governed by the laws of the Slovak Republic, excluding its conflict-of-law rules. Disputes that cannot be resolved informally fall under the jurisdiction of the competent Slovak courts at our registered seat. EU consumers may also use the European Online Dispute Resolution platform at https://ec.europa.eu/consumers/odr.",
  },
  {
    title: "11. Contact",
    body: "General questions: info@dogypt.com · Privacy & data requests: privacy@dogypt.com · Refunds & support: support@dogypt.com · Postal: DOGYPT s.r.o., Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovakia.",
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
