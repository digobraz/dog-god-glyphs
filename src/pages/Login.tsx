import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEV_FULL, isFullPackEmail } from "@/lib/packFlags";
import { useT } from "@/i18n/LanguageContext";
import dogyptLogo from "@/assets/dogypt-logo-gold.png";

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
  const showResend =
    status === "expired" ||
    status === "invalid" ||
    status === "network" ||
    (status === "missing" && dogIdPresent);

  return (
    <div className="dark-bg min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-8 md:mb-10" aria-label={t('login.homeAria')}>
        <img src={dogyptLogo} alt="DOGYPT" className="h-9 md:h-12 object-contain" />
      </Link>

      <article
        className="w-full max-w-md rounded-[20px] papyrus-bg border border-border/40 p-7 md:p-10 shadow-sm text-center"
        style={{ color: "#0E0E0E" }}
        aria-live="polite"
      >
        <p
          className="text-[10px] tracking-[0.4em] uppercase mb-3"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "#A07423" }}
        >
          {t('login.eyebrow')}
        </p>

        <h1
          className="text-2xl md:text-3xl font-bold uppercase mb-3 leading-tight text-balance"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.04em" }}
        >
          {copy.title}
        </h1>

        <p
          className="text-sm md:text-base leading-relaxed text-pretty"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(14,14,14,0.75)" }}
        >
          {copy.body}
        </p>

        {status === "verifying" && (
          <div className="mt-7 flex justify-center" aria-hidden="true">
            <span
              className="inline-block h-3 w-3 rounded-full animate-pulse"
              style={{ background: "#A07423" }}
            />
          </div>
        )}

        {status === "missing" && !dogIdPresent && (
          <div className="mt-7">
            {showForgot ? (
              /* ── Forgot password sub-form ── */
              <div className="flex flex-col gap-3">
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: "rgba(14,14,14,0.7)", textAlign: "center" }}>
                  {t('login.forgot.prompt')}
                </p>
                {forgotSent ? (
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#A07423", fontSize: 14, textAlign: "center" }}>
                    {t('login.forgot.sent')}
                  </p>
                ) : (
                  <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder={t('login.forgot.placeholder')}
                      required
                      className="w-full px-4 py-3 rounded-[8px] text-sm border outline-none"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: "#0E0E0E",
                        background: "rgba(255,255,255,0.6)",
                        borderColor: "rgba(160,116,35,0.4)",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={forgotSending}
                      className="px-6 py-3 rounded-[8px] uppercase text-xs tracking-[0.22em] font-bold disabled:opacity-50"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        background: "linear-gradient(180deg,#E5C16E 0%,#C99A3F 48%,#A07423 100%)",
                        color: "#0E0E0E",
                        boxShadow: "0 6px 18px rgba(160,116,35,0.4)",
                      }}
                    >
                      {forgotSending ? t('login.forgot.submitting') : t('login.forgot.submit')}
                    </button>
                  </form>
                )}
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="text-xs uppercase tracking-[0.22em] underline-offset-4 hover:underline"
                  style={{ fontFamily: "'Cinzel', serif", color: "#A07423", background: "none", border: "none", cursor: "pointer" }}
                >
                  {t('login.forgot.back')}
                </button>
              </div>
            ) : emailSent ? (
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#A07423", fontSize: 14, textAlign: "center" }}>
                {t('login.magicLink.sent')}
              </p>
            ) : (
              /* ── Primary: email + password form ── */
              <form onSubmit={handlePasswordLogin} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); setPasswordError(""); }}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-[8px] text-sm border outline-none"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "#0E0E0E",
                    background: "rgba(255,255,255,0.6)",
                    borderColor: "rgba(160,116,35,0.4)",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={e => { setPasswordInput(e.target.value); setPasswordError(""); }}
                    placeholder={t('login.password.placeholder')}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-11 rounded-[8px] text-sm border outline-none"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: "#0E0E0E",
                      background: "rgba(255,255,255,0.6)",
                      borderColor: "rgba(160,116,35,0.4)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", opacity: 0.62 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a6a2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                      {!showPassword && <line x1="3" y1="3" x2="21" y2="21" />}
                    </svg>
                  </button>
                </div>
                {passwordError && (
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: "#b91c1c", textAlign: "center" }}>
                    {passwordError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={passwordSending}
                  className="px-6 py-3 rounded-[8px] uppercase text-xs tracking-[0.22em] font-bold disabled:opacity-50"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: "linear-gradient(180deg,#E5C16E 0%,#C99A3F 48%,#A07423 100%)",
                    color: "#0E0E0E",
                    boxShadow: "0 6px 18px rgba(160,116,35,0.4)",
                  }}
                >
                  {passwordSending ? t('login.password.submitting') : t('login.password.submit')}
                </button>

                {/* Secondary links */}
                <div className="flex flex-col items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs uppercase tracking-[0.22em] underline-offset-4 hover:underline"
                    style={{ fontFamily: "'Cinzel', serif", color: "#A07423", background: "none", border: "none", cursor: "pointer" }}
                  >
                    {t('login.password.forgotPassword')}
                  </button>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-[0.22em] underline-offset-4 hover:underline"
                    style={{ fontFamily: "'Cinzel', serif", color: "rgba(14,14,14,0.45)", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => {
                      if (!emailInput.trim()) return;
                      setEmailSending(true);
                      supabase.auth.signInWithOtp({
                        email: emailInput.trim(),
                        options: { emailRedirectTo: `${window.location.origin}/login` },
                      }).then(() => { setEmailSent(true); }).finally(() => setEmailSending(false));
                    }}
                  >
                    {emailSending ? t('login.magicLink.submitting') : t('login.password.magicLinkAlt')}
                  </button>
                </div>
              </form>
            )}
            <Link
              to="/"
              className="block mt-4 text-xs uppercase tracking-[0.22em] underline-offset-4 hover:underline"
              style={{ fontFamily: "'Cinzel', serif", color: "#A07423" }}
            >
              {t('login.backHome')}
            </Link>
          </div>
        )}

        {status === "recovery" && (
          <div className="mt-7">
            {recoverySuccess ? (
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#A07423", fontSize: 14, textAlign: "center" }}>
                {t('login.recovery.success')}
              </p>
            ) : (
              <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-3">
                <div style={{ position: "relative" }}>
                  <input
                    type={showRecoveryPassword ? "text" : "password"}
                    value={recoveryPassword}
                    onChange={e => setRecoveryPassword(e.target.value)}
                    placeholder={t('login.recovery.newPasswordPlaceholder')}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-11 rounded-[8px] text-sm border outline-none"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: "#0E0E0E",
                      background: "rgba(255,255,255,0.6)",
                      borderColor: "rgba(160,116,35,0.4)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRecoveryPassword(v => !v)}
                    aria-label={showRecoveryPassword ? "Hide password" : "Show password"}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", opacity: 0.62 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a6a2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                      {!showRecoveryPassword && <line x1="3" y1="3" x2="21" y2="21" />}
                    </svg>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={recoverySending || recoveryPassword.length < 8}
                  className="px-6 py-3 rounded-[8px] uppercase text-xs tracking-[0.22em] font-bold disabled:opacity-50"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: "linear-gradient(180deg,#E5C16E 0%,#C99A3F 48%,#A07423 100%)",
                    color: "#0E0E0E",
                    boxShadow: "0 6px 18px rgba(160,116,35,0.4)",
                  }}
                >
                  {recoverySending ? t('login.recovery.submitting') : t('login.recovery.submit')}
                </button>
              </form>
            )}
          </div>
        )}

        {showResend && (
          <div className="mt-7 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resendSent}
              className="px-6 py-3 rounded-[8px] uppercase text-xs tracking-[0.22em] font-bold transition disabled:opacity-50"
              style={{
                fontFamily: "'Cinzel', serif",
                background: "linear-gradient(180deg,#E5C16E 0%,#C99A3F 48%,#A07423 100%)",
                color: "#0E0E0E",
                boxShadow: "0 6px 18px rgba(160,116,35,0.4)",
              }}
            >
              {resendSent ? t('login.resend.sent') : resending ? t('login.resend.sending') : t('login.resend.idle')}
            </button>
            <Link
              to="/"
              className="text-xs uppercase tracking-[0.22em] underline-offset-4 hover:underline"
              style={{ fontFamily: "'Cinzel', serif", color: "#A07423" }}
            >
              {t('login.backHome')}
            </Link>
          </div>
        )}

        {errorDetail && status !== "verifying" && status !== "success" && (
          <p
            className="mt-6 text-[11px] tracking-[0.18em] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "rgba(14,14,14,0.45)",
            }}
          >
            {errorDetail}
          </p>
        )}
      </article>
    </div>
  );
}
