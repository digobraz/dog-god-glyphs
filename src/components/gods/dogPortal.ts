/**
 * PORTÁL — dlaždica s iskrami, jediná CTA celého webu.
 *
 * Matej 27. 8. 2026: *„to CTA nahraď tým, čo už máme na globe = wall bude mať
 * tú istú CTA, teda dlaždicu s iskrami namiesto tej, čo tam je teraz."*
 *
 * 🔴 PRETO JE TO SAMOSTATNÝ MODUL A NIE DVE KÓPIE. Guľa je React (DogPlanetLab),
 * stena je VANILLA DOM (CLAUDE.md, pravidlo 12) — dva renderery tej istej
 * dlaždice by sa rozišli pri prvej úprave. Tvar preto stavia JEDNA funkcia
 * `buildPortal()`, ktorá vracia hotový prvok; React ho iba pripne.
 *
 * ⚠️ NEMENNÉ PRAVIDLÁ (porušenie = návrat sekania, viď plany/zadanie-portal-onepage.md):
 *  1. Animuje sa výhradne opacity a transform. Žiadny animovaný box-shadow,
 *     žiadny filter blur na veľkej ploche, žiadny backdrop-filter.
 *  2. Iskry kreslí PLÁTNO, nie DOM — pod portálom sa točí guľa s ~1000 dlaždicami.
 *  3. Iskry idú z TEJ ISTEJ rAF slučky, ktorá už na stránke beží. Druhá slučka by
 *     si s ňou konkurovala o snímok, preto `createSparks()` vracia iba `frame(dt)`
 *     a slučku si drží volajúci.
 *  4. Rozmer plátna sa premeriava v každom snímku z offsetWidth (šírku riadi
 *     CSS clamp), a cez ctx.setTransform, nikdy ctx.scale (tá sa nasčítava).
 *  5. SQ_N a --ph-r patria k sebe — iskry obiehajú po superelipse, nie po kružnici.
 */

/**
 * Vzdialenosť obrysu portálu od stredu pod uhlom `th`.
 * Portál je ZAOBLENÝ ŠTVOREC, takže iskry nesmú obiehať po kružnici — v rohoch
 * by prechádzali vnútri jadra a pri hranách by od neho odskočili. Superelipsa
 * |x/a|⁴ + |y/a|⁴ = 1 sedí na border-radius 24 % (roh vyjde 1,19× ďalej než
 * stred hrany, CSS dáva 1,21×). Keď sa mení zaoblenie, musí sa aj SQ_N.
 */
const SQ_N = 4;
function bndPortal(th: number, a: number) {
  const c = Math.abs(Math.cos(th));
  const s = Math.abs(Math.sin(th));
  return a / Math.pow(Math.pow(c, SQ_N) + Math.pow(s, SQ_N), 1 / SQ_N);
}

/**
 * Odstup obežnej dráhy iskier od hrany jadra (v layout px, meria sa v strede hrany).
 * Odmerané: vnútorný okraj koróny leží prakticky NA tomto polomere, takže je to
 * jediná a priama páka na šírku viditeľnej medzery. Matej 27. 8. 2026:
 * *„ten priestor… zmenšiť ho o 50 %"* → 7 px → 4 px.
 * ⚠️ NIŽŠIE UŽ NIE. Biely lem začína 5 px za hranou jadra; pri 2 px sa naň iskry
 * položili a lem prestal byť vidieť — odskúšané a zamietnuté.
 */
const SPARK_GAP = 4;

/** Šírka portálu, na ktorej boli iskry vyladené (guľa). Slúži ako mierka hustoty. */
const SPARK_REF_W = 118;

/**
 * O koľko plátno presahuje jadro na každú stranu.
 * 🔴 PEVNÝ POČET PIXELOV, NIE NÁSOBOK ŠÍRKY — a je to výkonové rozhodnutie, nie
 * kozmetika. Dolet vyhodenej iskry je ABSOLÚTNY (rýchlosť v px/s, tlmená), takže
 * s väčším portálom NERASTIE. Kým tu stál násobok 2,35×, malo plátno pri 260 px
 * dlaždici na stene 611 px a jeho čistenie a skladanie v každom snímku zrazilo
 * stenu zo 60 na 30 fps (odmerané: bez portálu 16,7 ms, s ním 33,3 ms).
 * Pri 118 px vychádza 278 px, teda presne to, čo dávalo pôvodných 2,35×.
 */
const SPARK_MARGIN = 80;


