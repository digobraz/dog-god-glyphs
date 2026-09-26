import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEV_FULL, isFullPackEmail } from "@/lib/packFlags";
import { useT, useLang } from "@/i18n/LanguageContext";
import { PageTopBar } from "@/components/PageTopBar";
import { FLOW_PALE_CSS } from "@/components/screens/flowPaleSkin";
import { LAPIS } from "@/components/pack/navGoldSkin";
import { PACK_HEAD, PACK_SPACE, PACK_TEXT } from "@/components/pack/packTheme";
import { LAB } from "@/lib/labTheme";

// ── ŠAT: D-BLOK + LAPIS (Matej 26. 9. 2026: „prihlasovaciu stránku musíme prerobiť
// na brand v dbloku + lapis") ─────────────────────────────────────────────────
// Stavia sa z hotových receptov heroflowu (`FLOW_PALE_CSS`): bledá stena, zlatý
// odliatok `goldFrameCSS()` ako `.hf-block`, biele pole `.hf-field`, lapisové CTA
// `.hf-cta`. Na bledom je hlavná akcia LAPIS (brand lock); zlato = konštrukcia.
// Tu je len to, čo login má navyše: štítok, nadpis karty, oko pri hesle, brána.
const LOGIN_CSS = `
.lg-col { max-width: 420px; }
.lg-login .hf-plate { gap: ${PACK_SPACE.md}px; text-align: center; }
.lg-eyebrow {
  margin: 0; font-family: ${PACK_HEAD.label.fontFamily}; font-weight: ${PACK_HEAD.label.fontWeight};
  font-size: ${PACK_HEAD.label.fontSize}px; letter-spacing: ${PACK_HEAD.label.letterSpacing};
  text-transform: uppercase; color: ${LAB.goldInk};
}
.lg-title {
  margin: 0; font-family: ${PACK_HEAD.card.fontFamily}; font-weight: 700;
  font-size: ${PACK_TEXT.h2}px; letter-spacing: ${PACK_HEAD.card.letterSpacing};
  text-transform: uppercase; line-height: 1.2; color: ${LAB.ink}; text-wrap: balance;
}
.lg-body { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: ${PACK_TEXT.body}px; line-height: 1.5; color: ${LAB.inkSoft}; text-wrap: pretty; }
.lg-stack { display: flex; flex-direction: column; gap: ${PACK_SPACE.sm}px; width: 100%; }
.lg-login form.lg-stack .hf-cta { margin-top: ${PACK_SPACE.xs}px; }
.lg-pw { position: relative; width: 100%; }
.lg-pw .hf-field { padding: 0 40px; }
/* Pole ostáva 16 px (pod 16 iPhone pri ťuknutí priblíži celú stránku); zmenšuje sa
   len placeholder, inak „Nové heslo (min. 8 znakov)" medzi okrajmi pre oko odsekne. */
.lg-pw .hf-field::placeholder { font-size: ${PACK_TEXT.label}px; }
.lg-eye {
  position: absolute; right: ${PACK_SPACE.sm}px; top: 50%; transform: translateY(-50%);
  display: flex; padding: ${PACK_SPACE.xs}px; background: none; border: none; cursor: pointer;
  color: ${LAB.goldInk}; opacity: .75;
}
.lg-eye:hover { opacity: 1; }
.lg-links { display: flex; justify-content: center; align-items: center; gap: ${PACK_SPACE.sm}px; flex-wrap: wrap; color: ${LAB.inkMuted}; }
.lg-links .hf-skip, .lg-stack > .hf-skip { font-size: ${PACK_TEXT.label}px; }
.lg-done { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: ${PACK_TEXT.body}px; line-height: 1.5; color: ${LAPIS.edge}; font-weight: 500; }
.lg-err { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: ${PACK_TEXT.micro}px; letter-spacing: .08em; text-transform: uppercase; color: ${LAB.inkMuted}; word-break: break-word; }
.lg-pulse { display: flex; justify-content: center; padding: ${PACK_SPACE.xs}px 0; }
.lg-pulse span { width: 12px; height: 12px; border-radius: 999px; background: ${LAPIS.edge}; animation: lgPulse 1.2s ease-in-out infinite; }
@keyframes lgPulse { 0%,100% { opacity: .35; transform: scale(.85); } 50% { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .lg-pulse span { animation: none; } }
.lg-gate {
  margin: ${PACK_SPACE.md}px 0 0; text-align: center; font-family: 'Space Grotesk', sans-serif;
  font-size: ${PACK_TEXT.label}px; line-height: 1.5; color: ${LAB.inkSoft};
}
.lg-gate a { color: ${LAPIS.edge}; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
`;

