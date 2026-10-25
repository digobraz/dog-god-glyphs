import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { PostViewer } from '@/components/pack/profile/PostViewer';
import { MeCompose } from '@/components/pack/profile/MeCompose';
import { PackSettings } from '@/components/pack/PackSettings';
const ph = ['/images/about-matej.png'];
const post = { id: 'x', body: 'Ranná prechádzka s Hektorom pri Vydrici. Zima, ale on to tak miluje.', photos: [ph[0], ph[0]], tags: ['post'],
  attach: { place: { name: 'Pozorovateľňa zvierat Vydrica', lat: 48.183, lon: 17.075 } }, visibility: 'public', createdAt: '2026-10-23T17:32:10Z' } as any;
const v = new URLSearchParams(location.search).get('v');
createRoot(document.getElementById('r')!).render(<MemoryRouter><LanguageProvider>
  {v === 'compose' ? <MeCompose mode="post" onClose={() => {}} />
   : v === 'settings' ? <div style={{ padding: 16 }}><PackSettings /></div>
   : <PostViewer post={post} name="Matej Stacho" avatar={ph[0]} dogs={[]} mine lang="sk" onClose={() => {}} />}
</LanguageProvider></MemoryRouter>);