/** Vypnuté animácie = pokojný portál. Číta sa RAZ, nie v každom snímku. */
export const PORTAL_REDUCE_MOTION = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type SparkRt = {
  ctx: CanvasRenderingContext2D | null; host: HTMLElement | null; hero: HTMLElement | null;
  S: number; pw: number; r0: number; next: number;
  em: { w: number; a: number }[];
  ps: { on: boolean; a: number; h: number; vr: number; L: number; t: number; T: number; sz: number; tr: number[] }[];
};

/**
 * Iskry portálu. Model: šesť zdrojov obieha po obryse a sype iskry; iskra si drží
 * MOMENT HYBNOSTI, takže keď ju vyhodí von, spomalí sa a ohne dozadu — pri
 * konštantnej uhlovej rýchlosti by letela rovno a bola by z toho hviezdica lúčov.
 * Tretina iskier vzniká kdekoľvek po obryse, inak koróna horí len tam, kde práve
 * stoja zdroje.
 *
 * ⚠️ Vracia LEN `frame(dt)`. Slučku si drží volajúci — viď pravidlo 3 hore.
 */
export function createSparks(canvas: HTMLCanvasElement, opts: { density?: number } = {}) {
  /** Násobič hustoty koróny. 1 = guľa (vyladené). Menej = jemnejšia koróna. */
  const density = opts.density ?? 1;
  const rt: SparkRt = { ctx: null, host: null, hero: null, S: 0, pw: 0, r0: 0, next: 0, em: [], ps: [] };
  const frame = (dt: number) => {
    const cv = canvas;
    if (!cv) return;
    const R = rt;
    if (!R.ctx) {
      R.ctx = cv.getContext('2d');
      if (!R.ctx) return;
      R.host = cv.parentElement as HTMLElement;
      R.hero = cv.closest('.planet-hero') as HTMLElement | null;
      R.em = [1.15, -0.78, 1.62, -1.28, 0.92, -1.75].map((w, i) => ({ w, a: i * 1.1 }));
      // Strop častíc rastie s tou istou mierkou ako sadzba — inak by pri veľkom
    // portáli sadzba narazila do stropu a koróna by sa zase preriedila.
    // Zhora je zastropovaný, aby veľká dlaždica nezožrala snímok.
    const cap = Math.max(80, Math.round(620 * density));
    R.ps = Array.from({ length: cap }, () => ({ on: false, a: 0, h: 0, vr: 0, L: 0, t: 0, T: 0, sz: 1, tr: [] }));
    }
    // Zhasnutý portál sa nekreslí. OnePage zapisuje priehľadnosť hero bloku
    // INLINE pri scrolle, takže sa dá prečítať bez `getComputedStyle`.
    if (R.hero && R.hero.style.opacity === '0.000') return;

    // ⚠️ Rozmer sa premeriava v KAŽDOM snímku, nie raz pri vzniku. Šírku portálu
    // riadi CSS (`clamp`), takže pri zmene okna by sa iskry s ním rozišli —
    // presne to sa stalo v labe. `offsetWidth` je lacné čítanie, kým sa v slučke
    // do layoutu nič nezapisuje.
    const pw = R.host ? R.host.offsetWidth : 0;
    if (!pw) return;
    if (Math.abs(pw - R.pw) > 0.5) {
      R.pw = pw;
      const S = Math.round(pw + 2 * SPARK_MARGIN);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      R.S = S;
      cv.width = S * dpr; cv.height = S * dpr;
      cv.style.width = S + 'px'; cv.style.height = S + 'px';
      // setTransform, nie scale — scale sa NAsčítava a po druhej zmene veľkosti
      // by bolo všetko dvojnásobne veľké.
      R.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R.ctx.lineCap = 'round';
      R.r0 = pw / 2 + SPARK_GAP;
    }

    const ctx = R.ctx;
    const S = R.S;
    const cx = S / 2, cy = S / 2;
    ctx.clearRect(0, 0, S, S);

    R.em.forEach(e => { e.a += e.w * dt; });
    // ⚠️ SADZBA JE ABSOLÚTNA, NEŠKÁLUJE SA S VEĽKOSŤOU — a je to rozhodnutie
    // z dvoch nezávislých strán.
    //  · VZHĽAD: Matej 27. 8. 2026, keď portál prvýkrát videl na stene:
    //    *„na WALLE treba razantne upraviť zo žiari aj celkovo iskrenia, je to
    //    predsa len väčšia dlaždica… prispôsobiť to okoliu."* Väčšia dlaždica
    //    NECHCE viac iskier; koróna má byť vzhľadom na ňu jemnejšia.
    //  · VÝKON: kolo, kde sadzba rástla s obvodom (2,2× pri 260 px), stálo
    //    13 000 ťahov na snímok a zrazilo stenu zo 60 na 30 fps — odmerané
    //    inštrumentovaním ctx.stroke, nie odhadnuté.
    // Násobič `density` si preto určuje POVRCH, nie veľkosť.
    R.next += 560 * density * dt;
    while (R.next >= 1) {
      R.next -= 1;
      const p = R.ps.find(q => !q.on);
      if (!p) break;
      const e = R.em[(Math.random() * R.em.length) | 0];
      const spread = Math.random() < 0.36;
      const base = spread ? Math.random() * 6.2832 : e.a;
      p.on = true;
      p.a = base + (Math.random() - 0.5) * 0.14;
      p.h = Math.random() * 4;
      const rr = bndPortal(p.a, R.r0) + p.h;
      p.L = e.w * (0.95 + Math.random() * 0.85) * rr * rr;
      // Tečná dráha musí byť DLHŠIA než radiálna, inak z obrysu vyjde hviezdica
      // rovných lúčov namiesto ohňa. Preto sa vyhadzuje len ~18 % iskier.
      const flung = Math.random() > 0.8;
      const reach = spread ? 0.55 : 1;
      p.vr = (flung ? 66 + Math.random() * 108 : 9 + Math.random() * 34) * reach;
      p.t = 0;
      p.T = flung ? 0.38 + Math.random() * 0.5 : 0.55 + Math.random() * 1.05;
      p.sz = Math.random() < 0.12 ? 2.8 : 1.05 + Math.random() * 1.0;
      p.tr.length = 0;
    }

    for (const p of R.ps) {
      if (!p.on) continue;
      p.t += dt;
      if (p.t >= p.T) { p.on = false; p.tr.length = 0; continue; }
      p.h += p.vr * dt;
      p.vr *= Math.pow(0.3, dt);
      const rr = bndPortal(p.a, R.r0) + p.h;
      p.a += (p.L / (rr * rr)) * dt;
      const x = cx + Math.cos(p.a) * rr;
      const y = cy + Math.sin(p.a) * rr;
      p.tr.unshift(x, y);
      if (p.tr.length > 28) p.tr.length = 28;

      const k = 1 - p.t / p.T;
      const n = p.tr.length / 2;
      if (n > 1) {
        // Podťah pod celým chvostom NARAZ: po segmentoch sa zaoblené konce
        // prekrývajú v každom kĺbe a z iskry sú navlečené korálky.
        ctx.beginPath();
        ctx.moveTo(p.tr[0], p.tr[1]);
        for (let i = 1; i < n; i++) ctx.lineTo(p.tr[i * 2], p.tr[i * 2 + 1]);
        ctx.strokeStyle = `rgba(110,74,18,${(k * 0.34).toFixed(3)})`;
        ctx.lineWidth = p.sz * 1.7 + 1;
        ctx.stroke();
      }
      for (let i = n - 1; i > 0; i--) {
        const seg = 1 - i / n;
        const al = k * (0.3 + 0.7 * seg);
        if (al < 0.015) continue;
        ctx.beginPath();
        ctx.moveTo(p.tr[i * 2], p.tr[i * 2 + 1]);
        ctx.lineTo(p.tr[i * 2 - 2], p.tr[i * 2 - 1]);
        ctx.strokeStyle = seg > 0.86
          ? `rgba(255,255,255,${(al * 0.95).toFixed(3)})`
          : (seg > 0.34
            ? `rgba(255,233,168,${(al * 0.9).toFixed(3)})`
            : `rgba(201,154,63,${(al * 0.7).toFixed(3)})`);
        ctx.lineWidth = p.sz * (0.55 + seg * 0.85);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, p.sz * 0.6, 0, 6.2832);
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, k).toFixed(3)})`;
      ctx.fill();
    }
  };

  return { frame };
}


/** Hand-drawn plus z brand kitu (plus-hand-drawn-sign-svgrepo-com).
 *  Kreslené + má rukopis, ktorý dva CSS obdĺžniky nedajú. */
const PLUS_SVG = `<svg viewBox="0 0 414.312 414.312"><path d="M398.932,139.543l-1.133-0.472l-0.944-0.802c-3.316-2.834-7.495-4.268-12.441-4.268H272.546l-0.346-7.432 c-0.69-14.637-1.219-29.28-1.741-43.922c-0.736-20.367-1.493-41.423-2.697-62.075c-0.73-12.355-9.855-18.055-18.158-19.266 l-1.158-0.261C246.12,0.333,244.084,0,242.047,0h-97.71c-10.364,0-15.102,5.949-17.25,10.936l-0.754,1.737l-1.465,1.201 c-4.192,3.443-6.287,8.336-6.23,14.543c0.35,37.719,4.222,75.309,7.967,107.107l0.957,8.097l-37.133,2.724 c-19.999,1.47-39.991,2.943-59.991,4.377c-3.389,0.244-6.416,1.161-9.244,2.793l-0.889,0.515l-0.995,0.264 c-8.765,2.351-15.125,10.494-15.125,19.355v5.583c0,3.031,0.805,6.094,2.397,9.11l0.754,1.427l0.114,1.609 c2.123,27.218,2.303,54.68,2.308,82.771c0,13.441,10.077,17.356,14.414,18.418l0.937,0.289c2.48,0.954,4.951,1.411,7.561,1.411 h102.885l0.17,7.622c0.267,11.827,0.665,23.648,1.066,35.465c0.635,18.591,1.29,37.815,1.384,56.803 c0.066,13.192,9.884,17.219,14.106,18.342l0.919,0.31c2.509,1.01,5.091,1.503,7.889,1.503h94.913c5.474,0,9.973-1.742,13.391-5.18 l1.538-1.523c3.443-3.423,5.189-7.932,5.189-13.416c-0.005-29.178-0.208-63.576-1.676-97.37l-0.355-8.14h113.128 c12.659,0,18.098-9.1,18.981-17.616l0.183-1.777l0.935-1.523c1.889-3.062,2.812-6.454,2.812-10.364V156.904 C410.118,146.396,404.045,141.658,398.932,139.543z M369.885,248.455H253.219c-15.234,0-18.316,12.599-18.905,16.463l-0.3,1.25 c-0.792,2.427-1.097,4.879-0.935,7.5c2.118,34.042,2.569,67.349,2.722,92.561l0.046,7.846h-57.706l-0.208-7.586 c-0.262-9.303-0.584-18.616-0.911-27.919c-0.64-18.332-1.305-37.282-1.404-56c-0.01-1.752-0.249-3.483-0.759-5.454l-0.274-1.076 l0.035-1.112c0.193-6.129-1.825-11.837-5.527-15.665c-3.359-3.474-7.929-5.23-13.591-5.23H49.942l-0.084-7.714 c-0.17-16.849-0.8-33.301-1.866-48.906l-0.536-7.749l36.409-2.671c19.974-1.473,39.941-2.938,59.908-4.373 c1.731-0.127,3.458-0.479,5.423-1.109l1.369-0.437l1.439,0.084c6.251,0.375,11.882-1.612,15.059-5.215 c2.668-3.021,3.687-7.223,3.031-12.484c-5.329-42.754-9.166-78.696-10.555-115.131l-0.312-8.097h69.312l0.319,7.472 c0.473,11.212,0.869,22.427,1.265,33.644c0.772,21.886,1.579,44.521,2.955,66.702c0.087,1.338,0.311,2.704,0.701,4.296 l0.233,1.856c0.036,9.968,5.982,20.035,19.195,20.035h116.676V248.455z"/></svg>`;

export interface PortalOptions {
  /** Tváre, ktoré sa v prázdnom jadre striedajú. Berú sa zo ŽIVÝCH psov, nie z pevného zoznamu. */
  faces?: string[];
  /** Popisok pod ikonkou. */
  label?: string;
  /** Popisok, keď je fotka vybraná. */
  labelPicked?: string;
  /** Poznámka pod popiskom (vnútri jadra). Smie niesť HTML (napr. <b>#72</b>). */
  note?: string;
  /**
   * Druhý, podradený riadok pod poznámkou. Vznikol 27. 8. 2026, keď do portálu
   * sadol počet psov: hook *„look around — your dog can be #72 here"* si vzal
   * hlavnú poznámku a uistenie *„(you can change the photo later)"* — Matejova
   * požiadavka z toho istého dňa — by inak zaniklo. Prázdny reťazec = riadok nie je.
   */
  subnote?: string;
  ariaLabel?: string;
  /** Klik na jadro. */
  onPick?: () => void;
}

export interface PortalHandle {
  /** Koreň — span.ph-portal. Volajúci si ho pripne, kam potrebuje. */
  el: HTMLElement;
  /** Plátno iskier. Podaj ho do createSparks() a kresli z vlastnej slučky. */
  canvas: HTMLCanvasElement;
  /** Prepne jadro na vybranú fotku (null = späť na cyklujúce tváre). */
  setPhoto(url: string | null): void;
}

/**
 * Postaví portál. JEDINÉ miesto, kde vzniká jeho tvar — React aj vanilla DOM
 * volajú toto.
 *
 * 🔴 LEM, ŽIARA A ISKRY MUSIA BYŤ MIMO TLAČIDLA. Jadro má overflow: hidden (drží
 * v sebe cyklujúce tváre), takže čokoľvek, čo má presahovať von, by v ňom bolo
 * orezané.
 * ⚠️ Plátno vzniká RAZ a už sa nevymieňa — výmena fotky prepisuje len vnútro
 * tlačidla. Nové plátno by zhodilo vyrovnávaciu pamäť v createSparks().
 */
export function buildPortal(opts: PortalOptions = {}): PortalHandle {
  const {
    faces = [], label = 'Add photo', labelPicked = 'Change photo',
    note = '(you can change the photo later)', subnote = '',
    ariaLabel = "Add your dog's photo", onPick,
  } = opts;

  const el = document.createElement('span');
  el.className = 'ph-portal';

  const halo = document.createElement('span');
  halo.className = 'ph-halo';
  halo.setAttribute('aria-hidden', 'true');

  const rim = document.createElement('span');
  rim.className = 'ph-rim';
  rim.setAttribute('aria-hidden', 'true');

  const canvas = document.createElement('canvas');
  canvas.className = 'ph-spark';
  canvas.setAttribute('aria-hidden', 'true');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ph-add';
  btn.setAttribute('aria-label', ariaLabel);
  if (onPick) btn.addEventListener('click', onPick);

  // Dĺžka slučky = počet fotiek × --ph-cyc, takže tempo sa ladí JEDNÝM číslom
  // a nezáleží, koľko fotiek je v zozname.
  const cyc = faces.slice(0, 12);
  const facesHtml = cyc.length
    ? `<span class="ph-add-cyc" aria-hidden="true" style="--ph-cycn:${Math.max(1, cyc.length)}">`
      + cyc.map((u, i) => `<img src="${u}" alt="" style="animation-delay:calc(var(--ph-cyc) * ${i})">`).join('')
      + '</span>'
    : '';

  const paint = (photo: string | null) => {
    btn.classList.toggle('has-photo', !!photo);
    btn.innerHTML =
      '<span class="ph-bed" aria-hidden="true"></span>'
      + (photo ? '' : facesHtml)
      + '<span class="ph-add-veil" aria-hidden="true"></span>'
      + (photo ? `<img class="ph-shot" src="${photo}" alt="">` : '')
      + '<span class="ph-mark">'
      +   `<span class="ph-ico" aria-hidden="true">${PLUS_SVG}</span>`
      +   `<span class="ph-lbl">${photo ? labelPicked : label}</span>`
      +   `<span class="ph-note">${note}</span>`
      +   (subnote ? `<span class="ph-sub">${subnote}</span>` : '')
      + '</span>';
  };
  paint(null);

  el.append(halo, rim, canvas, btn);
  return { el, canvas, setPhoto: paint };
}

/** CSS portálu. Vlož ho do <style> na každom povrchu, kde portál stojí. */
export const PORTAL_CSS = `
/* Miesto, kam sa portál pripne. display:contents nechá .ph-portal stať sa
   priamym prvkom rodičovského rozloženia — bez toho by medzi flex stĺpec a
   portál vliezol obal bez štýlov a rozloženie by sa posunulo. */
