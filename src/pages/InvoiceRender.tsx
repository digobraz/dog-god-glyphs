import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { decodeRenderData } from '@/lib/renderData';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';

/**
 * Headless render target for invoice PDF generation (Cloudflare Browser Rendering).
 * Renders an A4 invoice with DOGYPT brand (papyrus/gold/ink, Cinzel + Space Grotesk).
 *
 * URL: /invoice-render/:id?key=<RENDER_KEY>&lang=en|sk|cs
 *
 * The page sets data-render-ready="1" on <html> once data is loaded and fonts
 * are decoded — Cloudflare waits for that selector before printing.
 */

// Suma slovom (25. 9. 2026). Dovtedy faktúra poznala len 11 € a pri dvoch psoch
// písala „22 EUR“. Nákup má celé eurá (€0 · €1 · €3 · €11 × psy) ⇒ stačí 1–999;
// iná suma a jazyk bez prevodu (uk) padne na číslo.
const W: Record<string, { u: string[]; t: string[]; h: (n: number) => string; join: string; cur: (n: number) => string; pre: string }> = {
  sk: {
    u: ['', 'jeden', 'dva', 'tri', 'štyri', 'päť', 'šesť', 'sedem', 'osem', 'deväť', 'desať', 'jedenásť', 'dvanásť', 'trinásť', 'štrnásť', 'pätnásť', 'šestnásť', 'sedemnásť', 'osemnásť', 'devätnásť'],
    t: ['', '', 'dvadsať', 'tridsať', 'štyridsať', 'päťdesiat', 'šesťdesiat', 'sedemdesiat', 'osemdesiat', 'deväťdesiat'],
    h: (n) => (n === 1 ? 'sto' : n === 2 ? 'dvesto' : `${['', '', '', 'tri', 'štyri', 'päť', 'šesť', 'sedem', 'osem', 'deväť'][n]}sto`),
    join: '',
    cur: (n) => (n === 1 ? 'jedno euro' : n === 2 ? 'dve eurá' : n === 3 || n === 4 ? `${['', '', '', 'tri', 'štyri'][n]} eurá` : ''),
    pre: 'slovom: ',
  },
  cs: {
    u: ['', 'jedna', 'dva', 'tři', 'čtyři', 'pět', 'šest', 'sedm', 'osm', 'devět', 'deset', 'jedenáct', 'dvanáct', 'třináct', 'čtrnáct', 'patnáct', 'šestnáct', 'sedmnáct', 'osmnáct', 'devatenáct'],
    t: ['', '', 'dvacet', 'třicet', 'čtyřicet', 'padesát', 'šedesát', 'sedmdesát', 'osmdesát', 'devadesát'],
    h: (n) => (n === 1 ? 'sto' : n === 2 ? 'dvě stě' : n < 5 ? `${['', '', '', 'tři', 'čtyři'][n]} sta` : `${['', '', '', '', '', 'pět', 'šest', 'sedm', 'osm', 'devět'][n]} set`),
    join: ' ',
    cur: (n) => (n === 1 ? 'jedno euro' : n === 2 ? 'dvě eura' : n === 3 || n === 4 ? `${['', '', '', 'tři', 'čtyři'][n]} eura` : ''),
    pre: 'slovy: ',
  },
  en: {
    u: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
    t: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
    h: (n) => `${['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][n]} hundred`,
    join: ' ',
    cur: () => '',
    pre: 'in words: ',
  },
};
function amountInWords(amount: number, lang: string): string {
  const w = W[lang];
  if (!w || !Number.isInteger(amount) || amount < 1 || amount > 999) return `${amount} EUR`;
  const special = w.cur(amount);
  if (special) return w.pre + special;
  const below100 = (n: number) => {
    if (n < 20) return w.u[n];
    const t = w.t[Math.floor(n / 10)];
    const u = w.u[n % 10];
    if (!u) return t;
    return lang === 'en' ? `${t}-${u}` : `${t}${w.join}${u}`;
  };
  const hund = Math.floor(amount / 100);
  const rest = amount % 100;
  const parts = [hund ? w.h(hund) : '', rest ? below100(rest) : ''].filter(Boolean);
  return `${w.pre}${parts.join(w.join)} ${lang === 'en' ? 'euro' : 'eur'}`;
}

