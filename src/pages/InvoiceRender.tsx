import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

/**
 * Headless render target for beta invoice PDF generation (Cloudflare Browser
 * Rendering). Renders an A4 invoice with DOGYPT brand (papyrus/gold, Cinzel).
 *
 * URL: /invoice-render/:id?key=<RENDER_KEY>&lang=en|sk|cs
 *
 * The page sets data-render-ready="1" on <html> once data is loaded and fonts
 * are decoded — Cloudflare waits for that selector before printing.
 *
 * NOTE: This is a BETA invoice — clearly labelled as non-final, no IČO/DIČ.
 */

const EDGE_BASE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuenVyd21kZ3Z6bHFoc2JocnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDAxMzIsImV4cCI6MjA5MjI3NjEzMn0.oMdBisx_0Mla4PI1JtUT4lM1vgZVvbpcORfA8kbdWQY';

// i18n labels for the invoice
const LABELS: Record<string, Record<string, string>> = {
  en: {
    title: 'Invoice',
    beta: 'BETA · NOT A LEGAL TAX DOCUMENT',
    invoiceNumber: 'Invoice No.',
    date: 'Date',
    billTo: 'Bill To',
    description: 'Description',
    heroglyph: 'Heroglyph — Unique Sacred Symbol',
    quantity: 'Qty',
    unit: 'Unit Price',
    total: 'Total',
    currency: 'EUR',
    betaNote: 'This is a BETA confirmation receipt. Official invoicing will be issued from a registered entity. No IČO/DIČ/VAT registration applicable at this stage.',
    footer: 'In Dog We Trust.',
    seller: 'DOGYPT',
    country: 'Slovakia',
  },
  sk: {
    title: 'Faktúra',
    beta: 'BETA · TOTO NIE JE DAŇOVÝ DOKLAD',
    invoiceNumber: 'Číslo faktúry',
    date: 'Dátum',
    billTo: 'Odberateľ',
    description: 'Popis',
    heroglyph: 'Heroglyf — Unikátny posvätný symbol',
    quantity: 'Mn.',
    unit: 'Jedn. cena',
    total: 'Spolu',
    currency: 'EUR',
    betaNote: 'Toto je BETA potvrdenie o úhrade. Oficálne faktúry budú vydávané po registrácii subjektu. Zatiaľ bez IČO/DIČ.',
    footer: 'In Dog We Trust.',
    seller: 'DOGYPT',
    country: 'Slovensko',
  },
  cs: {
    title: 'Faktura',
    beta: 'BETA · TOTO NENÍ DAŇOVÝ DOKLAD',
    invoiceNumber: 'Číslo faktury',
    date: 'Datum',
    billTo: 'Odběratel',
    description: 'Popis',
    heroglyph: 'Hieroglyf — Unikátní posvátný symbol',
    quantity: 'Mn.',
    unit: 'Jedn. cena',
    total: 'Celkem',
    currency: 'EUR',
    betaNote: 'Toto je BETA potvrzení o úhradě. Oficiální faktury budou vydávány po registraci subjektu. Zatím bez IČO/DIČ.',
    footer: 'In Dog We Trust.',
    seller: 'DOGYPT',
    country: 'Slovensko',
  },
};

function detectLang(country?: string | null, paramLang?: string | null): string {
  if (paramLang && LABELS[paramLang]) return paramLang;
  if (country === 'SVK') return 'sk';
  if (country === 'CZE') return 'cs';
  return 'en';
}

interface InvoiceDog {
  id: string;
  dog_name: string | null;
  owner_name: string | null;
  email: string | null;
  amount: number | null;
  country: string | null;
  stripe_session_id: string | null;
  created_at: string;
  pack_number?: number | null;
}