.ph-mount { display: contents; }

/* ── PORTÁL = CTA ────────────────────────────────────────────────────
   Matej 27. 8. 2026: *„to políčko na foto je škaredé… chcem aby sme ten
   portál rozanimovali, niečo v duchu doktora Strangeho… toto musí byť
   silný prvok, klikateľný"*. Vyladené v plany/portal-lab.html
   (variant A · Zlatá pečať, paleta Perleť, zaoblený štvorec) — lab je
   zdroj pravdy pre ladenie, sem sa prenášajú len HODNOTY.

   🔴 ČO ZANIKLO 27. 8.: .ph-aura + .ph-aura-2 (dve pulzujúce vrstvy
   žiary), .ph-add-bar (dolný zlatý pás s textom), prerušovaný rám
   a takmer biela výplň. Dôvody, prečo to padlo, sú v labe; sem patrí
   len to, že dolný pás na zaoblenom štvorci ukrajoval štvrtinu fotky
   a text patrí POD ikonku, nie do pruhu.

   ⚠️ VŠETKO SA LADÍ CEZ PREMENNÉ NIŽŠIE, nie prepisom pravidiel.
   Hodnoty sú Matejove z labu (27. 8., 12:49). */
.ph-portal {
  position: relative;
  display: inline-flex;
  isolation: isolate;
  pointer-events: auto;

  --ph-w: clamp(98px, 9.2vw, 118px);  /* šírka portálu */
  --ph-r: 24%;                        /* zaoblenie jadra */
  --ph-rimw: 9px;                     /* tvrdá čiara lemu */
  --ph-glow: 0.45;                    /* rozostrenie žiary lemu */
  --ph-icok: 0.25;                    /* ikonka = násobok šírky */
  --ph-lblk: 0.10;                    /* popisok = násobok šírky */
  --ph-notek: 0.068;                  /* poznámka = násobok šírky */
  --ph-halok: 2.45;                    /* biela žiara = násobok šírky */
  --ph-haloa: 1;                      /* sila bielej žiary */
  --ph-rimo: 0.45;                    /* vonkajší obrys lemu */
  --ph-rimin: 5px;                    /* o koľko lem presahuje jadro */
  --ph-cyc: 2.2s;                     /* ako dlho žije jedna tvár */
  /* Paleta „Perleť": biely hrot, zlatý chvost. */
  --ph-rim1: rgba(255,252,238,1);
  --ph-rim2: rgba(255,226,150,0.5);
}

