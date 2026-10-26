// OZNAM AINUBISA V UPOZORNENIACH (26. 10. 2026, len za TEST_BUILD).
//
// Matej nad stavbou FEED 2: *„ten prvý oznam ainubisa je ok ALE schovaj ho do upozornenia"* +
// *„každé prihlásenie hlási cyan upozornenie — kde oznámime počet členov (ak pribudnú) alebo nejaký oznam"*.
// Doska `AiBoard` spod hlavičky feedu preto zanikla a jej text je TU — prvý riadok panela chvosta.
// Kedy riadok svieti ako nový (cyan bodka na chvoste), rozhoduje `PackNotifications.tsx`.
//
// Načíta sa LENIVO, až keď sa panel otvorí: `useSaved` siaha na `vault_scrolls` a `useFeedTrips` na packStore,
// a ani jedno nesmie ísť do hlavného bundlu globálneho chrome.
//
// 🔴 NIČ SA NEFALŠUJE: text sa skladá len zo skutočných čísel; bez nich ostane pozvánka na otázku.
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { useSaved } from './vault/vaultScrolls';
import { useFeedTrips } from './feed/feedData';
import ainubisHead from '@/assets/ainubis-head.webp';

const DAY_MS = 86_400_000;

export default function AinubisOznam({ grown, onClose }: { grown: number; onClose: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const navigate = useNavigate();
  const saved = useSaved().length;
  const newTrips = useFeedTrips(50).filter((tr) => tr.at && Date.now() - tr.at < DAY_MS).length;
  const parts = [
    grown > 0 ? tx('pack.feed.board.grown', 'new dogs in the pack: {n}').replace('{n}', String(grown)) : '',
    saved > 0 ? tx('pack.feed.board.saved', 'scrolls put aside: {n}').replace('{n}', String(saved)) : '',
    newTrips > 0 ? tx('pack.feed.board.trips', 'new trips today: {n}').replace('{n}', String(newTrips)) : '',
  ].filter(Boolean);
  return (
    <div className="ntf-row ntf-row--ai">
      <span className="ntf-av"><img src={ainubisHead} alt="" /></span>
      <span className="ntf-txt">
        <span className="ntf-ai"><span>AI</span>NUBIS</span>
        <small>{parts.length ? parts.join(' · ') : tx('pack.feed.board.idle', 'Ask me anything about your dog.')}</small>
      </span>
      <button type="button" className="ntf-cta" onClick={() => { onClose(); navigate('/pack/ainubis'); }}>
        {tx('pack.feed.board.open', 'Open')}
      </button>
    </div>
  );
}
