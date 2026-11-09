// JEDNOTNÝ KRUH hornej lišty — SOS, správy, upozornenia (Matej 8. 11. 2026, továreň `plany/ikonky/`, verzia C).
// 🔁 Bez kruhu, kresba väčšia (Matej 8. 11. 2026: *„nedávaj do kruhu a tým ich mierne zväčši"*). Zatiaľ len appka (APP_NEW).
// 🔁 Kresba o 10 % menšia (Matej 8. 11. 2026 večer: *„ikonky v hornom paneli zmenši o 10 %"*), plocha na ťuk ostáva.
// 🔁 Veľkosť ako lupa a AINUBIS (Matej 9. 11. 2026, po teste: *„zmenši horné ikonky (správy, sos.. šípka vzad...)
//    do veľkosti lupy, ainubisa“*). Lupa FEEDu = 30 px samolepka (kresba ~27), AINUBIS = disk 36. Kresba tu 28, krabica
//    tlačidla 32 (rad má 40, kapsula 32 + 2×4 = 40). Dotyk ostáva 44 px: priehľadný presah `TOP_HIT_PX` vo vnútri tlačidla.
export const TOP_CIRCLE_PX = 36; // disk AINUBISA (HubAinubis), nie ikonky
export const TOP_BTN_PX = 32;
export const TOP_HIT_PX = 44;
const TOP_ART_PX = 28;

/** KAPSULA SOS + správy + upozornenia — JEDINÝ zdroj geometrie (Matej 9. 11. 2026: *„obálka presne v strede, rovnomerné
 *  rozostupy, tá istá pilulka na všetkých stránkach"*). Tri rovnaké tlačidlá `TOP_BTN_PX` s rovnakým rozostupom `gap`
 *  a súmerným `padX` ⇒ stredné tlačidlo (správy) je presne v strede. Výška = TOP_BTN_PX + 2×border = 36 = disk AINUBISA.
 *  Kreslí ju VÝLUČNE `<TopActions />` (TopActions.tsx) — žiadna obrazovka si kapsulu nekreslí sama (nový povrch = ten
 *  komponent). Rozostup medzi tlačidlami musí byť rovnaký aj vnútri `PackNotifications` (správy ↔ zvonček), preto ho
 *  číta aj ten súbor. Čísla sú z `PACK_SPACE` (8). */
export const TOP_CAPSULE = { gap: 8, padX: 8, border: 2 } as const;

export function TopCircle({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={className}
      style={{ width: TOP_BTN_PX, height: TOP_BTN_PX, display: 'grid', placeItems: 'center' }}
    >
      {/* Priehľadný presah dotykovej plochy na 44 px — rodičovské tlačidlo je `position:relative`. */}
      <span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', width: TOP_HIT_PX, height: TOP_HIT_PX, transform: 'translate(-50%,-50%)' }} />
      <img src={`/icons/kruhy/${name}.webp`} alt="" draggable={false} style={{ width: TOP_ART_PX, height: TOP_ART_PX, objectFit: 'contain', display: 'block' }} />
    </span>
  );
}