/* Biela žiara pod portálom. Matej 27. 8. 2026: *„medzi tým tmavým blokom
   a iskrami je priestor, cez ktorý presvitajú fotky, ktoré sú vzadu…
   skúsme vyplniť bielou žiarou"* + *„dlaždice pretekajú cez blok, musia
   ísť ZA CTA blok"*. Sú to tie isté dve vety: portál bol v ploche
   PRIEHĽADNÝ, takže cezeň bolo vidieť otáčajúcu sa guľu.
   ⚠️ ŽIADNY filter blur a žiadny animovaný tieň — jeden statický
   radiálny prechod. Vykreslí sa raz a pri otáčaní gule sa už nedotkne
   (pravidlo č. 1 zadania: sekanie spôsoboval práve prekresľovaný tieň).
   ⚠️ Kruh, nie zaoblený štvorec: koróna iskier je kruhová, takže rohy
   štvorca by trčali von ako biele uši.
   ⚠️ Toto NIE JE tá zamietnutá „hmla pod textom" (Matej 26. 8.: *„prečo
   je logo aj CTA ako keby zahmlené"*) — tá ležala POD PÍSMOM a kalila ho.
   Táto leží pod TMAVOU dlaždicou a kontrast naopak dvíha. */
.ph-halo {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--ph-w) * var(--ph-halok));
  height: calc(var(--ph-w) * var(--ph-halok));
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(closest-side,
    rgba(253,248,236,var(--ph-haloa)) 0%,
    rgba(253,248,236,var(--ph-haloa)) 58%,
    rgba(253,248,236,calc(0.94 * var(--ph-haloa))) 72%,
    rgba(253,248,236,calc(0.58 * var(--ph-haloa))) 86%,
    rgba(253,248,236,0) 100%);
}