export default function InvoiceRender() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const key = params.get('key') || '';
  const langParam = params.get('lang');

  const [dog, setDog] = useState<InvoiceDog | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let alive = true;
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
  }, [id, key]);

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

  const dogName = dog.dog_name || 'Unnamed';
  const ownerName = dog.owner_name || '';
  const amount = dog.amount ?? 11;

  // Invoice number: DGP-BETA-{pack_number} or DGP-BETA-{id prefix}
  const invoiceNumber = dog.pack_number
    ? `DGP-BETA-${String(dog.pack_number).padStart(5, '0')}`
    : `DGP-BETA-${dog.id.slice(0, 8).toUpperCase()}`;

  const issuedDate = (() => {
    try {
      return new Date(dog.created_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return ''; }
  })();

  const gold = '#C99A3F';
  const darkGold = '#A07423';
  const papyrus = '#f0e3c4';
  const papyrusDark = '#ecdbb8';
  const textDark = '#1a0900';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Space+Grotesk:wght@400;500;600&display=swap');
        @page { size: A4 portrait; margin: 0; }
        html, body, #root { margin: 0; padding: 0; background: ${papyrus}; }
        * { box-sizing: border-box; }
        #invoice-page { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>
      <div
        id="invoice-page"
        style={{
          width: '210mm',
          minHeight: '297mm',
          background: `
            radial-gradient(ellipse 90% 100% at 50% 50%, transparent 52%, rgba(80,45,5,0.12) 100%),
            linear-gradient(170deg, #f6edd8 0%, ${papyrus} 25%, ${papyrusDark} 55%, #f2e4c8 80%, #f6edd8 100%)
          `,
          padding: '0',
          fontFamily: "'Space Grotesk', Arial, sans-serif",
          color: textDark,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top gold stripe */}
        <div style={{
          height: '14px',
          background: `linear-gradient(90deg, #3a2a0a 0%, #6b4d18 30%, ${gold} 50%, #6b4d18 70%, #3a2a0a 100%)`,
        }} />

        {/* BETA watermark diagonal */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-35deg)',
          fontSize: '120px',
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          color: 'rgba(201,154,63,0.07)',
          letterSpacing: '0.3em',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}>BETA</div>

        {/* Content */}
        <div style={{ padding: '24mm 22mm 16mm', position: 'relative', zIndex: 1 }}>

          {/* Header row: logo + title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10mm' }}>
            {/* Left: logo block */}
            <div>
              <img
                src="https://dogypt.com/images/peciat-dogypt.png"
                alt="DOGYPT"
                width="64"
                height="64"
                style={{ display: 'block', marginBottom: '8px' }}
              />
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: '18px',
                letterSpacing: '0.22em',
                color: textDark,
                textTransform: 'uppercase',
              }}>DOGYPT</div>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '9px',
                letterSpacing: '0.3em',
                color: darkGold,
                textTransform: 'uppercase',
                marginTop: '2px',
              }}>In Dog We Trust</div>
              <div style={{
                fontSize: '10px',
                color: 'rgba(80,50,10,0.5)',
                marginTop: '8px',
                lineHeight: 1.5,
              }}>
                dogypt.com<br />
                heroglyph@dogypt.com<br />
                {L.country}
              </div>
            </div>

            {/* Right: invoice meta */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: '28px',
                letterSpacing: '0.08em',
                color: textDark,
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>{L.title}</div>

              {/* BETA badge */}
              <div style={{
                display: 'inline-block',
                background: `linear-gradient(135deg, rgba(201,154,63,0.18), rgba(201,154,63,0.08))`,
                border: `1.5px solid ${gold}`,
                borderRadius: '6px',
                padding: '3px 10px',
                fontFamily: "'Cinzel', serif",
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                color: darkGold,
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>{L.beta}</div>

              <table style={{ marginLeft: 'auto', borderCollapse: 'collapse', fontSize: '11px', color: textDark }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '3px 12px 3px 0', color: 'rgba(80,50,10,0.55)', fontWeight: 500, textAlign: 'right', whiteSpace: 'nowrap' }}>{L.invoiceNumber}:</td>
                    <td style={{ padding: '3px 0', fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: '0.06em' }}>{invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 12px 3px 0', color: 'rgba(80,50,10,0.55)', fontWeight: 500, textAlign: 'right' }}>{L.date}:</td>
                    <td style={{ padding: '3px 0' }}>{issuedDate}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, marginBottom: '10mm' }} />

          {/* Bill To */}
          <div style={{ marginBottom: '10mm' }}>
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '10px',
              letterSpacing: '0.28em',
              color: darkGold,
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>{L.billTo}</div>
            <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.7 }}>
              {ownerName && <div>{ownerName}</div>}
              {dog.email && <div style={{ color: 'rgba(80,50,10,0.65)', fontSize: '11px' }}>{dog.email}</div>}
              {dog.country && <div style={{ color: 'rgba(80,50,10,0.5)', fontSize: '11px' }}>{dog.country}</div>}
            </div>
          </div>

          {/* Line items table */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '10mm',
            fontSize: '11px',
          }}>
            <thead>
              <tr style={{
                background: `linear-gradient(90deg, rgba(201,154,63,0.15), rgba(201,154,63,0.06))`,
                borderBottom: `1.5px solid ${gold}`,
              }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '0.2em', color: darkGold, textTransform: 'uppercase', fontWeight: 600 }}>{L.description}</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '0.2em', color: darkGold, textTransform: 'uppercase', fontWeight: 600, width: '50px' }}>{L.quantity}</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '0.2em', color: darkGold, textTransform: 'uppercase', fontWeight: 600, width: '80px' }}>{L.unit}</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '0.2em', color: darkGold, textTransform: 'uppercase', fontWeight: 600, width: '80px' }}>{L.total}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid rgba(201,154,63,0.2)` }}>
                <td style={{ padding: '12px 10px' }}>
                  <div style={{ fontWeight: 500, marginBottom: '2px' }}>{L.heroglyph}</div>
                  <div style={{ color: 'rgba(80,50,10,0.55)', fontSize: '10px', fontFamily: "'Cinzel', serif", letterSpacing: '0.04em' }}>{dogName}</div>
                </td>
                <td style={{ padding: '12px 10px', textAlign: 'center' }}>1</td>
                <td style={{ padding: '12px 10px', textAlign: 'right' }}>{amount.toFixed(2)} {L.currency}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600 }}>{amount.toFixed(2)} {L.currency}</td>
              </tr>
            </tbody>
          </table>

          {/* Total box */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10mm' }}>
            <div style={{
              border: `1.5px solid ${gold}`,
              borderRadius: '8px',
              background: `linear-gradient(135deg, rgba(201,154,63,0.15), rgba(201,154,63,0.05))`,
              padding: '12px 24px',
              minWidth: '160px',
              textAlign: 'right',
            }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.22em', color: darkGold, textTransform: 'uppercase', fontFamily: "'Cinzel', serif", marginBottom: '6px' }}>{L.total}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '22px', letterSpacing: '0.06em', color: textDark }}>
                {amount.toFixed(2)} <span style={{ fontSize: '14px' }}>{L.currency}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, marginBottom: '8mm' }} />

          {/* BETA note */}
          <div style={{
            background: `linear-gradient(135deg, rgba(201,154,63,0.1), rgba(201,154,63,0.04))`,
            border: `1px solid rgba(201,154,63,0.3)`,
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '9px',
            color: 'rgba(80,50,10,0.6)',
            lineHeight: 1.6,
            marginBottom: '8mm',
          }}>
            ⚠ {L.betaNote}
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            fontFamily: "'Cinzel', serif",
            fontSize: '10px',
            letterSpacing: '0.35em',
            color: darkGold,
            textTransform: 'uppercase',
            marginTop: '4mm',
          }}>{L.footer}</div>

        </div>

        {/* Bottom gold stripe */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '14px',
          background: `linear-gradient(90deg, #3a2a0a 0%, #6b4d18 30%, ${gold} 50%, #6b4d18 70%, #3a2a0a 100%)`,
        }} />
      </div>
    </>
  );
}
