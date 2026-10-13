// ════════════════════════════════════════════════════════════════════════════
// PORADIE PSOV — editor na `/pack/dogs` (13. 10. 2026, nákres
// plany/nakres-poradie-psov-2026-10-13/, Matej: „ok A").
//
// Pilulka PORADIE stojí nad psími blokmi len pri 2+ psoch. Klik ju vymení za JEDNU
// KARTU s riadkami psov; ťahá sa za úchyt vpravo (nie za celý riadok — inak by sa na
// mobile nedalo rolovať stránkou) a HOTOVO uloží. Poradie platí pre domov, `/pack/dogs`
// aj KRONIKU (`lib/dogOrder.ts`).
//
// Úchyt je šesť bodiek v CSS, NIE lucide `GripVertical`: lucide by zhodil stráž
// `check:ikony` a hand-drawn kit úchyt nemá. Keď ho Matej dokreslí, vymení sa tu.
// Na PC je to ten istý jeden stĺpec (šírka formulára 640) — `Reorder` vie len jednu os,
// mriežka z nákresu by pri ťahaní skákala.
// ════════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { PACK_BOX, PACK_R, PACK_SHADOW, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, GOLD_BTN, PACK_THEME } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK } from '@/components/pack/navGoldSkin';
import { sizedUrl } from '@/services/cloudinaryService';
import { saveDogOrder } from '@/lib/dogOrder';

type Tx = (key: string, fallback: string) => string;

export interface OrderDog {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  pack_number: number | null;
}

// Pilulka stojí na TAPETE stránky, ktorá je podľa šatu čierna aj bledá — lapisový tint
// (`pickTintCSS`) je stavaný na papyrus a na čiernom zanikol. Preto výplň `.pk-pill`
// (papyrus, PILL_CSS) a lapis nesie len rám a písmo: akcia, čitateľná na oboch šatoch.
export const DOG_ORDER_CSS = `
.dor-bar{ display:flex; justify-content:flex-end; margin-bottom:-${PACK_SPACE.xs}px; }
.dor-pill{ display:inline-flex; align-items:center; justify-content:center; padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.pill}px; border:1px solid; cursor:pointer; white-space:nowrap;
  font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.label}px; letter-spacing:0.14em; text-transform:uppercase;
  background:linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%); border-color:${LAPIS.edge}; color:${PICK_INK.lapis};
  transition:transform .12s ease; }
.dor-pill:hover{ transform:translateY(-1px); }
.dor-card{ padding:${PACK_SPACE.lg}px; width:100%; max-width:640px; margin:0 auto; }
.dor-list{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:${PACK_SPACE.sm}px; }
.dor-row{ display:flex; align-items:center; gap:${PACK_SPACE.md}px; padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  position:relative; user-select:none; -webkit-user-select:none; }
.dor-photo{ width:48px; height:48px; border-radius:${PACK_R.pill}px; object-fit:cover; flex:none;
  border:2px solid ${PACK_THEME.cardEdge}; background:${PACK_THEME.tileBg}; }
.dor-name{ flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.body}px; letter-spacing:0.02em; color:${PACK_THEME.ink}; }
.dor-num{ flex:none; font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.label}px; letter-spacing:0.02em;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px; border-radius:${PACK_R.pill}px; background:${LAPIS.grad}; color:${LAPIS.ink}; }
.dor-grip{ flex:none; width:${PACK_SPACE.xl}px; height:${PACK_SPACE.xl + PACK_SPACE.md}px; display:grid; place-items:center;
  cursor:grab; touch-action:none; border-radius:${PACK_R.field}px; }
.dor-grip:active{ cursor:grabbing; }
.dor-grip i{ display:grid; grid-template-columns:repeat(2,4px); gap:4px; }
.dor-grip i b{ width:4px; height:4px; border-radius:${PACK_R.pill}px; background:${LAPIS.edge}; }
.dor-err{ margin:${PACK_SPACE.md}px 0 0; text-align:center; font-family:${FONT_UI}; font-size:${PACK_TEXT.label}px; color:${PICK_INK.red}; }
.dor-done{ display:flex; width:100%; align-items:center; justify-content:center; margin-top:${PACK_SPACE.lg}px;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.xl}px; border-radius:${PACK_R.field}px; border:1px solid ${GOLD_BTN.edge}; cursor:pointer;
  font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.label}px; letter-spacing:0.14em; text-transform:uppercase;
  background:${LAPIS.grad}; color:${LAPIS.ink}; box-shadow:${LAPIS_BTN_SHADOW}; transition:transform .2s; }
.dor-done:hover{ transform:scale(1.03); background:${LAPIS.gradHover}; }
.dor-done:disabled{ opacity:.6; cursor:default; transform:none; }
`;

export function DogOrderPill({ onClick, tx }: { onClick: () => void; tx: Tx }) {
  return (
    <div className="dor-bar">
      <button type="button" className="dor-pill" onClick={onClick}>{tx('pack.dogs.order', 'Order')}</button>
    </div>
  );
}

function DogOrderRow<T extends OrderDog>({ dog }: { dog: T }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={dog}
      dragListener={false}
      dragControls={controls}
      className="dor-row"
      style={{ ...PACK_BOX.row }}
      whileDrag={{ scale: 1.02, boxShadow: PACK_SHADOW.panel, zIndex: 2 }}
    >
      {dog.cloudinary_main_url
        ? <img className="dor-photo" src={sizedUrl(dog.cloudinary_main_url, 96)} alt="" draggable={false} />
        : <span className="dor-photo" />}
      <span className="dor-name">{dog.dog_name ?? '—'}</span>
      {dog.pack_number ? <span className="dor-num">#{dog.pack_number}</span> : null}
      <span
        className="dor-grip"
        role="button"
        aria-label={dog.dog_name ?? ''}
        onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
      >
        <i>{Array.from({ length: 6 }, (_, k) => <b key={k} />)}</i>
      </span>
    </Reorder.Item>
  );
}

export function DogOrderEditor<T extends OrderDog>({ dogs, tx, onDone }: { dogs: T[]; tx: Tx; onDone: (next: T[]) => void }) {
  const [items, setItems] = useState<T[]>(dogs);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(false);

  const done = async () => {
    // Nič sa nezmenilo → nezapisuj (inak by sa predvolené poradie „zamrzlo" do profilu).
    if (items.every((d, i) => d.id === dogs[i]?.id)) { onDone(items); return; }
    setSaving(true);
    setErr(false);
    try {
      await saveDogOrder(items.map((d) => d.id));
      onDone(items);
    } catch {
      setErr(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dor-card" style={{ ...PACK_BOX.card }}>
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="dor-list">
        {items.map((d) => <DogOrderRow key={d.id} dog={d} />)}
      </Reorder.Group>
      {err && <p className="dor-err">{tx('pack.dogs.orderErr', 'Could not save the order. Try again.')}</p>}
      <button type="button" className="dor-done" onClick={done} disabled={saving}>
        {tx('pack.dogs.orderDone', 'Done')}
      </button>
    </div>
  );
}