/* Lem. ⚠️ Tvrdá čiara a jej žiara sú DVE NEZÁVISLÉ veci — Matej 27. 8.:
   *„je veľmi hrubý tá biela časť ten lem"*, a tá hrúbka nebola tá čiara,
   ale jej 16px halo. Preto má halo vlastný násobič --ph-glow.
   ⚠️ STATICKÝ box-shadow, NIKDY animovaný: animovaný tieň sa prekresľuje
   v každom snímku aj s rozostrením a to bolo pôvodné Matejovo
   *„stránka hrozne seká pri točení"*. */
.ph-rim {
  position: absolute;
  /* ⚠️ Presah lemu je PREMENNÁ, nie číslo: to isté číslo potrebuje aj
     maska vodiacich čiar kót (ctaMask v tomto súbore), aby vedela, kde
     končí CTA. Dva zápisy toho istého presahu by sa pri prvej zmene
     rozišli a čiara by zase preťala lem. */
  inset: calc(-1 * var(--ph-rimin));
  border-radius: 26%;
  pointer-events: none;
  z-index: 1;
  box-shadow:
    0 0 0 var(--ph-rimw) var(--ph-rim1),
    /* Vonkajší obrys. Kým bola za lemom otáčajúca sa guľa, lem sa od nej
       odlíšil sám. Odkedy je za ním biela žiara, je to krémová na krémovej
       a lem zmizol — obrys mu vracia hranu. Zadanie, otvorený bod č. 5:
       *„Kontrast lemu proti guli… zvážiť tmavší vonkajší obrys."*
       Nula ho vypne. */
    0 0 0 calc(var(--ph-rimw) + 1.25px) rgba(201,154,63,var(--ph-rimo)),
    0 0 calc(16px * var(--ph-glow)) calc(2px * var(--ph-glow)) var(--ph-rim2),
    inset 0 0 calc(16px * var(--ph-glow)) calc(3px * var(--ph-glow)) var(--ph-rim2);
}