type Status = "verifying" | "success" | "expired" | "invalid" | "network" | "missing" | "recovery";

// Token types Supabase may hand us in ?type=. `signup` is what a brand-new buyer
// gets (their auth user is created by the purchase), so it must be honoured or
// their very first login link dies.
type OtpType = "magiclink" | "email" | "recovery" | "signup" | "invite" | "email_change";
const OTP_TYPES: OtpType[] = ["magiclink", "email", "recovery", "signup", "invite", "email_change"];

const isExpired = (msg: string) =>
  /expired|otp_expired|invalid_token|token has expired/i.test(msg);

export default function Login() {
  const t = useT();
  const { lang } = useLang();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorDetail, setErrorDetail] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // password login
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordSending, setPasswordSending] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);

  // forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // recovery (password reset)
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoverySending, setRecoverySending] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Supabase magic link callbacks may arrive in two shapes:
  //   1) Hash fragment: #access_token=...&refresh_token=...&type=magiclink
  //      → handled automatically by supabase-js detectSessionInUrl.
  //   2) Query string : ?token_hash=...&type=magiclink (PKCE / verify flow)
  //      → must be exchanged manually via verifyOtp.
  // We also accept ?token=... as a fallback alias used by older callers.
  useEffect(() => {
    let cancelled = false;
    const dogId = params.get("dogId") ?? "";
    // Email "Open My Profile" passes ?next=/pack/profile so first login lands on
    // the profile (set-password) screen. PackLayout deep-links use ?return=<path>.
    // Guard to in-app /pack paths only — never allow open redirects to external URLs.
    const nextParam = params.get("next") ?? params.get("return");
    const safeNext = nextParam && nextParam.startsWith("/pack") ? nextParam : null;
    const targetAfter = safeNext ?? (dogId ? `/pack/dogs/${dogId}` : "/pack");

    // Listen for supabase auto-processing #access_token from hash fragment.
    // supabase-js processes the hash asynchronously after createClient(),
    // so getSession() may return null even with a valid token in the URL.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY") {
        setStatus("recovery");
        return;
      }
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        setStatus("success");
        // Founder výnimka (packFlags.ts): `DEV_FULL` sa vyhodnocuje raz pri načítaní modulu.
        // Pri ČERSTVOM prihlásení bola session vtedy ešte prázdna, takže SPA navigate by
        // pustil foundera do trimmed packu (bez mapy, správ a avatara) až do ručného F5.
        // Tvrdý redirect vyhodnotí moduly znova. Týka sa VÝHRADNE účtov z allowlistu —
        // pre ostatných členov ostáva login flow nezmenený.
        if (!DEV_FULL && isFullPackEmail(session.user?.email)) {
          window.location.replace(targetAfter);
          return;
        }
        navigate(targetAfter, { replace: true });
      }
    });

    // Fallback: if supabase never fires SIGNED_IN (e.g. hash token expired), don't hang forever.
    // Only override if still "verifying" — never clobber a definitive state.
    const timeout = setTimeout(() => {
      if (!cancelled) setStatus(prev => prev === "verifying" ? "expired" : prev);
    }, 7000);

    async function verify() {
      try {
        // Fast path: session already exists (e.g. page re-visit).
        const { data: sessionData } = await supabase.auth.getSession();
        if (!cancelled && sessionData?.session) {
          setStatus("success");
          navigate(targetAfter, { replace: true });
          return;
        }

        const tokenHash = params.get("token_hash") ?? params.get("token") ?? "";
        // A first-time buyer's link is a `signup` confirmation, not a magiclink —
        // GoTrue picks the type, and verifyOtp rejects the token if we guess wrong
        // ("Email link is invalid or has expired"). Accept every type the sender
        // may legitimately issue instead of narrowing to magiclink.
        const rawType = params.get("type") ?? "magiclink";
        const typeParam = (OTP_TYPES.includes(rawType as OtpType) ? rawType : "magiclink") as OtpType;
        const hasHashToken = window.location.hash.includes("access_token=");
        const hasHashError = window.location.hash.includes("error=");

        // Recovery link: ?type=recovery — show set-new-password form.
        if (typeParam === "recovery" && !tokenHash && !hasHashToken) {
          if (!cancelled) setStatus("recovery");
          return;
        }

        if (!tokenHash && !hasHashToken) {
          if (hasHashError) {
            // Supabase redirected with error (expired / already-used OTP)
            const hashParams = new URLSearchParams(window.location.hash.slice(1));
            const errorDesc = hashParams.get("error_description") ?? hashParams.get("error") ?? "";
            if (!cancelled) {
              setErrorDetail(errorDesc);
              setStatus(isExpired(errorDesc) ? "expired" : "invalid");
            }
          } else {
            if (!cancelled) setStatus("missing");
          }
          return;
        }

        if (!tokenHash) {
          // Hash token present — supabase-js is processing it, onAuthStateChange will fire.
          return;
        }

        // PKCE / verify flow: token_hash in query params.
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: typeParam,
        });

        if (cancelled) return;

        if (error) {
          setErrorDetail(error.message);
          setStatus(isExpired(error.message) ? "expired" : "invalid");
          return;
        }
        // onAuthStateChange fires SIGNED_IN → handles redirect.
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setErrorDetail(message);
        setStatus("network");
      }
    }

    verify();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [params, navigate]);

  // Supabase pri neznámej adrese NEPOŠLE NIČ a `resetPasswordForEmail` naschvál
  // vráti úspech. Človek teda čaká na mail, ktorý nikdy nepríde, a nedozvie sa
  // prečo. `auth-no-account` ten mail pošle — a len vtedy, keď účet naozaj nie je;
  // keď je, ticho skončí a mail posiela GoTrue.
  //
  // ⚠️ Volá sa SÚBEŽNE s pôvodným volaním, nie namiesto neho, a jej výsledok sa
  //    zámerne zahadzuje: obrazovka nesmie prezradiť, či adresa účet má.
  //    Rozlíšenie by z prihlasovacieho poľa spravilo enumerátor členov svorky.
  function oznamZiadneKonto(email: string) {
    void supabase.functions
      .invoke("auth-no-account", { body: { email, lang: lang === "sk" ? "sk" : "en" } })
      .catch(() => {});
  }

  async function handleResend() {
    const dogId = params.get("dogId") ?? "";
    if (!dogId) {
      navigate("/", { replace: true });
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.functions.invoke("resend-magic-link", {
        body: { dogId },
      });
      if (error) {
        setErrorDetail(error.message ?? "Failed to resend");
      } else {
        setResendSent(true);
      }
    } catch (err) {
      setErrorDetail(err instanceof Error ? err.message : String(err));
    } finally {
      setResending(false);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email || !passwordInput) return;
    setPasswordError("");
    setPasswordSending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: passwordInput });
      if (error) {
        setPasswordError(
          error.message?.toLowerCase().includes("network")
            ? t("login.password.networkError")
            : t("login.password.error")
        );
      }
      // onAuthStateChange handles SIGNED_IN → navigate
    } catch {
      setPasswordError(t("login.password.networkError"));
    } finally {
      setPasswordSending(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    const email = forgotEmail.trim();
    if (!email) return;
    setForgotSending(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?type=recovery`,
      });
      oznamZiadneKonto(email);
      setForgotSent(true);
    } finally {
      setForgotSending(false);
    }
  }

  async function handleRecoverySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (recoveryPassword.length < 8) return;
    setRecoverySending(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: recoveryPassword });
      if (!error) {
        setRecoverySuccess(true);
        setTimeout(() => navigate("/pack", { replace: true }), 1500);
      }
    } finally {
      setRecoverySending(false);
    }
  }

  const copy = {
    title: t(`login.${status}.title`),
    body: t(`login.${status}.body`),
  };
  const dogIdPresent = !!params.get("dogId");
  const forgotView = status === "missing" && !dogIdPresent && showForgot;
  const showResend =
    status === "expired" ||
    status === "invalid" ||
    status === "network" ||
    (status === "missing" && dogIdPresent);

  const eye = (shown: boolean) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      {!shown && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );

  return (
    <div className="hf-pale lg-login flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{LOGIN_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar brandBack onBack={() => navigate("/")} backAriaLabel={t('login.homeAria')} />
      </div>

      <div className="hf-stage">
        <div className="w-full lg-col flex flex-col items-center">
          <article className="hf-block" style={{ marginTop: 0 }} aria-live="polite">
            <div className="hf-plate">
              <p className="lg-eyebrow">{t('login.eyebrow')}</p>
              {/* Zabudnuté heslo je podstav `missing` — bez prepnutia nadpisu by karta
                  hovorila PRIHLÁSENIE nad formulárom na reset. */}
              {forgotView ? (
                <>
                  <h1 className="lg-title">{t('login.password.forgotPassword')}</h1>
                  <p className="lg-body">{t('login.forgot.prompt')}</p>
                </>
              ) : (
                <>
                  <h1 className="lg-title">{copy.title}</h1>
                  <p className="lg-body">{copy.body}</p>
                </>
              )}

              {status === "verifying" && (
                <div className="lg-pulse" aria-hidden="true"><span /></div>
              )}

              {status === "missing" && !dogIdPresent && (
                showForgot ? (
                  /* ── Zabudnuté heslo ── */
                  <div className="lg-stack">
                    {forgotSent ? (
                      <p className="lg-done">{t('login.forgot.sent')}</p>
                    ) : (
                      <form onSubmit={handleForgotPassword} className="lg-stack">
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder={t('login.forgot.placeholder')}
                          required
                          autoComplete="email"
                          className="hf-field"
                        />
                        <button type="submit" disabled={forgotSending} className="hf-cta">
                          {forgotSending ? t('login.forgot.submitting') : t('login.forgot.submit')}
                        </button>
                      </form>
                    )}
                    <button type="button" onClick={() => setShowForgot(false)} className="hf-skip">
                      {t('login.forgot.back')}
                    </button>
                  </div>
                ) : emailSent ? (
                  <p className="lg-done">{t('login.magicLink.sent')}</p>
                ) : (
                  /* ── Hlavné: e-mail + heslo ── */
                  <form onSubmit={handlePasswordLogin} className="lg-stack">
                    <input
                      id="login-email"
                      type="email"
                      value={emailInput}
                      onChange={e => { setEmailInput(e.target.value); setPasswordError(""); }}
                      placeholder={t('login.magicLink.placeholder')}
                      required
                      autoComplete="email"
                      className="hf-field"
                    />
                    <div className="lg-pw">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordInput}
                        onChange={e => { setPasswordInput(e.target.value); setPasswordError(""); }}
                        placeholder={t('login.password.placeholder')}
                        required
                        autoComplete="current-password"
                        className="hf-field"
                      />
                      <button
                        type="button"
                        className="lg-eye"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {eye(showPassword)}
                      </button>
                    </div>
                    {passwordError && <p className="hf-alert">{passwordError}</p>}
                    <button type="submit" disabled={passwordSending} className="hf-cta">
                      {passwordSending ? t('login.password.submitting') : t('login.password.submit')}
                    </button>

                    <div className="lg-links">
                      <button type="button" onClick={() => setShowForgot(true)} className="hf-skip">
                        {t('login.password.forgotPassword')}
                      </button>
                      <span aria-hidden>·</span>
                      <button
                        type="button"
                        className="hf-skip"
                        onClick={() => {
                          // ⚠️ Prázdne pole NESMIE skončiť tichým `return`. Presne to sa stalo
                          //    Matejovi 15. 9. 2026 na ostrom /login: klikol a nestalo sa NIČ —
                          //    žiadna hláška, žiadne zvýraznenie. Tlačidlo, ktoré mlčí, je pre
                          //    človeka rozbité tlačidlo, aj keď kód „funguje správne".
                          if (!emailInput.trim()) {
                            setPasswordError(t('login.magicLink.needEmail'));
                            document.getElementById('login-email')?.focus();
                            return;
                          }
                          setEmailSending(true);
                          setPasswordError("");
                          // `shouldCreateUser: false` (Matej 2026-08-20: „nepustit dnu") — bez
                          // neho Supabase pri neznamom e-maile UCET VYTVORI, takze sa do /pack
                          // dostal ktokolvek: route je len auth-gated, kupu heroglyfu nekontroluje.
                          // Platiacich to nerozbije — ucet im zaklada uz `stripe-webhook`
                          // (`generateLink`), pripadne `set-pack-password`. Prvy login teda vzdy
                          // trafi existujuceho pouzivatela.
                          supabase.auth.signInWithOtp({
                            email: emailInput.trim(),
                            options: {
                              emailRedirectTo: `${window.location.origin}/login`,
                              shouldCreateUser: false,
                            },
                          }).then(({ error }) => {
                            // ⚠️ Chyba tu znamená „takú adresu nepoznáme" — a presne to
                            //    sa NESMIE zobraziť. Do 16. 9. 2026 tu stálo
                            //    `t('login.magicLink.noAccount')`, čím prihlasovacie pole
                            //    komukoľvek prezradilo, kto vo svorke je. Obrazovka teraz
                            //    hovorí v oboch prípadoch to isté; pravdu povie len mail,
                            //    ktorý pristane v tej schránke.
                            if (error) oznamZiadneKonto(emailInput.trim());
                            setEmailSent(true);
                          }).finally(() => setEmailSending(false));
                        }}
                      >
                        {emailSending ? t('login.magicLink.submitting') : t('login.password.magicLinkAlt')}
                      </button>
                    </div>
                  </form>
                )
              )}

              {status === "recovery" && (
                recoverySuccess ? (
                  <p className="lg-done">{t('login.recovery.success')}</p>
                ) : (
                  <form onSubmit={handleRecoverySubmit} className="lg-stack">
                    <div className="lg-pw">
                      <input
                        type={showRecoveryPassword ? "text" : "password"}
                        value={recoveryPassword}
                        onChange={e => setRecoveryPassword(e.target.value)}
                        placeholder={t('login.recovery.newPasswordPlaceholder')}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="hf-field"
                      />
                      <button
                        type="button"
                        className="lg-eye"
                        onClick={() => setShowRecoveryPassword(v => !v)}
                        aria-label={showRecoveryPassword ? "Hide password" : "Show password"}
                      >
                        {eye(showRecoveryPassword)}
                      </button>
                    </div>
                    <button type="submit" disabled={recoverySending || recoveryPassword.length < 8} className="hf-cta">
                      {recoverySending ? t('login.recovery.submitting') : t('login.recovery.submit')}
                    </button>
                  </form>
                )
              )}

              {showResend && (
                <div className="lg-stack">
                  <button type="button" onClick={handleResend} disabled={resending || resendSent} className="hf-cta">
                    {resendSent ? t('login.resend.sent') : resending ? t('login.resend.sending') : t('login.resend.idle')}
                  </button>
                  <Link to="/" className="hf-skip">{t('login.backHome')}</Link>
                </div>
              )}

              {errorDetail && status !== "verifying" && status !== "success" && (
                <p className="lg-err">{errorDetail}</p>
              )}
            </div>
          </article>

          {/* Brána pre každého, kto sem príde bez heroglyfu (26. 9. 2026). Rovnaká
              pre všetkých — obrazovka nesmie prezradiť, či adresa u nás je; DOGS
              dostanú rozdiel mailom (`auth-no-account`, karta `no-account-dogs`). */}
          {status === "missing" && !dogIdPresent && (
            <p className="lg-gate">
              {t('login.gate.line')}{' '}
              <Link to="/heroglyph">{t('login.gate.cta')}</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
