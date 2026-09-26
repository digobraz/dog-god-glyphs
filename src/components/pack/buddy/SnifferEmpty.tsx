// SnifferEmpty — prázdny balíček: jazvečík okolo stromu + veta + DOČASNÝ OZNAM.
// Jeden blok pre SNIFFUJ aj HĽADAŤ (Matej 26. 9.: „Ups… Nie je tu nikto na základe tvojich
// preferencií" + oznam v dočasnom rámiku „Je nás tu málo…"). Nehovorí AINUBIS.
// Rámik = PODBLOK TMAVÝ (katalóg), štítok = PACK_HEAD.label.
// Oznam je DOČASNÝ — keď bude členov dosť, zmaž `.se-note` a kľúče `pack.sniffer.emptyNote*`.
import {
  PACK_THEME as T, PACK_BOX, PACK_HEAD, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, FONT_UI,
} from '@/components/pack/packTheme';

export const SNIFFER_EMPTY_CSS = `
/* STĹPEC: obrázok hore celou šírkou, text pod ním. Obrázok sa zmenšuje LEN výškou
   (cover orezáva oblohu a trávu, nikdy boky — vtip je na krajoch: nos pri zadku).
   Spodok obrázka vybledne do čiernej, na ktorej stojí text. */
.se-box{position:relative;flex:1 1 auto;min-height:360px;width:100%;max-width:440px;margin:0 auto;border-radius:${PACK_R.card}px;overflow:hidden;box-shadow:${PACK_SHADOW.panel};background:#000;
  display:flex;flex-direction:column;}
.se-box > img{flex:0 1 auto;min-height:0;width:100%;object-fit:cover;object-position:50% 72%;display:block;
  -webkit-mask-image:linear-gradient(180deg,#000 84%,transparent 100%);mask-image:linear-gradient(180deg,#000 84%,transparent 100%);}
.se-txt{margin-top:auto;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px ${PACK_SPACE.lg}px;color:${T.onDark};font-family:${FONT_UI};
  display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.se-txt strong{font-weight:600;font-size:${PACK_TEXT.lead}px;line-height:1.3;}
.se-note{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.se-note i{font-style:normal;color:${T.cardEdge};}
.se-note p{margin:0;font-size:${PACK_TEXT.label}px;line-height:1.45;color:${T.onDark};}
`;

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

export function SnifferEmpty({ tx }: { tx: Tx }) {
  return (
    <div className="se-box">
      <img src="/images/sniffer/empty-deck.jpg" alt="" />
      <div className="se-txt">
        <strong>{tx('pack.sniffer.emptyTitle', 'Oops… nobody here matches your preferences.')}</strong>
        <div className="se-note" style={{ ...PACK_BOX.subblockDark }}>
          <i style={{ ...PACK_HEAD.label }}>{tx('pack.sniffer.emptyNoteLabel', 'Notice')}</i>
          <p>{tx('pack.sniffer.emptyNote', 'There are only a few of us — DOGYPT has only just been born… Bring your friends here and help us fill it.')}</p>
        </div>
      </div>
    </div>
  );
}