/* Iskry. Plátno je väčšie než portál — vyhodená iskra doletí ďaleko a orezaná
   v polovici vyzerá ako chyba vykreslenia. O koľko väčšie, hovorí SPARK_MARGIN
   vyššie; je to pevný počet pixelov, nie násobok šírky. */
.ph-spark {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

.ph-add {
  pointer-events: auto;
  position: relative;
  z-index: 2;
  width: var(--ph-w);
  height: var(--ph-w);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: 0;
  overflow: hidden;
  border-radius: var(--ph-r);
  background: transparent;
  cursor: pointer;
  transition: transform 0.22s;
}
.ph-portal:hover .ph-add { transform: scale(1.035); }
.ph-portal:active .ph-add { transform: scale(0.98); }

/* Jadro je TMAVÉ zámerne. Na papyruse nesie kontrast tma, nie ďalšie
   svetlo — takmer biela dlaždica sa na svetlej stránke stratila a presne
   to bolo Matejovo *„nevyzerá vôbec dobre, je inej farby"*. */
.ph-bed {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 120% at 50% 30%, #2a1a08 0%, #150d05 60%, #0b0703 100%);
}

/* Tváre zo steny sa striedajú POMALY. Do 27. 8. bolo v slučke 12 fotiek
   za 12 s, teda strih každú sekundu — Matej: *„rýchlo sa menia fotky"*.
   Dĺžka slučky = počet fotiek × --ph-cyc, takže tempo sa ladí JEDNÝM
   číslom a nezáleží, koľko fotiek je v zozname. */
.ph-add-cyc { position: absolute; inset: 0; }
.ph-add-cyc img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; opacity: 0;
  animation: phCyc calc(var(--ph-cyc) * var(--ph-cycn, 12)) linear infinite;
  will-change: opacity;
}
@keyframes phCyc {
  0%   { opacity: 0 }
  3%   { opacity: 0.5 }
  10%  { opacity: 0.5 }
  13%  { opacity: 0 }
  100% { opacity: 0 }
}
.ph-add-veil {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(20,12,4,0.15), rgba(20,12,4,0.55));
}

