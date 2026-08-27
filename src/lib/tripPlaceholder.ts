// ILUSTRAČNÁ FOTKA VÝLETU — JEDEN ZDROJ (vytiahnuté z PackMap.tsx 2026-08-25).
//
// Matej po prvom pridaní plánu: „výlet sa pridal ale nepridala sa fotka (ilustračná)". Nepridala
// sa preto, že táto funkcia žila LOKÁLNE v `PackMap.tsx` — mapa a jej karty ju volali, TRIPLIST
// o nej nevedel a kreslil miesto fotky šedý obrys hory. Ten istý výlet tak mal na dvoch
// obrazovkách dva rôzne obrázky, a na tej, kde plány naozaj žijú, ten horší.
//
// ⚠️ Nový povrch, ktorý ukazuje výlet: volaj TOTO, nekopíruj tabuľku. Placeholder sa vyberá
// STABILNE zo seedu (id výletu), aby sa pri každom prekreslení nemenil.
// + planning preview — placeholder lesa na paddleboarde by bol divný, preto per-aktivita.
const CLD = 'https://res.cloudinary.com/dz8lolmod/image/upload/f_auto,q_auto,c_fill,w_800,h_450/pack/placeholders';
const ACTIVITY_PLACEHOLDERS: Record<string, string[]> = {
  hike: [`${CLD}/hiking-1.webp`, `${CLD}/hiking-2.webp`, `${CLD}/hiking-3.webp`],
  journey: [`${CLD}/journey-1.webp`, `${CLD}/journey-2.webp`, `${CLD}/journey-3.webp`],
  picnic: [`${CLD}/picnic-1.webp`, `${CLD}/picnic-2.webp`, `${CLD}/picnic-3.webp`],
  overnight: [`${CLD}/overnight-1.webp`, `${CLD}/overnight-2.webp`, `${CLD}/overnight-3.webp`],
  skating: [`${CLD}/skating-1.webp`, `${CLD}/skating-2.webp`, `${CLD}/skating-3.webp`],
  paddleboard: [`${CLD}/paddleboard-1.webp`, `${CLD}/paddleboard-2.webp`, `${CLD}/paddleboard-3.webp`],
  // ✅ 2026-08-03 (#39): vlastné explore fotky nahraté do Cloudinary `pack/placeholders`,
  // požičané `picnic-*` zrušené. Motívy: 1 hrad-zrúcanina · 2 historické námestie ·
  // 3 kaštieľ s parkom — presne tri povrchy, kvôli ktorým explore kategória vznikla.
  // Štýl držaný na existujúcich placeholderoch (fotoreal 35 mm, zlatá hodina, bez ľudí
  // a bez psov, 1600×893) — pri dopĺňaní ďalších sa naň pozri, nehádaj ho.
  explore: [`${CLD}/explore-1.webp`, `${CLD}/explore-2.webp`, `${CLD}/explore-3.webp`],
  // ── ŠTYRI KATEGÓRIE (2026-08-27) ────────────────────────────────────────────────────────
  // Nové výlety zapisujú do `acts` kľúč KATEGÓRIE ('chill', 'sport'), nie starú aktivitu —
  // bez týchto dvoch riadkov by hľadanie nenašlo nič a piknik aj paddleboard by dostali
  // fotku lesnej túry (fallback `hike`). Žiadne nové assety: kategória si berie fotky
  // oboch aktivít, z ktorých vznikla, takže výber je širší, nie chudobnejší.
  // ⚠️ 'hike' a 'explore' vlastný riadok nepotrebujú — ich kľúč sa nezmenil.
  chill: [`${CLD}/picnic-1.webp`, `${CLD}/picnic-2.webp`, `${CLD}/picnic-3.webp`,
          `${CLD}/overnight-1.webp`, `${CLD}/overnight-2.webp`, `${CLD}/overnight-3.webp`],
  sport: [`${CLD}/skating-1.webp`, `${CLD}/skating-2.webp`, `${CLD}/skating-3.webp`,
          `${CLD}/paddleboard-1.webp`, `${CLD}/paddleboard-2.webp`, `${CLD}/paddleboard-3.webp`],
};
// vyber 1 z 3 stabilne podľa seedu (id tripu / názov) → variety naprieč kartami, ale nemení sa pri re-renderi
export function placeholderFor(actIds: string[] | undefined, seed: string): string {
  const act = (actIds && actIds.find((a) => ACTIVITY_PLACEHOLDERS[a])) || 'hike';
  const arr = ACTIVITY_PLACEHOLDERS[act] || ACTIVITY_PLACEHOLDERS.hike;
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}
