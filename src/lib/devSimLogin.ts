import { IS_APP } from './isApp';

// ═══════════════════════════════════════════════════════════════════════════
// SIMULÁTOR: PRIHLÁSENIE BEZ MAILU (26. 11. 2026)
//
// Appka v simulátore nemá deep link, takže jej prihlasovací odkaz zvonka
// nepošleš. `bash scripts/appka/simulator.sh --login [email]` vyrobí na DEV
// jednorazový token, dev server ho podá na `/__sim-login` (vite.config.ts,
// len `serve`) a appka si ho tu pri štarte vyzdvihne.
// Telo celé za `import.meta.env.DEV` ⇒ v žiadnom builde (web, appka) neexistuje.
// ═══════════════════════════════════════════════════════════════════════════
if (import.meta.env.DEV && IS_APP) {
  void (async () => {
    const r = await fetch('/__sim-login', { cache: 'no-store' }).catch(() => null);
    if (!r?.ok) return;
    const { token_hash, to } = (await r.json().catch(() => ({}))) as { token_hash?: string; to?: string };
    if (!token_hash) return;
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'magiclink' });
    if (error) console.warn('[sim-login]', error.message);
    else location.replace(to || '/pack');
  })();
}