/* ── ZNAČKA V STREDE: brandové PLUS a POD NÍM popisok ────────────────
   Matej 27. 8.: *„ADD PHOTO dajme pod + do vnútra a plusko dajme naše
   brandové aj s možnosťou zmeny veľkosti pre text aj ikonku"*.
   Plus je z hand-drawn kitu (plus-hand-drawn-sign), nie dva prúžky —
   kreslené + má rukopis, ktorý dva obdĺžniky nedajú.
   ⚠️ Obe veľkosti sú NÁSOBKY šírky portálu, nie pixely: pri zmene šírky
   by sa pevné pixely s portálom rozišli. */
.ph-mark {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center;
  gap: calc(var(--ph-w) * 0.045);
  /* Strop šírky, aby sa poznámka pod popiskom ZALOMILA a nevytiekla
     z jadra (jadro má overflow: hidden, orezala by sa v pol slova). */
  max-width: calc(var(--ph-w) * 0.86);
  pointer-events: none;
  color: #FFF6DA;
}
.ph-ico {
  width: calc(var(--ph-w) * var(--ph-icok));
  height: calc(var(--ph-w) * var(--ph-icok));
  display: block;
  filter: drop-shadow(0 0 6px rgba(255,235,170,0.8)) drop-shadow(0 0 16px rgba(245,199,61,0.5));
}
.ph-ico svg { width: 100%; height: 100%; display: block; fill: currentColor; }
.ph-lbl {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: calc(var(--ph-w) * var(--ph-lblk));
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 0 0 8px rgba(0,0,0,0.35);
}