// i18n labels — sk / cs / uk / en complete, no missing keys
const LABELS: Record<string, Record<string, string>> = {
  sk: {
    title: 'Faktúra',
    invoiceNumber: 'Číslo faktúry',
    seller: 'Dodávateľ',
    buyer: 'Odberateľ',
    description: 'Popis položky',
    qty: 'Množ.',
    unit: 'MJ',
    unitVal: 'ks',
    price: 'Cena',
    subtotal: 'Spolu',
    issued: 'Dátum vystavenia',
    delivered: 'Dátum dodania',
    payMethod: 'Karta · Stripe',
    payMethodLabel: 'Forma úhrady',
    status: 'Stav',
    statusVal: 'Uhradené',
    toPay: 'K úhrade',
    paidByCard: 'Uhradené kartou',
    paidStamp: 'Uhradené',
    paidSmall: 'Paid · ',
    inWords11: 'slovom: jedenásť eur',
    vatNote: 'Dodávateľ nie je platiteľom dane z pridanej hodnoty; ceny sú konečné.',
    orNote: 'Spoločnosť zapísaná v OR Okresného súdu Trnava, oddiel Sro, vložka č. 51029/T.',
    paidNote: 'Faktúra bola uhradená online kartou cez Stripe — neslúži ako výzva na úhradu.',
    footer: 'In Dog We Trust',
    heroglyph: 'Heroglyph — unikátny posvätný symbol',
    contribution: 'Príspevok — pes na stene DOGYPT',
    icoLabel: 'IČO',
    dphLabel: 'DPH',
    dphVal: 'Neplatiteľ DPH',
    webLabel: 'Web',
    mailLabel: 'Mail',
    subtotalLabel: 'Medzisúčet',
  },
  cs: {
    title: 'Faktura',
    invoiceNumber: 'Číslo faktury',
    seller: 'Dodavatel',
    buyer: 'Odběratel',
    description: 'Popis položky',
    qty: 'Množ.',
    unit: 'MJ',
    unitVal: 'ks',
    price: 'Cena',
    subtotal: 'Celkem',
    issued: 'Datum vystavení',
    delivered: 'Datum dodání',
    payMethod: 'Karta · Stripe',
    payMethodLabel: 'Forma úhrady',
    status: 'Stav',
    statusVal: 'Uhrazeno',
    toPay: 'K úhradě',
    paidByCard: 'Uhrazeno kartou',
    paidStamp: 'Uhrazeno',
    paidSmall: 'Paid · ',
    inWords11: 'slovy: jedenáct eur',
    vatNote: 'Dodavatel není plátcem daně z přidané hodnoty; ceny jsou konečné.',
    orNote: 'Společnost zapsaná v OR Okresního soudu Trnava, oddíl Sro, vložka č. 51029/T.',
    paidNote: 'Faktura byla uhrazena online kartou přes Stripe — neslouží jako výzva k úhradě.',
    footer: 'In Dog We Trust',
    heroglyph: 'Heroglyph — unikátní posvátný symbol',
    contribution: 'Příspěvek — pes na zdi DOGYPT',
    icoLabel: 'IČO',
    dphLabel: 'DPH',
    dphVal: 'Neplátce DPH',
    webLabel: 'Web',
    mailLabel: 'Mail',
    subtotalLabel: 'Mezisoučet',
  },
  en: {
    title: 'Invoice',
    invoiceNumber: 'Invoice No.',
    seller: 'Supplier',
    buyer: 'Bill To',
    description: 'Description',
    qty: 'Qty',
    unit: 'Unit',
    unitVal: 'pcs',
    price: 'Price',
    subtotal: 'Total',
    issued: 'Issue Date',
    delivered: 'Delivery Date',
    payMethod: 'Card · Stripe',
    payMethodLabel: 'Payment',
    status: 'Status',
    statusVal: 'Paid',
    toPay: 'Amount Due',
    paidByCard: 'Paid by card',
    paidStamp: 'Paid',
    paidSmall: 'Paid · ',
    inWords11: 'in words: eleven euro',
    vatNote: 'The supplier is not registered for VAT; prices are final.',
    orNote: 'Company registered at District Court Trnava, section Sro, file no. 51029/T.',
    paidNote: 'This invoice was paid online by card via Stripe — not a demand for payment.',
    footer: 'In Dog We Trust',
    heroglyph: 'Heroglyph — unique sacred symbol',
    contribution: 'Contribution — dog on the DOGYPT WALL',
    icoLabel: 'Reg. No.',
    dphLabel: 'VAT',
    dphVal: 'Not a VAT payer',
    webLabel: 'Web',
    mailLabel: 'Mail',
    subtotalLabel: 'Subtotal',
  },
  uk: {
    title: 'Рахунок-фактура',
    invoiceNumber: 'Номер рахунку',
    seller: 'Постачальник',
    buyer: 'Покупець',
    description: 'Опис',
    qty: 'К-ть',
    unit: 'Од.',
    unitVal: 'шт.',
    price: 'Ціна',
    subtotal: 'Разом',
    issued: 'Дата виставлення',
    delivered: 'Дата постачання',
    payMethod: 'Картка · Stripe',
    payMethodLabel: 'Оплата',
    status: 'Статус',
    statusVal: 'Оплачено',
    toPay: 'До сплати',
    paidByCard: 'Оплачено карткою',
    paidStamp: 'Оплачено',
    paidSmall: 'Paid · ',
    inWords11: 'словами: одинадцять євро',
    vatNote: 'Постачальник не є платником ПДВ; ціни є кінцевими.',
    orNote: 'Компанія зареєстрована в суді Трнава, розділ Sro, вклад № 51029/T.',
    paidNote: 'Цей рахунок оплачено онлайн карткою через Stripe — не є вимогою до оплати.',
    footer: 'In Dog We Trust',
    heroglyph: 'Heroglyph — унікальний священний символ',
    contribution: 'Внесок — пес на стіні DOGYPT',
    icoLabel: 'Рег. номер',
    dphLabel: 'ПДВ',
    dphVal: 'Не платник ПДВ',
    webLabel: 'Сайт',
    mailLabel: 'E-mail',
    subtotalLabel: 'Проміжний підсумок',
  },
};

