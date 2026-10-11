// NÁHĽAD 1:1 PRE HORSKÚ CHATU (DOGYPTLAND, 11. 10. 2026)
// Chata vloží článok výletu do iframe s `?nahlad=1` a pošle mu upravený payload čakajúceho
// výletu (PackTripArticle.tsx). Platí LEN v lokálnom builde na ostrých dátach
// (`bash scripts/lokal-livedb.sh` = `--mode livedb`, :8081); v produkčnom builde je to konštanta false.
// Článok sa vtedy číta bez prihlásenia — rovnako, ako ho uvidí ktokoľvek zo svorky.
export const CHATA_NAHLAD = import.meta.env.MODE === 'livedb'
  && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('nahlad');