/* Fotka vybraná → portál sa zavrie okolo nej. Ikonka + odchádza,
   popisok sa mení na „Change photo" (rieši JSX). */
.ph-add.has-photo .ph-add-cyc,
.ph-add.has-photo .ph-add-veil { display: none; }
.ph-add.has-photo .ph-ico { display: none; }
.ph-shot {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block;
}

/* Kto má vypnuté animácie, dostane pokojný portál — nie zhasnutý.
   Iskry sa nekreslia vôbec (rieši drawSparks), lem a jadro ostávajú. */
@media (prefers-reduced-motion: reduce) {
  .ph-add-cyc img { animation: none; opacity: 0.5; }
}
.ph-add-file { display: none; }
/* Poznámka je VNÚTRI tmavého jadra, pod popiskom. Matej 27. 8. 2026:
   *„vetu «you can change later» skúsme dať dovnútra toho tmavého bloku
   pod ADD PHOTO"*. Predtým ležala pod portálom priamo na fotkách gule
   a iskry cez ňu preletovali (otvorený bod č. 1 zadania) — presunom
   dovnútra zanikol aj ten spor, nie je čo odsúvať.
   ⚠️ Veľkosť je NÁSOBOK šírky portálu, nie rem: pevná veľkosť by sa pri
   clamp-nutej šírke s jadrom rozišla a text by z neho vytiekol.
   Halo zaniklo — na tmavom jadre nemá čo presvetľovať. */
.ph-note {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 400;
  font-size: calc(var(--ph-w) * var(--ph-notek));
  /* ⚠️ ZALOMENIE JE VOLITEĽNÉ, NIE PEVNÉ. Stena (260 px) veta na jeden riadok
     unesie, guľa (118 px) NIE — pri jej šírke by nowrap vetu vystrčil z jadra,
     ktoré má overflow hidden, teda by sa orezala v pol slova. Prepínač preto
     ostáva na volajúcom: stena si nastaví premennú, guľa nie. */
  white-space: var(--ph-note-ws, normal);
  line-height: 1.25;
  letter-spacing: 0.02em;
  text-align: center;
  color: rgba(255,246,218,0.72);
}
/* Číslo v poznámke je to jediné, čo sa v nej mení — nesie zlato, aby ho oko
   našlo bez toho, aby celý riadok kričal. */
.ph-note b { font-weight: 600; color: #F5C73D; }

/* Podradený riadok pod poznámkou (uistenie „fotku vieš zmeniť neskôr").
   ⚠️ Veľkosť je NÁSOBOK šírky portálu, rovnako ako .ph-note — pevná by sa
   pri clamp-nutej šírke s jadrom rozišla. Na guli (118 px) sa nezapína:
   dva riadky drobného textu by tam ostali nečitateľné. */
.ph-sub {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 400;
  font-size: calc(var(--ph-w) * var(--ph-subk, 0.052));
  line-height: 1.2;
  letter-spacing: 0.02em;
  text-align: center;
  color: rgba(255,246,218,0.46);
}

/* ── PORADOVÉ ČÍSLO = OUTLINE PILULKA NA SPODKU BLOKU ────────────────────
   Matej 27. 8. 2026: *„tá info o počte daj ju naspodok toho bloku do pilsu
   ale outline nie plného"*.
   🔴 OUTLINE JE PRAVIDLO, NIE VKUS. Plná farebná plocha patrí jedinému prvku —
   hlavnému CTA, a tým je práve tento portál. Pilulka stojí VNÚTRI neho, takže
   plnú výplň mať nesmie, inak si tlačidlo konkuruje samo so sebou.
   ⚠️ Zapína ju stena tým, že pošle subnote s týmto obalom; guľa subnote
   nemá (118 px by drobnú pilulku neuniesla), takže sa jej to netýka. */
.ph-nopill {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em 1.05em;
  border-radius: 999px;
  border: 1px solid rgba(245,199,61,0.55);
  background: transparent;
  color: rgba(255,246,218,0.80);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  line-height: 1;
}
.ph-nopill b { font-weight: 600; color: #F5C73D; letter-spacing: 0.02em; }

/* Fotka je vybraná → popisok už hovorí „Change photo", poznámka
   o tom istom by bola druhýkrát to isté. */
.ph-add.has-photo .ph-note,
.ph-add.has-photo .ph-sub { display: none; }
`;