function detectLang(country?: string | null, paramLang?: string | null): string {
  if (paramLang && LABELS[paramLang]) return paramLang;
  if (country === 'SVK') return 'sk';
  if (country === 'CZE') return 'cs';
  return 'en';
}

/** Format date as dd. mm. yyyy */
function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}. ${mm}. ${yyyy}`;
  } catch {
    return '—';
  }
}

/** Format amount as "11,00 €" */
function fmtAmount(amount: number): string {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

interface InvoiceDog {
  id: string;
  dog_name: string | null;
  owner_name: string | null;
  email: string | null;
  amount: number | null;
  country: string | null;
  // Billing address fields (FIX6 2026-07-06) — null for old dogs (fallback to — )
  bill_name?: string | null;
  bill_street?: string | null;
  bill_city?: string | null;
  bill_zip?: string | null;
  bill_country?: string | null;
  stripe_session_id: string | null;
  created_at: string;
  pack_number?: number | null;
  invoice_number?: string | null;
  invoice_issued_at?: string | null;
  /** Všetci psi nákupu s tým istým číslom faktúry (get-render-data, 25. 9. 2026). */
  items?: { dog_name: string | null; amount: number | null; payment_status?: string | null }[];
}

export default function InvoiceRender() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const key = params.get('key') || '';
  const langParam = params.get('lang');
  const dataParam = params.get('data');

  const [dog, setDog] = useState<InvoiceDog | null>(null);
  const [error, setError] = useState<string>('');

  // Prefer render data injected in the URL (?data=) by generate-pdfs — the
  // headless CF browser can't fetch get-render-data ("Failed to fetch"). Fall
  // back to the cross-origin fetch for manual/dev use without ?data.
  useEffect(() => {
    let alive = true;
    const injected = decodeRenderData<InvoiceDog>(dataParam);
    if (injected) {
      setDog(injected);
      return;
    }
    (async () => {
      if (!id) { setError('missing id'); return; }
      try {
        const r = await fetch(
          `${EDGE_BASE}/get-render-data?id=${encodeURIComponent(id)}&key=${encodeURIComponent(key)}&include=invoice`,
          { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY } },
        );
        if (!r.ok) { setError(`fetch ${r.status}`); return; }
        const data = (await r.json()) as InvoiceDog;
        if (alive) setDog(data);
      } catch (e) {
        if (alive) setError((e as Error).message);
      }
    })();
    return () => { alive = false; };
  }, [id, key, dataParam]);

  // Signal ready once data is loaded and fonts decoded
  useEffect(() => {
    if (!dog) return;
    let cancelled = false;
    const markReady = async () => {
      try {
        const fontWait = (document as Document & { fonts?: { ready?: Promise<unknown> } })
          .fonts?.ready ?? Promise.resolve();
        await fontWait;
      } catch { /* ignore */ }
      await new Promise((res) => setTimeout(res, 400));
      // Narazil by obsah do pečate? Prekryv obdĺžnikov, nie len výška — pečať je
      // v strede a poznámka vľavo aj pečiatka vpravo ju môžu obísť bokom.
      const page = document.getElementById('invoice-page');
      const sealEl = page?.querySelector('.seal');
      if (page && sealEl) {
        // Vosk je kruh vpísaný do štvorca ⇒ rohy štvorca sú prázdne; meria sa
        // o 10 % menší štvorec. Text sa meria po RIADKOCH (Range), nie celým
        // odsekom — posledný riadok právnej poznámky je krátky a pečať obíde.
        const b = sealEl.getBoundingClientRect();
        const k = b.width * 0.1;
        const sr = { left: b.left + k, right: b.right - k, top: b.top + k, bottom: b.bottom - k };
        const rects: DOMRect[] = [];
        page.querySelectorAll('.note, .paid-stamp, .words, .trow, .lx-c, .lx-row').forEach((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          rects.push(...Array.from(range.getClientRects()));
        });
        const hit = rects.some((r) => r.right > sr.left && r.left < sr.right && r.bottom > sr.top && r.top < sr.bottom);
        if (hit) page.classList.add('tight');
      }
      if (!cancelled) document.documentElement.setAttribute('data-render-ready', '1');
    };
    markReady();
    return () => { cancelled = true; };
  }, [dog]);

  if (error) {
    return <div data-render-error={error} style={{ padding: 20 }}>render error: {error}</div>;
  }
  if (!dog) {
    return <div style={{ padding: 20 }}>loading…</div>;
  }

  const lang = detectLang(dog.country, langParam);
  const L = LABELS[lang] || LABELS.en;

  const ownerName = dog.owner_name || '';
  // JEDNA FAKTÚRA NA NÁKUP (Matej 25. 9. 2026): psi jednej platby sú položky
  // tohto dokladu. Starý nákup `items` nemá ⇒ jediná položka = tento pes.
  // Faktúra sa MUSÍ zmestiť na jednu A4 (Matej 25. 9. 2026: *„môže byť jeden
  // riadok, kde budú vymenovaní psi"*) ⇒ psi s rovnakou položkou a cenou sú
  // JEDEN riadok (množstvo × cena, mená pod názvom). Viac riadkov vznikne len pri
  // rôznej cene (psí anjel €1 vedľa €11), teda najviac dva.
  const raw = (dog.items?.length ? dog.items : [{ dog_name: dog.dog_name, amount: dog.amount, payment_status: null }])
    .map((it) => ({
      name: it.dog_name || 'Unnamed',
      amount: it.amount ?? 11,
      title: it.payment_status === 'supporter' ? L.contribution : L.heroglyph,
    }));
  const lines: { title: string; unit: number; qty: number; names: string[] }[] = [];
  for (const r of raw) {
    const g = lines.find((l) => l.title === r.title && l.unit === r.amount);
    if (g) { g.qty += 1; g.names.push(r.name); } else lines.push({ title: r.title, unit: r.amount, qty: 1, names: [r.name] });
  }
  const amount = raw.reduce((sum, l) => sum + l.amount, 0);
  const amountStr = fmtAmount(amount);

  // Invoice number — use real invoice_number; fallback '—' (never DGP-BETA)
  const invoiceNumber = dog.invoice_number || '—';

  // Dates — issued_at preferred, fallback created_at
  const issuedRaw = dog.invoice_issued_at || dog.created_at;
  const issuedDate = fmtDate(issuedRaw);

  const inWords = !W[lang] && amount === 11 ? L.inWords11 : amountInWords(amount, lang);
  // Matej 25. 9. 2026 nad nákresom `plany/nakres-faktura-psi-2026-09-25/` vybral
  // C: pri 1–2 psoch (95 % nákupov) je položkou PES — meno, popis, suma. Od troch
  // psov by riadky pretiekli A4 ⇒ psi s rovnakou cenou sú jeden riadok s pilulkami.
  const perDog = raw.length <= 2;

  // CSS vars as inline style on sheet
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cinzel+Decorative:wght@700&family=Space+Grotesk:wght@300;400;500;600&display=swap');
    :root {
      --ink: #1a1310;
      --ink-soft: #5a4b3a;
      --ink-faint: #9c8a72;
      --gold: #C99A3F;
      --gold-deep: #9a7325;
      --papyrus: #f6efdd;
      --papyrus-2: #f1e7cf;
      --line: rgba(154,115,37,0.28);
      --line-soft: rgba(90,75,58,0.16);
    }
    * { box-sizing: border-box; }
    html, body, #root { margin: 0; background: #2a2620; }
    body {
      font-family: 'Space Grotesk', Arial, sans-serif;
      color: var(--ink);
      padding: 32px 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    #invoice-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background:
        radial-gradient(ellipse 120% 80% at 50% -10%, rgba(201,154,63,0.06), transparent 60%),
        linear-gradient(168deg, #f8f2e1 0%, var(--papyrus) 30%, var(--papyrus-2) 70%, #f8f2e1 100%);
      position: relative;
      box-shadow: 0 24px 70px rgba(0,0,0,.45);
      overflow: hidden;
    }
    .frame {
      position: absolute; inset: 10mm;
      border: 1px solid var(--line-soft);
      pointer-events: none;
    }
    .frame::before {
      content: ""; position: absolute; inset: 2.5mm;
      border: 1px solid rgba(201,154,63,0.18);
    }
    .pad { position: relative; z-index: 2; padding: 22mm 20mm 18mm; }
    .top { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand .logo { display: block; width: 44mm; height: auto; }
    .brand .tag {
      font-family: 'Cinzel', serif; font-size: 8.5px; letter-spacing: .42em;
      text-transform: uppercase; color: var(--gold-deep); margin-top: 4mm; padding-left: 1mm;
    }
    .doc { text-align: right; }
    .doc .word {
      font-family: 'Cinzel', serif; font-weight: 600; font-size: 13px;
      letter-spacing: .4em; text-transform: uppercase; color: var(--ink-soft);
    }
    .doc .num {
      font-family: 'Cinzel', serif; font-weight: 600; font-size: 21px;
      letter-spacing: .10em; color: var(--ink); margin-top: 4px;
    }
    .rule { height: 1px; background: linear-gradient(90deg,transparent,var(--line),transparent); margin: 9mm 0; }
    .rule.tight { margin: 5mm 0; }
    .parties { display: flex; gap: 14mm; }
    .party { flex: 1; }
    .plabel {
      font-family: 'Cinzel', serif; font-size: 8.5px; letter-spacing: .30em;
      text-transform: uppercase; color: var(--gold-deep); margin-bottom: 6px;
    }
    .party .name { font-size: 13px; font-weight: 600; letter-spacing: .01em; }
    .party .lines { font-size: 10.5px; line-height: 1.65; color: var(--ink-soft); margin-top: 3px; }
    .party .lines b { color: var(--ink); font-weight: 500; }
    .kv { margin-top: 6px; font-size: 10px; line-height: 1.6; color: var(--ink-soft); }
    .kv span { display: inline-block; min-width: 42px; color: var(--ink-faint); }
    .meta { display: flex; gap: 0; margin-top: 2mm; }
    .meta .cell { flex: 1; padding: 4mm 4mm 4mm 0; }
    .meta .cell + .cell { padding-left: 6mm; border-left: 1px solid var(--line-soft); }
    .meta .mlabel { font-size: 8.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--ink-faint); }
    .meta .mval { font-size: 12px; margin-top: 4px; color: var(--ink); font-weight: 500; }
    .lx { margin-top: 2mm; font-size: 11px; }
    .lx-head {
      display: flex; justify-content: space-between;
      font-family: 'Cinzel', serif; font-size: 8.5px; letter-spacing: .18em;
      text-transform: uppercase; color: var(--gold-deep); font-weight: 600;
      padding-bottom: 4mm; border-bottom: 1px solid var(--line);
    }
    .lx-c { display: flex; align-items: baseline; gap: 5mm; padding: 4mm 0; border-bottom: 1px solid var(--line-soft); }
    .lx-name { font-family: 'Cinzel Decorative', serif; font-weight: 700; font-size: 14px; letter-spacing: .04em; min-width: 34mm; }
    .lx-sub { flex: 1; font-size: 10px; color: var(--ink-faint); }
    .lx-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8mm; padding: 5mm 0; border-bottom: 1px solid var(--line-soft); }
    .lx-title { font-weight: 600; }
    .lx-dogs { margin-top: 2.5mm; display: flex; flex-wrap: wrap; gap: 2mm; }
    .lx-dog {
      font-family: 'Cinzel Decorative', serif; font-weight: 700; font-size: 10px; letter-spacing: .06em;
      color: var(--ink-soft); border: 1px solid var(--line); border-radius: 999px; padding: 1mm 3mm;
    }
    .lx-amt { text-align: right; white-space: nowrap; }
    .lx-amt small { display: block; color: var(--ink-faint); font-size: 9.5px; margin-bottom: 1mm; }
    .totals { display: flex; justify-content: space-between; align-items: flex-end; gap: 12mm; margin-top: 8mm; }
    .tbox { min-width: 78mm; }
    .trow { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-soft); padding: 2.5mm 0; }
    .trow.grand {
      margin-top: 3mm; padding-top: 4mm; border-top: 1.5px solid var(--gold);
      align-items: baseline;
    }
    .trow.grand .lbl { font-family: 'Cinzel', serif; letter-spacing: .16em; text-transform: uppercase; font-size: 11px; color: var(--ink); }
    .trow.grand .val { font-family: 'Cinzel', serif; font-weight: 700; font-size: 24px; letter-spacing: .04em; color: var(--ink); }
    .words { text-align: right; font-size: 9.5px; color: var(--ink-faint); font-style: italic; margin-top: 3mm; }
    .paid-stamp {
      display: inline-block; margin-top: 7mm;
      padding: 2.5mm 7mm;
      border: 2.5px solid #0f8a7e; border-radius: 3px;
      font-family: 'Cinzel', serif; font-weight: 700;
      font-size: 15px; letter-spacing: .30em; text-transform: uppercase;
      color: #0f8a7e;
      transform: rotate(-8deg); opacity: .82;
      box-shadow: inset 0 0 0 1.5px rgba(15,138,126,.30);
    }
    .paid-stamp small { display: block; font-size: 8px; letter-spacing: .34em; font-weight: 500; margin-top: 1.5mm; opacity: .85; }
    .seal {
      position: absolute; left: 50%; bottom: 24mm;
      transform: translateX(-50%) rotate(-5deg);
      width: 34mm; height: 34mm; z-index: 3;
    }
    .seal img {
      width: 100%; height: 100%; object-fit: contain;
      filter: sepia(.4) saturate(1.2) hue-rotate(-6deg) opacity(.92);
      mix-blend-mode: multiply;
    }
    /* Pečať sa zmenší LEN keď by do nej narazil obsah (Matej 25. 9. 2026:
       *„nevidím dôvod prečo pri 4 psoch je menšia pečať“*). Triedu dáva meranie
       pred data-render-ready, nie počet psov. */
    #invoice-page.tight .seal { width: 22mm; height: 22mm; bottom: 22mm; }
    .note { margin: 0; font-size: 9px; line-height: 1.7; color: var(--ink-faint); flex: 0 1 92mm; }
    .note b { color: var(--ink-soft); font-weight: 600; }
    .foot {
      position: absolute; left: 0; right: 0; bottom: 14mm; text-align: center;
      font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: .4em;
      text-transform: uppercase; color: var(--gold-deep);
    }
    @media print {
      body { padding: 0; background: #fff; }
      #invoice-page { box-shadow: none; margin: 0; }
    }
    @page { size: A4 portrait; margin: 0; }
  `;

  const seal = (
    <div className="seal">
      <img src="https://dogypt.com/images/peciat-dogypt.png" alt="DOGYPT seal" />
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div id="invoice-page">
        <div className="frame" />

        <div className="pad">

          {/* masthead */}
          <div className="top">
            <div className="brand">
              <img
                className="logo"
                src="https://dogypt.com/images/dogypt-logo-black-w.png"
                alt="DOGYPT"
              />
              <div className="tag">In Dog We Trust</div>
            </div>
            <div className="doc">
              <div className="word">{L.title}</div>
              <div className="num">{invoiceNumber}</div>
            </div>
          </div>

          <div className="rule" />

          {/* parties */}
          <div className="parties">
            <div className="party">
              <div className="plabel">{L.seller}</div>
              <div className="name">DOGYPT s. r. o.</div>
              <div className="lines">
                Sídlisko 335/20<br />
                91930 Jaslovské Bohunice, Slovensko
              </div>
              <div className="kv">
                <div><span>{L.icoLabel}</span>54444594</div>
                <div><span>{L.dphLabel}</span>{L.dphVal}</div>
                <div><span>{L.webLabel}</span>dogypt.com</div>
                <div><span>{L.mailLabel}</span>heroglyph@dogypt.com</div>
              </div>
            </div>
            <div className="party">
              <div className="plabel">{L.buyer}</div>
              {/* bill_name = legal payer name from checkout (FIX6 2026-07-06).
                  Fallback to owner_name (cartouche name) for old dogs. */}
              <div className="name">{dog.bill_name || ownerName || '—'}</div>
              <div className="lines">
                {dog.email && <><b>{dog.email}</b><br /></>}
                {dog.bill_street && <>{dog.bill_street}<br /></>}
                {(dog.bill_zip || dog.bill_city) && (
                  <>{[dog.bill_zip, dog.bill_city].filter(Boolean).join(' ')}<br /></>
                )}
                {dog.bill_country
                  ? <>{dog.bill_country}</>
                  : dog.country
                  ? <>{dog.country}</>  /* legacy: old dogs have no bill_country */
                  : null}
              </div>
            </div>
          </div>

          <div className="rule tight" />

          {/* dates / payment */}
          <div className="meta">
            <div className="cell">
              <div className="mlabel">{L.issued}</div>
              <div className="mval">{issuedDate}</div>
            </div>
            <div className="cell">
              <div className="mlabel">{L.delivered}</div>
              <div className="mval">{issuedDate}</div>
            </div>
            <div className="cell">
              <div className="mlabel">{L.payMethodLabel}</div>
              <div className="mval">{L.payMethod}</div>
            </div>
            <div className="cell">
              <div className="mlabel">{L.status}</div>
              <div className="mval">{L.statusVal}</div>
            </div>
          </div>

          {/* items */}
          <div className="lx">
            <div className="lx-head"><span>{L.description}</span><span>{L.subtotal}</span></div>
            {perDog
              ? raw.map((r, i) => (
                <div key={i} className="lx-c">
                  <span className="lx-name">{r.name}</span>
                  <span className="lx-sub">{r.title} · 1 {L.unitVal}</span>
                  <span className="lx-amt">{fmtAmount(r.amount)}</span>
                </div>
              ))
              : lines.map((l, i) => (
                <div key={i} className="lx-row">
                  <div>
                    <div className="lx-title">{l.title}</div>
                    <div className="lx-dogs">{l.names.map((n, j) => <span key={j} className="lx-dog">{n}</span>)}</div>
                  </div>
                  <div className="lx-amt">
                    <small>{l.qty} {L.unitVal} × {fmtAmount(l.unit)}</small>
                    {fmtAmount(l.unit * l.qty)}
                  </div>
                </div>
              ))}
          </div>

          {/* totals + legal note */}
          <div className="totals">
            <p className="note">
              <b>{L.dphVal}.</b>{' '}
              {L.vatNote}{' '}
              {L.orNote}{' '}
              {L.paidNote}
            </p>
            <div className="tbox">
              <div className="trow">
                <span>{L.subtotalLabel}</span>
                <span>{amountStr}</span>
              </div>
              <div className="trow">
                <span>{L.paidByCard}</span>
                <span>− {amountStr}</span>
              </div>
              <div className="trow grand">
                <span className="lbl">{L.toPay}</span>
                <span className="val">0,00 €</span>
              </div>
              <div className="words">{inWords}</div>
              <div style={{ textAlign: 'right' }}>
                <span className="paid-stamp">
                  {L.paidStamp}
                  <small>{L.paidSmall}{issuedDate}</small>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* pečať — stred dole, nad motto; pri dlhom zozname psov sa zmenší (meranie vyššie) */}
        {seal}

        <div className="foot">{L.footer}</div>
      </div>
    </>
  );
}
