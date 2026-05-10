import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import dogyptLogo from "@/assets/dogypt-logo-gold.png";

type Status = "verifying" | "success" | "expired" | "invalid" | "network" | "missing";

const COPY: Record<Status, { title: string; body: string }> = {
  verifying: {
    title: "Opening the Gate",
    body: "Verifying your magic link…",
  },
  success: {
    title: "Welcome Back",
    body: "Redirecting you to your pack…",
  },
  expired: {
    title: "Link Expired",
    body: "Magic links are short-lived. Request a fresh one and we will send it to your inbox.",
  },
  invalid: {
    title: "Link Not Recognised",
    body: "We could not verify this link. It may have already been used or copied incorrectly.",
  },
  network: {
    title: "Connection Hiccup",
    body: "We could not reach the temple. Check your connection and try again.",
  },
  missing: {
    title: "No Token Found",
    body: "This page expects a magic link from your email. Check your inbox for the latest one.",
  },
};

const isExpired = (msg: string) =>
  /expired|otp_expired|invalid_token|token has expired/i.test(msg);

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorDetail, setErrorDetail] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Supabase magic link callbacks may arrive in two shapes:
  //   1) Hash fragment: #access_token=...&refresh_token=...&type=magiclink
  //      → handled automatically by supabase-js detectSessionInUrl.
  //   2) Query string : ?token_hash=...&type=magiclink (PKCE / verify flow)
  //      → must be exchanged manually via verifyOtp.
  // We also accept ?token=... as a fallback alias used by older callers.
  useEffect(() => {
    let cancelled = false;
    const dogId = params.get("dogId") ?? "";
    const targetAfter = dogId ? `/pack/dogs/${dogId}` : "/pack";

    // Listen for supabase auto-processing #access_token from hash fragment.
    // supabase-js processes the hash asynchronously after createClient(),
    // so getSession() may return null even with a valid token in the URL.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        setStatus("success");
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
        const typeParam = (params.get("type") ?? "magiclink") as "magiclink" | "email";
        const hasHashToken = window.location.hash.includes("access_token=");
        const hasHashError = window.location.hash.includes("error=");

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

  const copy = COPY[status];
  const dogIdPresent = !!params.get("dogId");
  const showResend =
    status === "expired" ||
    status === "invalid" ||
    status === "network" ||
    (status === "missing" && dogIdPresent);

  return (
    <div className="dark-bg min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-8 md:mb-10" aria-label="DOGYPT home">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-14 object-contain" />
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
          DOGYPT · Pack Access
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
              {resendSent ? "Magic link sent" : resending ? "Sending…" : "Resend magic link"}
            </button>
            <Link
              to="/"
              className="text-xs uppercase tracking-[0.22em] underline-offset-4 hover:underline"
              style={{ fontFamily: "'Cinzel', serif", color: "#A07423" }}
            >
              Back home
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
