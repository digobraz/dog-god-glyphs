// DOČASNÝ NÁHĽAD v4 — bloky 1–6 (launcher, mapa, prehliadač trás, moje trasy, rebríčky, eventy). ZMAZAŤ pred commitom.
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, ScaleControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapyTiles, MAPY_API_KEY } from '@/lib/env';
import { snapSegment, buildLine } from '@/lib/snapToTrail';
import { placeIcon } from '@/components/geo/trailIcons';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated'; // ⚙️ done tripy z nahadzovača (gen-hero-trails.mjs)
import { REGION_MAPS } from '@/components/geo/regionMaps';
import { findPohorie, type Zone } from '@/components/geo/regions';
import { DevotionHeader } from '@/components/pack/PackLayout';
import navHome from '@/assets/icons/nav-home.svg';
import navHike from '@/assets/icons/portal-hike.svg';
import navSettings from '@/assets/icons/nav-settings.svg';

const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const CARD = '#FFFBF2';
const ICON = (n: string) => `/icons/pack/${n}.svg`;
const HEKTOR_PHOTO = 'https://res.cloudinary.com/dz8lolmod/image/upload/v1780676154/dogs/hektor/u1pmfdh8hpyctq0tqq5r.jpg';
const MATEJ_PHOTO = 'https://res.cloudinary.com/dz8lolmod/image/upload/v1780678253/owners/matej/pyjw64j1wc7jscp91z8i.png';

const TRAIL: LatLngTuple[] = [[49.198,19.045],[49.203,19.052],[49.209,19.061],[49.214,19.070],[49.219,19.079]];
const CENTER: LatLngTuple = [49.209, 19.062];

type Card = {
  id: string;
  name: string;
  region: string;
  diff?: 'Easy' | 'Moderate' | 'Hard';
  km?: string;
  stars?: number;
  img: string;
  hekthor?: boolean;
  fromUser?: boolean;
  near?: boolean;
  dogFriendly?: boolean;
  pohorie?: string;
  favCount?: number;
  activity?: string; // TRIP_ACTIVITIES id; chýba = 'hiking'
};

const CARDS: Card[] = [
  { id: 'zaruby', name: 'Záruby', region: 'Malé Karpaty', img: 'zaruby', pohorie: 'male-karpaty' },
  { id: 'vapenna-rostun', name: 'Vápenná (Roštún)', region: 'Malé Karpaty', img: 'vapenna-rostun', pohorie: 'male-karpaty' },
  { id: 'havranica', name: 'Havranica', region: 'Malé Karpaty', img: 'havranica', pohorie: 'male-karpaty' },
  { id: 'slepy-vrch', name: 'Slepý vrch', region: 'Malé Karpaty', img: 'slepy-vrch', pohorie: 'male-karpaty' },
  { id: 'kukla', name: 'Kukla', region: 'Malé Karpaty', img: 'kukla', pohorie: 'male-karpaty' },
  { id: 'klenova', name: 'Klenová', region: 'Malé Karpaty', img: 'klenova', pohorie: 'male-karpaty' },
  { id: 'smolenice-zaruby', name: 'Smolenice → Záruby', region: 'Malé Karpaty', img: 'smolenice-zaruby', pohorie: 'male-karpaty' },
  { id: 'veterlin', name: 'Veterlín', region: 'Malé Karpaty', img: 'veterlin', pohorie: 'male-karpaty' },
  { id: 'amonova-luka', name: 'Amonova lúka', region: 'Malé Karpaty', img: 'amonova-luka', pohorie: 'male-karpaty' },
  { id: 'cierna-skala', name: 'Čierna skala', region: 'Malé Karpaty', img: 'cierna-skala', pohorie: 'male-karpaty' },
  { id: 'plavecky-hrad', name: 'Plavecký hrad', region: 'Malé Karpaty', img: 'plavecky-hrad', pohorie: 'male-karpaty' },
  { id: 'plavecke-podhradie', name: 'Plavecké Podhradie', region: 'Malé Karpaty', img: 'plavecke-podhradie', pohorie: 'male-karpaty' },
  { id: 'jelenia-hora', name: 'Jelenia hora', region: 'Malé Karpaty', img: 'jelenia-hora', pohorie: 'male-karpaty' },
  { id: 'majdan', name: 'Majdán', region: 'Malé Karpaty', img: 'majdan', pohorie: 'male-karpaty' },
  { id: 'budzogan-plavecky', name: 'Budzogáň (plavecký)', region: 'Malé Karpaty', img: 'budzogan-plavecky', pohorie: 'male-karpaty' },
  { id: 'vysoka', name: 'Vysoká', region: 'Malé Karpaty', img: 'vysoka', pohorie: 'male-karpaty' },
  { id: 'cerveny-kamen-casta', name: 'Červený Kameň – Častá', region: 'Malé Karpaty', img: 'cerveny-kamen-casta', pohorie: 'male-karpaty' },
  { id: 'casta-pila', name: 'Častá-Píla', region: 'Malé Karpaty', img: 'casta-pila', pohorie: 'male-karpaty' },
  { id: 'egres', name: 'Egreš', region: 'Malé Karpaty', img: 'egres', pohorie: 'male-karpaty' },
  { id: 'budmerice', name: 'Budmerice', region: 'Malé Karpaty', img: 'budmerice', pohorie: 'male-karpaty' },
  { id: 'dobra-voda', name: 'Dobrá Voda', region: 'Malé Karpaty', img: 'dobra-voda', pohorie: 'male-karpaty' },
  { id: 'dechtice', name: 'Dechtice', region: 'Malé Karpaty', img: 'dechtice', pohorie: 'male-karpaty' },
  { id: 'prasnik', name: 'Prašník', region: 'Malé Karpaty', img: 'prasnik', pohorie: 'male-karpaty' },
  { id: 'chtelnica', name: 'Chtelnica', region: 'Malé Karpaty', img: 'chtelnica', pohorie: 'male-karpaty' },
  { id: 'plesiva-chtelnica', name: 'Plešivá – Chtelnica', region: 'Malé Karpaty', img: 'plesiva-chtelnica', pohorie: 'male-karpaty' },
  { id: 'lancarska-luka', name: 'Lančárska lúka', region: 'Malé Karpaty', img: 'lancarska-luka', pohorie: 'male-karpaty' },
  { id: 'cachticky-hrad-plesivce', name: 'Čachtický hrad – Plešivce', region: 'Malé Karpaty', img: 'cachticky-hrad-plesivce', pohorie: 'male-karpaty' },
  { id: 'orlie-skaly', name: 'Orlie skaly', region: 'Malé Karpaty', img: 'orlie-skaly', pohorie: 'male-karpaty' },
  { id: 'medvedie-udolie-limbach', name: 'Medvedie údolie – Limbach', region: 'Malé Karpaty', img: 'medvedie-udolie-limbach', pohorie: 'male-karpaty' },
  { id: 'bukova', name: 'Buková', region: 'Malé Karpaty', img: 'bukova', pohorie: 'male-karpaty' },
  { id: 'jelenec-pri-castej-695-m', name: 'Jelenec (pri Častej, 695 m)', region: 'Malé Karpaty', img: 'jelenec-pri-castej-695-m', pohorie: 'male-karpaty' },
  { id: 'stary-plast', name: 'Starý plášť', region: 'Malé Karpaty', img: 'stary-plast', pohorie: 'male-karpaty' },
  { id: 'velka-javorina', name: 'Veľká Javorina', region: 'Biele Karpaty', img: 'velka-javorina', pohorie: 'biele-karpaty' },
  { id: 'vrsatecke-podhradie', name: 'Vršatecké Podhradie', region: 'Biele Karpaty', img: 'vrsatecke-podhradie', pohorie: 'biele-karpaty' },
  { id: 'velky-lopenik', name: 'Veľký Lopeník', region: 'Biele Karpaty', img: 'velky-lopenik', pohorie: 'biele-karpaty' },
  { id: 'haluzicka-tiesnava', name: 'Haluzická tiesňava', region: 'Biele Karpaty', img: 'haluzicka-tiesnava', pohorie: 'biele-karpaty' },
  { id: 'dracia-studna', name: 'Dračia studňa', region: 'Biele Karpaty', img: 'dracia-studna', pohorie: 'biele-karpaty' },
  { id: 'zlatnicka-dolina', name: 'Zlatnícka dolina', region: 'Biele Karpaty', img: 'zlatnicka-dolina', pohorie: 'biele-karpaty' },
  { id: 'inovec', name: 'Inovec', region: 'Považský Inovec', img: 'inovec', pohorie: 'povazsky-inovec' },
  { id: 'marhat', name: 'Marhát', region: 'Považský Inovec', img: 'marhat', pohorie: 'povazsky-inovec' },
  { id: 'bezovec', name: 'Bezovec', region: 'Považský Inovec', img: 'bezovec', pohorie: 'povazsky-inovec' },
  { id: 'hubina', name: 'Hubina', region: 'Považský Inovec', img: 'hubina', pohorie: 'povazsky-inovec' },
  { id: 'tesare', name: 'Tesáre', region: 'Považský Inovec', img: 'tesare', pohorie: 'povazsky-inovec' },
  { id: 'strazov', name: 'Strážov', region: 'Strážovské vrchy', img: 'strazov', pohorie: 'strazovske-vrchy' },
  { id: 'rokos', name: 'Rokoš', region: 'Strážovské vrchy', img: 'rokos', pohorie: 'strazovske-vrchy' },
  { id: 'vapec', name: 'Vápeč', region: 'Strážovské vrchy', img: 'vapec', pohorie: 'strazovske-vrchy' },
  { id: 'sulovske-skaly', name: 'Súľovské skaly', region: 'Strážovské vrchy', img: 'sulovske-skaly', pohorie: 'strazovske-vrchy' },
  { id: 'zbynovsky-budzogan', name: 'Zbyňovský budzogáň', region: 'Strážovské vrchy', img: 'zbynovsky-budzogan', pohorie: 'strazovske-vrchy' },
  { id: 'zobor', name: 'Zobor', region: 'Tribeč', img: 'zobor', pohorie: 'tribec' },
  { id: 'velky-krivan', name: 'Veľký Kriváň', region: 'Malá Fatra', img: 'velky-krivan', pohorie: 'mala-fatra' },
  { id: 'velky-rozsutec', name: 'Veľký Rozsutec', region: 'Malá Fatra', img: 'velky-rozsutec', pohorie: 'mala-fatra' },
  { id: 'maly-rozsutec', name: 'Malý Rozsutec', region: 'Malá Fatra', img: 'maly-rozsutec', pohorie: 'mala-fatra' },
  { id: 'janosikove-diery-stefanova', name: 'Jánošíkove diery – Štefanová', region: 'Malá Fatra', img: 'janosikove-diery-stefanova', pohorie: 'mala-fatra' },
  { id: 'sokolie', name: 'Sokolie', region: 'Malá Fatra', img: 'sokolie', pohorie: 'mala-fatra' },
  { id: 'klak', name: 'Kľak', region: 'Malá Fatra', img: 'klak', pohorie: 'mala-fatra' },
  { id: 'sutovsky-vodopad', name: 'Šútovský vodopád', region: 'Malá Fatra', img: 'sutovsky-vodopad', pohorie: 'mala-fatra' },
  { id: 'mincol', name: 'Minčol', region: 'Malá Fatra', img: 'mincol', pohorie: 'mala-fatra' },
  { id: 'ostredok', name: 'Ostredok', region: 'Veľká Fatra', img: 'ostredok', pohorie: 'velka-fatra' },
  { id: 'tlsta-ostra', name: 'Tlstá – Ostrá', region: 'Veľká Fatra', img: 'tlsta-ostra', pohorie: 'velka-fatra' },
  { id: 'gaderska-dolina', name: 'Gaderská dolina', region: 'Veľká Fatra', img: 'gaderska-dolina', pohorie: 'velka-fatra' },
  { id: 'velky-choc', name: 'Veľký Choč', region: 'Chočské vrchy', img: 'velky-choc', pohorie: 'chocske-vrchy' },
  { id: 'sip', name: 'Šíp', region: 'Chočské vrchy', img: 'sip', pohorie: 'chocske-vrchy' },
  { id: 'kvacianska-dolina', name: 'Kvačianska dolina', region: 'Chočské vrchy', img: 'kvacianska-dolina', pohorie: 'chocske-vrchy' },
  { id: 'chopok-dumbier', name: 'Chopok – Ďumbier', region: 'Nízke Tatry', img: 'chopok-dumbier', pohorie: 'nizke-tatry' },
  { id: 'ohniste', name: 'Ohnište', region: 'Nízke Tatry', img: 'ohniste', pohorie: 'nizke-tatry' },
  { id: 'sivy-vrch', name: 'Sivý vrch', region: 'Západné Tatry', img: 'sivy-vrch', pohorie: 'zapadne-tatry' },
  { id: 'bielovodska-dolina', name: 'Bielovodská dolina', region: 'Vysoké Tatry', img: 'bielovodska-dolina', pohorie: 'vysoke-tatry' },
  { id: 'zelene-pleso', name: 'Zelené pleso', region: 'Vysoké Tatry', img: 'zelene-pleso', pohorie: 'vysoke-tatry' },
  { id: 'tomasovsky-vyhlad', name: 'Tomášovský výhľad', region: 'Volovské vrchy', img: 'tomasovsky-vyhlad', pohorie: 'volovske-vrchy' },
  { id: 'poloniny', name: 'Poloniny', region: 'Bukovské vrchy', img: 'poloniny', pohorie: 'bukovske-vrchy' },
  { id: 'liptovska-mara', name: 'Liptovská Mara', region: 'Vodné diela', img: 'liptovska-mara', activity: 'paddleboard' },
  { id: 'kralova', name: 'Kráľová', region: 'Vodné diela', img: 'kralova', activity: 'paddleboard' },
  { id: 'slnava', name: 'Sĺňava', region: 'Vodné diela', img: 'slnava', activity: 'paddleboard' },
  { id: 'oresianska-priehrada', name: 'Orešianska priehrada', region: 'Vodné diela', img: 'oresianska-priehrada', activity: 'paddleboard' },
  { id: 'chtelnicka-priehrada', name: 'Chtelnická priehrada', region: 'Vodné diela', img: 'chtelnicka-priehrada', activity: 'paddleboard' },
  { id: 'palcmanska-masa', name: 'Palcmanská Maša', region: 'Vodné diela', img: 'palcmanska-masa', activity: 'paddleboard' },
  { id: 'snp-den-1', name: 'Deň 1 — Prvý kontakt', region: 'Malé Karpaty', diff: 'Hard', km: '27.24', img: 'snp-den-1', pohorie: 'male-karpaty' },
  { id: 'snp-den-2', name: 'Deň 2 — Parťáci do deště', region: 'Malé Karpaty', diff: 'Hard', km: '33.81', img: 'snp-den-2', pohorie: 'male-karpaty' },
  { id: 'snp-den-3', name: 'Deň 3 — Holý, bosý, rozmočený', region: 'Malé Karpaty', diff: 'Hard', km: '32.51', img: 'snp-den-3', pohorie: 'male-karpaty' },
  { id: 'snp-den-4', name: 'Deň 4 — Blízko, a tak ďaleko', region: 'Malé Karpaty', diff: 'Hard', km: '26.79', img: 'snp-den-4', pohorie: 'male-karpaty' },
  { id: 'snp-den-5', name: 'Deň 5 — Zlatá rybka', region: 'Biele Karpaty', diff: 'Moderate', km: '23', img: 'snp-den-5', pohorie: 'biele-karpaty' },
  { id: 'snp-den-6', name: 'Deň 6 — Symfonický orchester', region: 'Biele Karpaty', diff: 'Moderate', km: '24.14', img: 'snp-den-6', pohorie: 'biele-karpaty' },
  { id: 'snp-den-7', name: 'Deň 7 — Česká aromaterapia', region: 'Biele Karpaty', diff: 'Hard', km: '26.49', img: 'snp-den-7', pohorie: 'biele-karpaty' },
  { id: 'snp-den-8', name: 'Deň 8 — Krížová cesta', region: 'Biele Karpaty', diff: 'Hard', km: '26.34', img: 'snp-den-8', pohorie: 'biele-karpaty' },
  { id: 'snp-den-9', name: 'Deň 9 — Stret so Sandokanom', region: 'Strážovské vrchy', diff: 'Moderate', km: '20.42', img: 'snp-den-9', pohorie: 'strazovske-vrchy' },
  { id: 'snp-den-10', name: 'Deň 10 — Prelet nad slepačím hniezdom', region: 'Strážovské vrchy', diff: 'Hard', km: '29.94', img: 'snp-den-10', pohorie: 'strazovske-vrchy' },
  { id: 'snp-den-11', name: 'Deň 11 — Matka Zem', region: 'Strážovské vrchy', diff: 'Easy', km: '12.85', img: 'snp-den-11', pohorie: 'strazovske-vrchy' },
  { id: 'snp-den-12', name: 'Deň 12 — Neznámy narušiteľ', region: 'Strážovské vrchy', diff: 'Hard', km: '24.71', img: 'snp-den-12', pohorie: 'strazovske-vrchy' },
  { id: 'snp-den-13', name: 'Deň 13 — Proci prúdu', region: 'Kremnické vrchy', diff: 'Hard', km: '26.38', img: 'snp-den-13', pohorie: 'kremnicke-vrchy' },
  { id: 'snp-den-14', name: 'Deň 14 — Walking dead', region: 'Kremnické vrchy', diff: 'Moderate', km: '22.53', img: 'snp-den-14', pohorie: 'kremnicke-vrchy' },
  { id: 'snp-den-15', name: 'Deň 15 — Čmeliak', region: 'Kremnické vrchy', diff: 'Easy', km: '9', img: 'snp-den-15', pohorie: 'kremnicke-vrchy' },
  { id: 'snp-den-16', name: 'Deň 16 — Cesta na mesiac', region: 'Veľká Fatra', diff: 'Moderate', km: '23.08', img: 'snp-den-16', pohorie: 'velka-fatra' },
  { id: 'snp-den-17', name: 'Deň 17 — Rozlúčka so slobodou', region: 'Veľká Fatra', diff: 'Hard', km: '21.42', img: 'snp-den-17', pohorie: 'velka-fatra' },
  { id: 'snp-den-18', name: 'Deň 18 — Opekačka', region: 'Nízke Tatry', diff: 'Easy', km: '9.08', img: 'snp-den-18', pohorie: 'nizke-tatry' },
  { id: 'snp-den-19', name: 'Deň 19 — Výročný šlofík', region: 'Nízke Tatry', diff: 'Hard', km: '18.67', img: 'snp-den-19', pohorie: 'nizke-tatry' },
  { id: 'snp-den-20', name: 'Deň 20 — Dráma na hrebeni', region: 'Nízke Tatry', diff: 'Hard', km: '19.34', img: 'snp-den-20', pohorie: 'nizke-tatry' },
  { id: 'snp-den-21', name: 'Deň 21 — Postrach meteorológov', region: 'Nízke Tatry', diff: 'Moderate', km: '17', img: 'snp-den-21', pohorie: 'nizke-tatry' },
  { id: 'snp-den-22', name: 'Deň 22 — Tatran race', region: 'Nízke Tatry', diff: 'Hard', km: '22.63', img: 'snp-den-22', pohorie: 'nizke-tatry' },
  { id: 'snp-den-23', name: 'Deň 23 — Pařba na Čuntave', region: 'Nízke Tatry', diff: 'Hard', km: '27.15', img: 'snp-den-23', pohorie: 'nizke-tatry' },
  { id: 'snp-den-24', name: 'Deň 24 — Načuntovaný pútnik', region: 'Slovenské rudohorie', diff: 'Moderate', km: '16.3', img: 'snp-den-24', pohorie: 'slovenske-rudohorie' },
  { id: 'snp-den-25', name: 'Deň 25 — Piráti z Mašibiku (1)', region: 'Slovenské rudohorie', img: 'snp-den-25', pohorie: 'slovenske-rudohorie' },
  { id: 'snp-den-26', name: 'Deň 26 — Piráti z Mašibiku (2)', region: 'Slovenské rudohorie', img: 'snp-den-26', pohorie: 'slovenske-rudohorie' },
  { id: 'snp-den-27', name: 'Deň 27 — Bolestivá pečiatka', region: 'Volovské vrchy', diff: 'Easy', km: '14.31', img: 'snp-den-27', pohorie: 'volovske-vrchy' },
  { id: 'snp-den-28', name: 'Deň 28 — Najdrahšia pica', region: 'Volovské vrchy', diff: 'Hard', km: '30.59', img: 'snp-den-28', pohorie: 'volovske-vrchy' },
  { id: 'snp-den-29', name: 'Deň 29 — Pes v prevleku', region: 'Volovské vrchy', diff: 'Moderate', km: '22.91', img: 'snp-den-29', pohorie: 'volovske-vrchy' },
  { id: 'snp-den-30', name: 'Deň 30 — Zhody náhod', region: 'Volovské vrchy', diff: 'Hard', km: '25.74', img: 'snp-den-30', pohorie: 'volovske-vrchy' },
  { id: 'snp-den-31', name: 'Deň 31 — Košický opijáš', region: 'Volovské vrchy', diff: 'Moderate', km: '23.6', img: 'snp-den-31', pohorie: 'volovske-vrchy' },
  { id: 'snp-den-32', name: 'Deň 32 — Stín katedrál', region: 'Cesta hrdinov SNP 2022', diff: 'Hard', km: '28.17', img: 'snp-den-32' },
  { id: 'snp-den-33', name: 'Deň 33 — Tenkrát v Kysakwood-u', region: 'Cesta hrdinov SNP 2022', img: 'snp-den-33' },
  { id: 'snp-den-34', name: 'Deň 34 — Pešibus', region: 'Cesta hrdinov SNP 2022', diff: 'Hard', km: '26.36', img: 'snp-den-34' },
  { id: 'snp-den-35', name: 'Deň 35 — Nepoviem', region: 'Cesta hrdinov SNP 2022', diff: 'Moderate', km: '21.25', img: 'snp-den-35' },
  { id: 'snp-den-36', name: 'Deň 36 — Yesman v Bardejove (1)', region: 'Cesta hrdinov SNP 2022', img: 'snp-den-36' },
  { id: 'snp-den-37', name: 'Deň 37 — Yesman v Bardejove (2)', region: 'Cesta hrdinov SNP 2022', img: 'snp-den-37' },
  { id: 'snp-den-38', name: 'Deň 38 — Tajomná komnata', region: 'Cesta hrdinov SNP 2022', diff: 'Moderate', km: '22.6', img: 'snp-den-38' },
  { id: 'snp-den-39', name: 'Deň 39 — Dom č. 152', region: 'Cesta hrdinov SNP 2022', diff: 'Moderate', km: '17.16', img: 'snp-den-39' },
  { id: 'snp-den-40', name: 'Deň 40 — Čarovný prútik', region: 'Cesta hrdinov SNP 2022', diff: 'Moderate', km: '24.82', img: 'snp-den-40' },
  { id: 'snp-den-41', name: 'Deň 41 — Tchor v džakuze', region: 'Cesta hrdinov SNP 2022', diff: 'Easy', km: '11', img: 'snp-den-41' },
  { id: 'snp-den-42', name: 'Deň 42 — Zvláštny smútok esenpéčkarov', region: 'Cesta hrdinov SNP 2022', diff: 'Easy', km: '11.96', img: 'snp-den-42' },
  { id: 'bled', name: 'Bled', region: 'Zahraničie', img: 'bled' },
  { id: 'vintgar-radovna-tiesnava', name: 'Vintgar (Radovna tiesňava)', region: 'Zahraničie', img: 'vintgar-radovna-tiesnava' },
  { id: 'bibione', name: 'Bibione', region: 'Zahraničie', img: 'bibione' },
  { id: 'balkan', name: 'Balkán', region: 'Zahraničie', img: 'balkan' },
  { id: 'srbsko', name: 'Srbsko', region: 'Zahraničie', img: 'srbsko' },
  { id: 'svajciarsko', name: 'Švajčiarsko', region: 'Zahraničie', img: 'svajciarsko' },
];


const DIFF_ORDER: Record<'Easy' | 'Moderate' | 'Hard', number> = { 'Easy': 0, 'Moderate': 1, 'Hard': 2 };

// Blok 3 (prehliadač výletov) — sort možnosti pre dropdown
// Zatiaľ len Top rated (Most popular = takmer to isté kým nemáme reálne favCount dáta; Easiest/Shortest doplníme po nakŕmení reálnymi dátami)
const SORT_OPTS: { v: 'rating' | 'easy' | 'short' | 'pop'; l: string }[] = [
  { v: 'rating', l: 'Top rated' },
];

const MY_TRAILS: Record<'wishlist' | 'prejdene' | 'oblubene', (Card & { heartCount?: number })[]> = {
  wishlist: [CARDS[3], CARDS[5], CARDS[11], CARDS[8]],
  prejdene: [CARDS[0], CARDS[2], CARDS[6], CARDS[9], CARDS[13]],
  oblubene: [
    { ...CARDS[0], heartCount: 42 },
    { ...CARDS[6], heartCount: 31 },
    { ...CARDS[2], heartCount: 27 },
    { ...CARDS[5], heartCount: 19 },
  ],
};

const RANK_TRAILS: { name: string; stars: number; visits: number }[] = [
  { name: 'Roháčske plesá',        stars: 5.0, visits: 312 },
  { name: "Hektor's Path",         stars: 4.8, visits: 289 },
  { name: 'Symbolický cintorín',   stars: 4.9, visits: 244 },
  { name: 'Jánošíkove diery',      stars: 4.9, visits: 231 },
  { name: 'Zádielska tiesňava',    stars: 4.6, visits: 198 },
  { name: 'Rozsutec Loop',        stars: 4.6, visits: 176 },
];

const RANK_PEOPLE: { name: string; km: number; places: number }[] = [
  { name: 'Matej & Hektor', km: 412, places: 34 },
  { name: 'Zuzka K.',       km: 388, places: 29 },
  { name: 'Peter M.',       km: 301, places: 22 },
  { name: 'Lucia B.',       km: 276, places: 19 },
  { name: 'Tomáš R.',       km: 198, places: 15 },
  { name: 'Janka S.',       km: 164, places: 12 },
];

type EventItem = { title: string; date: string; place: string; link: string };
const EVENTS: EventItem[] = [
  { title: 'DOGYPT ascent — Rozsutec',    date: '14.9.2026', place: 'Terchová, Malá Fatra',   link: 'https://dogypt.com/eternal' },
  { title: 'Night march for Hektor',      date: '3.10.2026', place: 'Vrátna dolina',          link: 'https://dogypt.com/eternal' },
  { title: 'Autumn Dogyptian gathering',  date: '18.10.2026', place: 'Demänovská dolina',     link: 'https://dogypt.com/eternal' },
];

const PERPAGE_OPTS = [20, 50, 100];

const CSS = `
.tv-root{position:fixed;inset:0;overflow-y:auto;background:#050505;color:rgba(245,240,228,0.9);font-family:'Space Grotesk',system-ui,sans-serif;}
.tv-bg{position:fixed;inset:0;background-image:url('/images/bg-dark.webp');background-size:cover;background-position:center;filter:blur(3px);z-index:0;pointer-events:none;}
.tv-bg2{position:fixed;inset:0;background:radial-gradient(ellipse at center,rgba(5,5,5,0.25) 0%,rgba(5,5,5,0.5) 60%,rgba(5,5,5,0.7) 100%);z-index:0;pointer-events:none;}
.tv-wrap{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:104px 26px 120px;}
/* ── horný status pruh (ako pack DevotionHeader) ── */
.tv-topbar{position:fixed;left:50%;transform:translateX(-50%);top:22px;width:calc(100% - 32px);max-width:1128px;z-index:50;display:flex;gap:8px;align-items:stretch;}
.tv-tpill{background:rgba(5,5,5,0.72);border:1px solid rgba(245,240,228,0.18);border-radius:999px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 12px 36px -10px rgba(0,0,0,0.7),inset 0 1px 0 rgba(245,240,228,0.06);padding:11px 16px;display:flex;align-items:center;gap:11px;}
.tv-tleft{flex:3 1 0;min-width:0;}
.tv-tright{flex:2 1 0;justify-content:flex-end;color:rgba(245,240,228,0.7);font-size:12.5px;}
.tv-tava{width:38px;height:38px;border-radius:50%;border:2px solid rgba(201,154,63,0.5);flex-shrink:0;overflow:hidden;background:#1c160c;}
.tv-tava img{width:100%;height:100%;object-fit:cover;display:block;}
.tv-tname{font-size:13px;color:rgba(245,240,228,0.92);font-weight:600;line-height:1.15;}
.tv-tlvl{font-size:11px;color:${GOLD};letter-spacing:.04em;margin-top:1px;}
.tv-prog{width:120px;height:6px;border-radius:999px;background:rgba(245,240,228,0.14);margin-top:6px;overflow:hidden;}
.tv-progf{height:100%;background:linear-gradient(90deg,#F5C73D,#E69E1A);border-radius:999px;}
.tv-progtxt{font-size:9.5px;color:rgba(245,240,228,0.45);margin-top:3px;letter-spacing:.03em;}
.tv-dogchip{width:30px;height:30px;border-radius:50%;overflow:hidden;border:2px solid rgba(245,240,228,0.28);flex-shrink:0;}
.tv-dogchip img{width:100%;height:100%;object-fit:cover;display:block;}
.tv-tdiv{width:1px;height:20px;background:rgba(245,240,228,0.18);flex-shrink:0;}
.tv-tstat{display:flex;align-items:center;gap:5px;font-size:12.5px;color:rgba(245,240,228,0.78);white-space:nowrap;}
.tv-tstat b{color:${GOLD};font-weight:700;}
/* ── spodný tab nav (ako pack floating pill nav) ── */
.tv-botnav{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:50;background:rgba(5,5,5,0.72);border:1px solid rgba(245,240,228,0.18);border-radius:999px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 12px 36px -10px rgba(0,0,0,0.7),inset 0 1px 0 rgba(245,240,228,0.06);padding:6px;display:flex;gap:4px;}
.tv-tab{display:flex;align-items:center;gap:8px;padding:9px 18px;border-radius:999px;cursor:pointer;transition:all .16s;}
.tv-tab img{width:19px;height:19px;filter:brightness(0) invert(0.72);}
.tv-tab span{font-family:'Cinzel',serif;font-size:12px;letter-spacing:.06em;color:rgba(245,240,228,0.7);}
.tv-tab.active{background:rgba(201,154,63,0.18);}
.tv-tab.active img{filter:brightness(0) saturate(100%) invert(70%) sepia(40%) saturate(560%) hue-rotate(1deg) brightness(95%);}
.tv-tab.active span{color:${GOLD};}
.tv-hero{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:stretch;}
.tv-hero{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:stretch;}
/* ── LEFT: personalizovaný launcher ── */
.tv-opts{position:relative;background:${CARD};border-radius:18px;padding:24px 24px;color:${INK};box-shadow:0 12px 40px rgba(0,0,0,0.45);display:flex;flex-direction:column;height:452px;overflow:hidden;}

/* ── VZOROVÝ VÝLET — popup cez celú stránku (mimo Bloku 1) ── */
.tv-detoverlay{position:fixed;inset:0;z-index:200;background:rgba(8,6,3,0.68);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;}
.tv-detcard{position:relative;width:100%;max-width:840px;height:min(88vh,540px);background:${CARD};border-radius:18px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,0.6);}
.tv-detclose{position:absolute;top:11px;right:11px;z-index:5;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.92);border:1px solid rgba(31,26,14,0.14);color:${INK};font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.tv-detcols{display:flex;height:100%;}
.tv-detleft{flex:1 1 0;min-width:0;display:flex;flex-direction:column;border-right:1px solid rgba(31,26,14,0.09);}
.tv-detright{flex:1 1 0;min-width:0;background:#0a0a0a;}
.tv-detright .leaflet-container{width:100%;height:100%;background:#0a0a0a;}
.tv-detailscroll{flex:1;overflow-y:auto;scrollbar-width:none;}
.tv-detailscroll::-webkit-scrollbar{display:none;}
.tv-detheadtxt{padding:18px 44px 12px 18px;}
.tv-detname{font-family:'Cinzel',serif;font-weight:700;font-size:20px;color:${INK};line-height:1.12;}
.tv-detregion{font-size:11px;color:rgba(31,26,14,0.55);margin-top:3px;}
.tv-detstats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(31,26,14,0.09);border-top:1px solid rgba(31,26,14,0.09);border-bottom:1px solid rgba(31,26,14,0.09);}
.tv-detstat{background:${CARD};display:flex;flex-direction:column;align-items:center;gap:2px;padding:11px 4px;}
.tv-detstat b{font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:${INK};}
.tv-detstat .tv-detm{font-size:10px;font-weight:600;}
.tv-detstat span{font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:rgba(31,26,14,0.45);}
.tv-detchips{display:flex;flex-wrap:wrap;gap:6px;padding:14px 18px 4px;}
.tv-detact{display:inline-flex;align-items:center;gap:6px;background:${GOLD};color:${INK};font-family:'Cinzel',serif;font-weight:700;font-size:10px;letter-spacing:.05em;text-transform:uppercase;padding:5px 11px;border-radius:999px;}
.tv-detact img{width:13px;height:13px;filter:brightness(0) saturate(0);opacity:.7;}
.tv-dettag{background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.12);color:rgba(31,26,14,0.72);font-size:10.5px;font-weight:600;padding:5px 10px;border-radius:999px;}
.tv-detcrew{display:flex;align-items:center;gap:12px;padding:12px 18px 2px;}
.tv-detlbl{font-size:9px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:rgba(31,26,14,0.4);}
.tv-detcrewrow{display:flex;gap:7px;}
.tv-detcrewchip{display:inline-flex;align-items:center;gap:6px;background:rgba(31,26,14,0.05);border-radius:999px;padding:3px 11px 3px 3px;font-size:11.5px;font-weight:600;color:${INK};}
.tv-detcrewav{width:22px;height:22px;border-radius:50%;background:${GOLD};color:${INK};display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:700;font-size:11px;}
.tv-detnotes{padding:10px 18px 4px;font-size:12.5px;line-height:1.6;color:rgba(31,26,14,0.7);}
.tv-detphotos{display:flex;gap:7px;padding:8px 18px 4px;overflow-x:auto;scrollbar-width:none;}
.tv-detphotos::-webkit-scrollbar{display:none;}
.tv-detphoto{flex:0 0 96px;height:66px;border-radius:9px;background-size:cover;background-position:center;}
.tv-detrating{padding:12px 18px 18px;}
.tv-detratehead{display:flex;align-items:center;gap:9px;margin-bottom:8px;}
.tv-detrateavg{font-family:'Cinzel',serif;font-weight:700;font-size:15px;color:${GOLD};}
.tv-detratecount{font-size:11px;color:rgba(31,26,14,0.5);}
.tv-detreview{background:rgba(31,26,14,0.04);border-radius:9px;padding:8px 11px;margin-bottom:6px;}
.tv-detreviewhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;}
.tv-detreviewhead b{font-size:12px;color:${INK};}
.tv-detreviewstars{font-size:10px;color:${GOLD};letter-spacing:1px;}
.tv-detreviewtxt{font-size:11.5px;line-height:1.45;color:rgba(31,26,14,0.62);}
.tv-detactions{flex-shrink:0;display:flex;gap:9px;padding:12px 16px 16px;border-top:1px solid rgba(31,26,14,0.08);background:${CARD};}
.tv-detbtn{flex:1;font-family:'Cinzel',serif;font-weight:700;font-size:11px;letter-spacing:.07em;text-transform:uppercase;padding:11px 8px;border-radius:11px;cursor:pointer;border:1px solid transparent;transition:all .15s;}
.tv-detbtn--primary{background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border-color:rgba(250,244,236,0.3);}
.tv-detbtn--primary.on{background:rgba(201,154,63,0.16);color:${INK};border-color:${GOLD};}
.tv-detbtn--ghost{background:rgba(31,26,14,0.05);color:rgba(31,26,14,0.72);border-color:rgba(31,26,14,0.16);}
.tv-detbtn--ghost.on{background:rgba(201,154,63,0.14);color:${INK};border-color:${GOLD};}
@media (max-width:760px){
  .tv-detcard{height:auto;max-height:90vh;overflow-y:auto;}
  .tv-detcols{flex-direction:column;height:auto;}
  .tv-detleft{border-right:none;}
  .tv-detailscroll{overflow:visible;}
  .tv-detright{order:2;height:220px;flex:0 0 220px;}
}
.tv-user{display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid rgba(31,26,14,0.1);flex-shrink:0;}
.tv-topzone{flex-shrink:0;display:flex;flex-direction:column;gap:10px;padding:10px 0 2px;}
.tv-topzone:empty{display:none;}
.tv-modesw{display:inline-flex;align-self:center;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.14);border-radius:11px;padding:4px;gap:4px;}
.tv-modebtn{padding:7px 22px;border:0;border-radius:8px;background:none;font-family:'Cinzel',serif;font-weight:700;font-size:12.5px;letter-spacing:.06em;color:rgba(31,26,14,0.5);cursor:pointer;transition:all .15s;}
.tv-modebtn.on{background:#2E5FD0;color:#fff;}
/* Places = zatiaľ neklikateľné; hover → bublina so šípkou „Coming soon" */
.tv-modebtn.soon{color:rgba(31,26,14,0.32);cursor:default;}
.tv-modesoon{position:relative;display:inline-flex;}
.tv-soontip{position:absolute;top:calc(100% + 9px);left:50%;transform:translate(-50%,-4px);background:${INK};color:#fff;font-family:'Cinzel',serif;font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 11px;border-radius:7px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .16s,transform .16s;z-index:40;}
.tv-soontip::before{content:'';position:absolute;bottom:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-bottom-color:${INK};}
.tv-modesoon:hover .tv-soontip{opacity:1;transform:translate(-50%,0);}
.tv-greet{display:flex;flex-direction:column;gap:4px;align-items:center;}
.tv-howdy{font-size:13px;letter-spacing:.04em;color:rgba(31,26,14,0.55);font-weight:600;}
.tv-center{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:24px;width:100%;}
.tv-pin{display:flex;align-items:center;font-size:17px;cursor:pointer;padding:2px;opacity:0.9;transition:opacity .15s;}
.tv-pin:hover{opacity:1;}
.tv-ava{width:44px;height:44px;border-radius:50%;background:${GOLD};color:${CARD};font-family:'Cinzel',serif;font-weight:700;font-size:19px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.tv-uname{font-size:15px;font-weight:600;color:${INK};}
.tv-ustats{font-size:13px;color:rgba(31,26,14,0.6);display:flex;gap:14px;}
.tv-ustats b{color:${GOLD};font-weight:700;}
.tv-uquick{margin-left:auto;display:flex;align-items:center;gap:8px;}
.tv-qb{width:34px;height:34px;border-radius:10px;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.12);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;}
.tv-qb:hover{border-color:rgba(201,154,63,0.5);background:rgba(201,154,63,0.1);}
.tv-qb img{width:16px;height:16px;filter:brightness(0) saturate(0);opacity:0.65;}
.tv-hl{font-family:'Cinzel',serif;font-weight:700;font-size:32px;letter-spacing:.02em;color:${INK};margin:0;line-height:1.1;white-space:nowrap;}
.tv-searchrow{display:flex;gap:10px;width:100%;}
.tv-search{flex:1;display:flex;align-items:center;gap:9px;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.16);border-radius:11px;padding:11px 13px;}
.tv-search input{background:transparent;border:0;outline:0;color:${INK};font-size:13px;width:100%;font-family:inherit;}
.tv-search input::placeholder{color:rgba(31,26,14,0.4);}
.tv-cty{display:flex;align-items:center;gap:7px;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.16);border-radius:10px;padding:8px 12px;font-size:13px;color:${INK};cursor:pointer;white-space:nowrap;}
.tv-cty:hover{border-color:rgba(201,154,63,0.5);}
.tv-ico{width:15px;height:15px;filter:brightness(0) saturate(0);opacity:0.6;flex-shrink:0;}
.tv-actions{display:flex;flex-direction:column;gap:12px;width:100%;}
.tv-go{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:${GOLD};color:${INK};font-family:'Cinzel',serif;font-weight:700;font-size:15px;letter-spacing:.08em;text-transform:uppercase;padding:18px;border-radius:12px;cursor:pointer;transition:all .16s;border:1px solid ${GOLD};}
.tv-go:hover{background:#d9a94a;box-shadow:0 6px 20px rgba(201,154,63,0.35);}
.tv-add{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:transparent;color:${INK};font-family:'Cinzel',serif;font-weight:700;font-size:15px;letter-spacing:.08em;text-transform:uppercase;padding:18px;border-radius:12px;cursor:pointer;transition:all .16s;border:1px solid rgba(31,26,14,0.25);}
.tv-add:hover{border-color:${GOLD};background:rgba(201,154,63,0.08);}
.tv-go img,.tv-add img{width:17px;height:17px;filter:brightness(0) saturate(0);opacity:0.85;}
/* ── LEFT idle (hero): zoznam 12 reálnych trás prepojený s mapou ── */
.tv-center--herolist{justify-content:flex-start;align-items:stretch;text-align:left;gap:10px;overflow:hidden;}
.tv-htr-filterrow{display:flex;gap:8px;flex-shrink:0;}
.tv-htr-diffchips{display:flex;gap:5px;flex-shrink:0;}
.tv-htr-chip{padding:7px 11px;border-radius:999px;border:1px solid rgba(31,26,14,0.18);background:transparent;color:rgba(31,26,14,0.65);font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s;}
.tv-htr-chip:hover{border-color:${GOLD};}
.tv-htr-chip.on{background:${GOLD};border-color:${GOLD};color:${INK};}
.tv-htr-planrow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;}
.tv-htr-plan{font-family:'Cinzel',serif;font-weight:700;font-size:12.5px;letter-spacing:.05em;color:${GOLD};cursor:pointer;}
.tv-htr-plan:hover{opacity:0.8;}
.tv-htr-addlink{display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(31,26,14,0.5);cursor:pointer;}
.tv-htr-addlink img{width:11px;height:11px;filter:brightness(0) saturate(0);opacity:0.5;}
.tv-htr-addlink:hover{color:${INK};}
.tv-htr-list{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:7px;padding-right:2px;}
.tv-htr-card{display:flex;align-items:center;gap:10px;background:rgba(31,26,14,0.03);border:1px solid rgba(31,26,14,0.1);border-left:3px solid transparent;border-radius:10px;padding:9px 11px;cursor:pointer;transition:all .15s;}
.tv-htr-card:hover,.tv-htr-card.hot{border-color:${GOLD};background:rgba(201,154,63,0.09);}
.tv-htr-num{font-family:'Cinzel',serif;font-weight:700;font-size:13px;color:rgba(31,26,14,0.4);width:18px;flex-shrink:0;text-align:center;}
.tv-htr-body{flex:1;min-width:0;}
.tv-htr-name{font-family:'Cinzel',serif;font-weight:700;font-size:13px;color:${INK};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tv-htr-meta{display:flex;gap:8px;font-size:10.5px;color:rgba(31,26,14,0.55);margin-top:3px;flex-wrap:wrap;}
.tv-htr-meta .tv-tstar{color:${GOLD};font-weight:700;}
.tv-htr-acts{display:flex;gap:5px;flex-shrink:0;}
.tv-htr-actbtn{display:flex;align-items:center;gap:3px;padding:5px 8px;border-radius:7px;border:1px solid rgba(31,26,14,0.16);background:transparent;color:rgba(31,26,14,0.55);font-family:inherit;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;}
.tv-htr-actbtn:hover{border-color:${GOLD};}
.tv-htr-actbtn.on{background:${GOLD};border-color:${GOLD};color:${INK};}
/* pin s číslom na mape (idle stav, prepojený s kartou) */
.tv-htr-pinwrap{background:none;border:0;}
.tv-htr-pin{width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;transition:all .15s;}
.tv-htr-pin span{transform:rotate(45deg);color:#fff;font-family:'Cinzel',serif;font-weight:700;font-size:11px;line-height:1;}
.tv-htr-pin.hot{width:30px;height:30px;box-shadow:0 0 0 4px rgba(245,199,61,0.35),0 4px 12px rgba(0,0,0,0.6);}
@media (max-width:760px){.tv-htr-filterrow{flex-wrap:wrap;}}
/* ── RIGHT: mapa ── */
.tv-map{border-radius:18px;overflow:hidden;border:1px solid rgba(201,154,63,0.4);min-height:452px;position:relative;box-shadow:0 12px 40px rgba(0,0,0,0.45);}
.tv-map .leaflet-container{width:100%;height:100%;min-height:452px;background:#0a0a0a;}
.tv-attr{position:absolute;right:10px;bottom:10px;z-index:1000;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.85);border-radius:4px;padding:2px 7px;font-size:9px;color:#333;}
/* POI markery z OSM */
.tv-poiwrap{background:none;border:none;}
.tv-poi{width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;background:${CARD};border:1.5px solid ${GOLD};border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);}
/* Ovládací panel na mape (štýl + POI) — vpravo hore pod searchom */
.tv-mapctl{position:absolute;top:64px;right:14px;z-index:1000;display:flex;flex-direction:column;align-items:flex-end;gap:8px;}
.tv-mapstyle{display:flex;background:${CARD};border:1px solid rgba(201,154,63,0.45);border-radius:9px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.4);}
.tv-mapstyle button{background:none;border:none;cursor:pointer;padding:6px 11px;font-size:11px;font-weight:600;color:${INK};border-right:1px solid rgba(31,26,14,0.12);}
.tv-mapstyle button:last-child{border-right:none;}
.tv-mapstyle button.on{background:${GOLD};color:${INK};}
.tv-poictl{position:relative;}
.tv-poibtn{display:flex;align-items:center;gap:5px;background:${CARD};border:1px solid rgba(201,154,63,0.45);border-radius:9px;cursor:pointer;padding:6px 11px;font-size:11px;font-weight:600;color:${INK};box-shadow:0 3px 10px rgba(0,0,0,0.4);}
.tv-poibtn.open{background:${GOLD};}
.tv-poistat{min-width:16px;text-align:center;font-size:10px;font-weight:700;color:${INK};background:rgba(31,26,14,0.12);border-radius:6px;padding:1px 5px;}
.tv-poipanel{position:absolute;top:calc(100% + 6px);right:0;width:172px;background:${CARD};border:1px solid rgba(201,154,63,0.45);border-radius:11px;padding:10px;box-shadow:0 8px 22px rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:7px;}
.tv-poitog{display:flex;align-items:center;gap:7px;font-size:12px;color:${INK};cursor:pointer;}
.tv-poitog input{accent-color:${GOLD};cursor:pointer;}
.tv-poiemoji{font-size:14px;}
.tv-poihint{font-size:9.5px;line-height:1.35;color:rgba(31,26,14,0.5);border-top:1px solid rgba(31,26,14,0.1);padding-top:6px;margin-top:1px;}
.tv-map .leaflet-control-scale{margin-left:12px;margin-bottom:12px;}
.tv-map .leaflet-control-scale-line{background:rgba(255,255,255,0.8);border-color:rgba(31,26,14,0.55);color:#2a2a2a;font-size:10px;}
.tv-mapsearch-wrap{position:absolute;top:14px;left:14px;right:14px;z-index:1000;}
.tv-mapsearch{display:flex;align-items:center;gap:9px;width:100%;background:rgba(255,251,242,0.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(201,154,63,0.45);border-radius:12px;padding:12px 15px;box-shadow:0 6px 22px rgba(0,0,0,0.35);}
.tv-mapsearch img{width:15px;height:15px;filter:brightness(0) saturate(0);opacity:0.55;flex-shrink:0;}
.tv-mapsearch input{background:transparent;border:0;outline:0;color:${INK};font-size:13.5px;width:100%;font-family:inherit;}
.tv-mapsearch input::placeholder{color:rgba(31,26,14,0.45);}
.tv-mapsug{margin-top:8px;background:rgba(255,251,242,0.97);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(201,154,63,0.4);border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.42);max-height:260px;overflow-y:auto;}
.tv-mapsug-item{padding:10px 15px;cursor:pointer;border-bottom:1px solid rgba(31,26,14,0.07);transition:background .12s;}
.tv-mapsug-item:last-child{border-bottom:0;}
.tv-mapsug-item:hover{background:rgba(201,154,63,0.13);}
.tv-mapsug-name{font-size:13px;color:${INK};font-weight:600;}
.tv-mapsug-sub{font-size:11px;color:rgba(31,26,14,0.55);margin-top:1px;}
.tv-map .leaflet-tooltip.tv-trailtip{background:${CARD};color:${INK};border:1px solid ${GOLD};border-radius:10px;padding:7px 11px;box-shadow:0 4px 14px rgba(0,0,0,0.45);}
.tv-map .leaflet-tooltip.tv-trailtip::before{border-top-color:${GOLD};}
.tv-tt{display:flex;align-items:center;gap:9px;}
.tv-tt-paw{width:22px;height:22px;filter:brightness(0) saturate(0);opacity:0.7;flex-shrink:0;}
.tv-tt-name{font-family:'Cinzel',serif;font-weight:700;font-size:12.5px;color:${INK};line-height:1.1;}
.tv-tt-meta{font-size:10.5px;color:rgba(31,26,14,0.62);margin-top:2px;}
.tv-tt-star{color:${GOLD};font-weight:700;}
/* ── section shell (reused blok 3-6) ── */
.tv-sec{margin-top:42px;}
.tv-sech{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px;gap:12px;flex-wrap:wrap;}
.tv-sect{font-family:'Cinzel',serif;font-weight:700;font-size:18px;letter-spacing:.08em;color:rgba(245,240,228,0.95);display:flex;align-items:center;gap:9px;}
.tv-sect img{width:17px;height:17px;filter:brightness(0) saturate(100%) invert(70%) sepia(35%) saturate(600%) hue-rotate(2deg) brightness(95%);}
.tv-secl{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${GOLD};cursor:pointer;white-space:nowrap;}
/* ── kategórie pilulky (blok 3) ── */
.tv-panel{background:rgba(28,25,17,0.92);border:1px solid rgba(201,154,63,0.3);border-radius:20px;padding:24px 24px 26px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 16px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(245,240,228,0.04);}
.tv-panel .tv-sech{margin-bottom:18px;}
.tv-pills{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:20px;}
/* ── blok 3 control riadok: search + 3 dropdowns (territory / activity / sort) ── */
.tv-b3ctrl{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:14px;}
.tv-b3search{flex:1 1 200px;background-color:${CARD};border:1px solid rgba(201,154,63,0.35);border-radius:999px;padding:9px 16px;font-size:12.5px;font-family:inherit;color:${INK};outline:0;min-width:180px;}
.tv-b3search::placeholder{color:rgba(31,26,14,0.45);}
.tv-b3search:focus{border-color:${GOLD};}
/* tri dropdowny = jednotny pill vzhlad na tmavom paneli (vacsia specificita nez .tv-countrysel radius:8) */
.tv-panel .tv-b3sel{border-radius:999px;padding:9px 30px 9px 15px;font-size:12px;background-color:${CARD};border-color:rgba(201,154,63,0.35);background-position:right 12px center;}
.tv-panel .tv-b3sel:hover{border-color:${GOLD};}
/* mobile: search cez cely riadok, tri dropdowny vedla seba pod nim */
@media (max-width:760px){
  .tv-b3search{order:1;flex:1 1 100%;}
  .tv-b3sel{order:2;flex:1 1 0;min-width:0;}
}
.tv-pill{padding:8px 16px;border-radius:999px;border:1px solid rgba(201,154,63,0.32);color:rgba(245,240,228,0.7);font-size:12.5px;letter-spacing:.02em;cursor:pointer;background:rgba(255,255,255,0.03);transition:all .15s;white-space:nowrap;}
.tv-pill:hover{border-color:${GOLD};color:rgba(245,240,228,0.95);}
.tv-pill.active{background:${GOLD};color:${INK};border-color:${GOLD};font-weight:700;}
/* ── grid trail karta (blok 3+4) ── */
.tv-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;}
.tv-gcard{background:${CARD};border-radius:14px;overflow:hidden;box-shadow:0 8px 26px rgba(0,0,0,0.4);cursor:default;transition:transform .2s;}
.tv-gcard:hover{transform:translateY(-4px);}
.tv-timg{height:148px;background-size:cover;background-position:center;position:relative;}
.tv-tbadge{position:absolute;top:10px;left:10px;background:rgba(5,5,5,0.72);color:${CARD};font-size:10px;letter-spacing:.06em;padding:4px 9px;border-radius:999px;text-transform:uppercase;}
.tv-gicons{position:absolute;top:8px;right:8px;display:flex;gap:6px;}
.tv-gicon{width:30px;height:30px;border-radius:50%;background:rgba(5,5,5,0.55);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;border:none;}
.tv-gicon:hover{background:rgba(5,5,5,0.78);}
.tv-gicon img{width:15px;height:15px;filter:brightness(0) invert(1);opacity:0.9;}
.tv-gicon.active{background:${GOLD};}
.tv-gicon.active img{filter:brightness(0) saturate(100%);opacity:1;}
.tv-tbody{padding:13px 15px 15px;color:${INK};}
.tv-tbody .tv-tname{font-family:'Cinzel',serif;font-weight:700;font-size:15px;color:${INK};}
.tv-tmeta{font-size:11.5px;color:rgba(31,26,14,0.6);margin-top:4px;display:flex;gap:9px;flex-wrap:wrap;align-items:center;}
.tv-tstar{color:${GOLD};font-weight:700;}
.tv-thearts{font-size:11.5px;color:${GOLD};font-weight:600;}
/* ── pagination ── */
.tv-pagerow{display:flex;align-items:center;justify-content:space-between;margin-top:22px;flex-wrap:wrap;gap:14px;}
.tv-pshow{display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(245,240,228,0.55);}
.tv-pshowbtn{padding:5px 11px;border-radius:7px;border:1px solid rgba(201,154,63,0.3);background:transparent;color:rgba(245,240,228,0.65);font-size:12px;cursor:pointer;}
.tv-pshowbtn.active{background:${GOLD};color:${INK};border-color:${GOLD};font-weight:700;}
.tv-pnum{display:flex;gap:6px;}
.tv-pnum button{width:32px;height:32px;border-radius:8px;border:1px solid rgba(201,154,63,0.3);background:transparent;color:rgba(245,240,228,0.7);cursor:pointer;font-size:12.5px;}
.tv-pnum button.active{background:${GOLD};color:${INK};border-color:${GOLD};font-weight:700;}
/* ── blok 4: segmented control ── */
.tv-seg{display:inline-flex;background:rgba(255,255,255,0.04);border:1px solid rgba(201,154,63,0.25);border-radius:12px;padding:4px;gap:4px;margin-bottom:22px;}
.tv-segbtn{padding:8px 18px;border-radius:9px;font-size:12.5px;color:rgba(245,240,228,0.6);cursor:pointer;font-weight:600;letter-spacing:.02em;}
.tv-segbtn.active{background:${GOLD};color:${INK};}
/* ── blok 5: rebríčky ── */
.tv-rankgrid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.tv-rankcard{background:${CARD};border-radius:16px;padding:22px 22px;box-shadow:0 12px 40px rgba(0,0,0,0.4);color:${INK};}
.tv-rankh{font-family:'Cinzel',serif;font-weight:700;font-size:15px;letter-spacing:.03em;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid rgba(31,26,14,0.1);}
.tv-rankrow{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid rgba(31,26,14,0.07);}
.tv-rankrow:last-child{border-bottom:0;}
.tv-ranknum{font-family:'Cinzel',serif;font-weight:700;color:${GOLD};font-size:16px;width:22px;flex-shrink:0;}
.tv-rankname{flex:1;font-size:13.5px;font-weight:600;}
.tv-rankmeta{font-size:11.5px;color:rgba(31,26,14,0.55);white-space:nowrap;}
/* ── blok 6: eventy ── */
.tv-evgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.tv-evcard{background:${CARD};border-radius:14px;padding:20px 20px;box-shadow:0 8px 26px rgba(0,0,0,0.4);color:${INK};}
.tv-evname{font-family:'Cinzel',serif;font-weight:700;font-size:15px;}
.tv-evmeta{font-size:12px;color:rgba(31,26,14,0.6);margin:8px 0 16px;line-height:1.6;}
.tv-evbtn{display:inline-flex;align-items:center;gap:7px;background:transparent;color:${INK};font-family:'Cinzel',serif;font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;padding:9px 16px;border-radius:9px;cursor:pointer;border:1px solid rgba(31,26,14,0.25);transition:all .16s;}
.tv-evbtn:hover{border-color:${GOLD};background:rgba(201,154,63,0.08);}
/* ── modaly ── */
.tv-overlay{position:fixed;inset:0;background:rgba(5,5,5,0.68);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;}
.tv-modal{background:${CARD};border-radius:18px;padding:28px 26px;max-width:380px;width:100%;color:${INK};box-shadow:0 20px 60px rgba(0,0,0,0.5);position:relative;}
.tv-mclose{position:absolute;top:14px;right:18px;cursor:pointer;font-size:20px;line-height:1;color:rgba(31,26,14,0.4);background:none;border:none;}
.tv-mclose:hover{color:${INK};}
.tv-mtitle{font-family:'Cinzel',serif;font-weight:700;font-size:17px;margin-bottom:4px;padding-right:20px;}
.tv-msub{font-size:12px;color:rgba(31,26,14,0.55);margin-bottom:18px;}
.tv-mfield{margin-bottom:14px;}
.tv-mfield label{display:block;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:rgba(31,26,14,0.55);margin-bottom:6px;}
.tv-mfield input{width:100%;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.16);border-radius:9px;padding:9px 12px;font-size:13px;color:${INK};font-family:inherit;outline:0;}
.tv-mfield input:focus{border-color:${GOLD};}
.tv-mstars{display:flex;gap:6px;}
.tv-mstars button{background:none;border:none;cursor:pointer;padding:0;font-size:22px;line-height:1;color:rgba(31,26,14,0.22);}
.tv-mstars button.on{color:${GOLD};}
.tv-msave{width:100%;margin-top:6px;display:flex;align-items:center;justify-content:center;background:${GOLD};color:${INK};font-family:'Cinzel',serif;font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:11px;cursor:pointer;border:1px solid ${GOLD};transition:all .16s;}
.tv-msave:hover{background:#d9a94a;}
.tv-mlink{display:inline-flex;align-items:center;gap:7px;background:${GOLD};color:${INK};font-family:'Cinzel',serif;font-weight:700;font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;padding:11px 18px;border-radius:10px;text-decoration:none;}
/* ── "Go on a trip" flow (variant A): tripbody (flex) + spodná nav napevno ── */
.tv-center--trip{justify-content:flex-start;align-items:stretch;text-align:center;gap:0;padding:0;}
.tv-tripbody{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;width:100%;overflow-y:auto;padding:14px 2px;}
/* activity obsah = stabilná výška (vrch sa nehýbe pri odkrytí km/tagov), celok centrovaný v tripbody */
.tv-actwrap{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:100%;min-height:210px;}
/* výsledkové karty (Show trails) — stackované pod sebou */
.tv-reslist{display:flex;flex-direction:column;gap:10px;width:100%;}
.tv-rescard{display:flex;align-items:center;gap:12px;background:rgba(31,26,14,0.04);border:1px solid rgba(31,26,14,0.12);border-radius:12px;padding:11px 13px;cursor:pointer;transition:all .15s;}
.tv-rescard:hover{border-color:${GOLD};background:rgba(201,154,63,0.08);}
.tv-resthumb{width:46px;height:46px;border-radius:10px;flex-shrink:0;background-size:cover;background-position:center;}
.tv-resbody{flex:1;min-width:0;text-align:left;}
.tv-resname{font-family:'Cinzel',serif;font-weight:700;font-size:14px;color:${INK};}
.tv-resmeta{font-size:11.5px;color:rgba(31,26,14,0.6);margin-top:3px;display:flex;gap:9px;align-items:center;}
.tv-resmeta .tv-tstar{color:${GOLD};font-weight:700;}
.tv-resgo{flex-shrink:0;font-size:16px;color:${GOLD};}
/* výsledky = 2×2 dlaždice + posuvník na ďalšie (mapa vpravo ukazuje všetky) */
.tv-resgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;}
.tv-rescard2{background:${CARD};border:1px solid rgba(31,26,14,0.12);border-left:3px solid ${GOLD};border-radius:10px;padding:11px 11px 11px 14px;text-align:left;cursor:pointer;transition:all .15s;box-shadow:0 3px 10px rgba(0,0,0,0.1);display:flex;align-items:center;gap:11px;}
.tv-rescard2:hover{border-color:${GOLD};background:rgba(201,154,63,0.06);transform:translateY(-1px);}
.tv-resbody2{flex:1;min-width:0;}
.tv-resthumb2{width:42px;height:42px;border-radius:8px;flex-shrink:0;background-size:cover;background-position:center;}
.tv-resname2{font-family:'Cinzel',serif;font-weight:700;font-size:13.5px;color:${INK};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tv-resmeta2{font-size:11.5px;color:rgba(31,26,14,0.6);margin-top:5px;display:flex;gap:9px;align-items:center;}
.tv-resmeta2 .tv-tstar{color:${GOLD};font-weight:700;}
.tv-respager{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:14px;}
.tv-respagearrow{width:28px;height:28px;border-radius:8px;border:1px solid rgba(31,26,14,0.18);background:transparent;color:${INK};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.tv-respagearrow:hover{border-color:${GOLD};background:rgba(201,154,63,0.08);}
.tv-respagearrow.disabled{opacity:0.3;cursor:default;pointer-events:none;}
.tv-respagedots{display:flex;gap:7px;align-items:center;}
.tv-respagedot{width:8px;height:8px;border-radius:50%;background:rgba(31,26,14,0.2);cursor:pointer;transition:all .15s;}
.tv-respagedot:hover{background:rgba(201,154,63,0.6);}
.tv-respagedot.on{background:${GOLD};transform:scale(1.25);}
.tv-tripback{font-size:12px;color:${GOLD};cursor:pointer;letter-spacing:.04em;font-weight:600;display:flex;align-items:center;gap:6px;}
.tv-tripback:hover{opacity:0.8;}
.tv-triph2{font-family:'Cinzel',serif;font-weight:700;font-size:18px;color:${INK};}
/* hierarchia: aktivita = najväčšie pilulky */
.tv-actlist{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;max-width:400px;}
.tv-actrows{display:flex;flex-direction:column;gap:9px;align-items:center;width:100%;}
/* Hiking = dropdown priamo v pille (nie zvýraznený); po výbere „Hiking: <dist>" */
.tv-actpill--sel{padding-right:12px;}
.tv-actselinner{appearance:none;-webkit-appearance:none;border:0;background-color:transparent;font-family:inherit;font-size:13.5px;font-weight:600;color:${INK};cursor:pointer;padding:0 18px 0 0;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='9' height='6' viewBox='0 0 9 6'><path d='M1 1l3.5 3.5L8 1' stroke='%231F1A0E' stroke-width='1.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");background-repeat:no-repeat;background-position:right 2px center;}
/* tagy centrované + wrap (nie horizontálny scroll na kraji) */
.tv-tags.tv-tags--center{flex-direction:column;flex-wrap:nowrap;gap:6px;justify-content:center;align-items:center;overflow:visible;flex:0 1 auto;max-width:100%;}
.tv-tagline{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;}
.tv-actpill{display:flex;align-items:center;gap:7px;padding:10px 16px;border-radius:999px;border:1px solid rgba(31,26,14,0.18);background:transparent;color:${INK};font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;}
.tv-actpill:hover{border-color:${GOLD};}
.tv-actpill.on{background:${GOLD};border-color:${GOLD};font-weight:700;}
.tv-actpill img{width:16px;height:16px;filter:brightness(0) saturate(0);opacity:0.6;flex-shrink:0;}
.tv-actpill.on img{opacity:0.9;}
/* multi-day = dropdown pilulka s chevronom (medzi distance chips) */
.tv-mdsel{appearance:none;-webkit-appearance:none;padding:7px 30px 7px 13px;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='9' height='6' viewBox='0 0 9 6'><path d='M1 1l3.5 3.5L8 1' stroke='%231F1A0E' stroke-width='1.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");background-repeat:no-repeat;background-position:right 11px center;}
.tv-mdsel.on{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='9' height='6' viewBox='0 0 9 6'><path d='M1 1l3.5 3.5L8 1' stroke='%231F1A0E' stroke-width='1.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>"),linear-gradient(${GOLD},${GOLD});background-repeat:no-repeat;background-position:right 11px center,center;}
/* tagy = najmenšie pilulky, full-width horizontálny scroll so šípkami */
.tv-tagsrow{display:flex;align-items:center;gap:4px;width:100%;}
.tv-tagarrow{flex-shrink:0;width:20px;height:24px;border:0;background:none;color:${GOLD};font-size:18px;line-height:1;cursor:pointer;padding:0;opacity:0.7;}
.tv-tagarrow:hover{opacity:1;}
.tv-tags{display:flex;flex-wrap:nowrap;gap:6px;flex:1;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.tv-tags::-webkit-scrollbar{display:none;}
.tv-tag{flex-shrink:0;display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;border:1px solid rgba(31,26,14,0.16);background:transparent;color:rgba(31,26,14,0.7);font-family:inherit;font-size:10.5px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.tv-tag:hover{border-color:${GOLD};color:${INK};}
.tv-tag.on{background:${GOLD};border-color:${GOLD};color:${INK};font-weight:700;}
.tv-tagemoji{font-size:11px;line-height:1;}
.tv-country{display:flex;justify-content:flex-start;width:100%;}
.tv-countrysel{appearance:none;-webkit-appearance:none;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.18);border-radius:8px;padding:7px 25px 7px 11px;font-size:11.5px;font-family:inherit;color:${INK};cursor:pointer;text-align:left;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'><path d='M1 1l4.5 4.5L10 1' stroke='%231F1A0E' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");background-repeat:no-repeat;background-position:right 9px center;background-size:9px;}
.tv-countrysel:hover{border-color:rgba(201,154,63,0.5);}
.tv-tripnav{flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:14px;padding-top:12px;margin-top:8px;border-top:1px solid rgba(31,26,14,0.08);}
.tv-tripcount{font-size:12px;color:rgba(31,26,14,0.5);font-weight:600;letter-spacing:.03em;}
.tv-tripnext{font-size:12px;color:${INK};background:${GOLD};border:1px solid ${GOLD};font-weight:700;letter-spacing:.04em;padding:9px 18px;border-radius:9px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity .15s;}
.tv-tripnext:hover{background:#d9a94a;}
.tv-tripnext.disabled{opacity:0.38;cursor:default;}
.tv-tripnext.disabled:hover{background:${GOLD};}
.tv-triph{font-family:'Cinzel',serif;font-weight:700;font-size:22px;color:${INK};line-height:1.15;}
.tv-tripsub{font-size:12px;color:rgba(31,26,14,0.55);margin-top:-10px;}
/* mapa = pevný box (výška zastropená) → vysoké mapy (CH/CZ) nedeformujú layout ani nescrollujú */
.tv-svk{width:100%;max-width:340px;height:196px;flex:0 0 196px;margin:0 auto;display:flex;align-items:center;justify-content:center;}
.tv-svk svg{max-width:100%;max-height:100%;width:auto;height:auto;display:block;}
.tv-svk path{fill:rgba(31,26,14,0.09);stroke:${GOLD};stroke-width:0.9;stroke-linejoin:round;cursor:pointer;transition:fill .15s;}
.tv-svk path:hover{fill:rgba(201,154,63,0.55);}
.tv-svk path.sel{fill:${GOLD};}
.tv-fade{width:85%;max-width:300px;height:1px;background:linear-gradient(90deg,transparent,rgba(31,26,14,0.22),transparent);margin:2px auto;flex-shrink:0;}
.tv-fgroup{width:100%;margin-bottom:2px;}
.tv-flabel{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(31,26,14,0.5);margin-bottom:8px;text-align:center;}
.tv-fchips{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;}
.tv-fchip{padding:7px 13px;border-radius:999px;border:1px solid rgba(31,26,14,0.18);background:transparent;color:${INK};font-size:12px;cursor:pointer;font-family:inherit;transition:all .15s;}
.tv-fchip:hover{border-color:${GOLD};}
.tv-fchip.on{background:${GOLD};border-color:${GOLD};font-weight:700;}
/* Hiking distance = jeden dropdown (nahradil chips + multiday) */
.tv-distgroup{display:flex;justify-content:center;width:100%;}
.tv-distsel{appearance:none;-webkit-appearance:none;padding:8px 34px 8px 16px;border-radius:999px;border:1px solid rgba(31,26,14,0.18);background-color:transparent;color:${INK};font-size:12.5px;font-family:inherit;cursor:pointer;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='9' height='6' viewBox='0 0 9 6'><path d='M1 1l3.5 3.5L8 1' stroke='%231F1A0E' stroke-width='1.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");background-repeat:no-repeat;background-position:right 14px center;}
.tv-distsel:hover{border-color:${GOLD};}
.tv-distsel.on{background-color:${GOLD};border-color:${GOLD};font-weight:700;}
.tv-rescount{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${GOLD};font-weight:700;margin-top:4px;}
.tv-results{display:flex;flex-direction:column;gap:9px;}
.tv-rcard{background:rgba(31,26,14,0.04);border:1px solid rgba(31,26,14,0.1);border-radius:11px;padding:12px 14px;cursor:pointer;transition:all .15s;}
.tv-rcard:hover{border-color:${GOLD};background:rgba(201,154,63,0.08);}
.tv-rcname{font-family:'Cinzel',serif;font-weight:700;font-size:15px;color:${INK};}
.tv-rcmeta{font-size:11.5px;color:rgba(31,26,14,0.6);margin-top:3px;}
.tv-rcmeta .tv-tstar{color:${GOLD};}
/* ── "Add a trail" veľký popup ── */
.tv-addmodal{background:${CARD};border-radius:20px;max-width:640px;width:100%;max-height:90vh;overflow-y:auto;color:${INK};box-shadow:0 24px 70px rgba(0,0,0,0.55);position:relative;}
.tv-addhead{position:sticky;top:0;background:${CARD};padding:24px 28px 16px;border-bottom:1px solid rgba(31,26,14,0.1);z-index:2;}
.tv-addtitle{font-family:'Cinzel',serif;font-weight:700;font-size:21px;color:${INK};display:flex;align-items:center;gap:10px;}
.tv-addtitle img{width:19px;height:19px;filter:brightness(0) saturate(0);opacity:0.7;}
.tv-addsub{font-size:12px;color:rgba(31,26,14,0.55);margin-top:6px;line-height:1.5;max-width:480px;}
.tv-addbody{padding:20px 28px 24px;}
.tv-addsect{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:${GOLD};font-weight:700;margin:0 0 13px;}
.tv-addsect span{color:rgba(31,26,14,0.4);font-weight:600;letter-spacing:.06em;}
.tv-addgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.tv-addfield{margin-bottom:14px;}
.tv-addfield.full{grid-column:1 / -1;}
.tv-addfield label{display:block;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:rgba(31,26,14,0.55);margin-bottom:6px;}
.tv-addfield input,.tv-addfield textarea,.tv-addfield select{width:100%;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.16);border-radius:10px;padding:10px 12px;font-size:13px;color:${INK};font-family:inherit;outline:0;}
.tv-addfield textarea{resize:vertical;min-height:76px;line-height:1.5;}
.tv-addfield input:focus,.tv-addfield textarea:focus,.tv-addfield select:focus{border-color:${GOLD};}
.tv-addfield select{appearance:none;-webkit-appearance:none;cursor:pointer;padding-right:34px;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'><path d='M1 1l4.5 4.5L10 1' stroke='%231F1A0E' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");background-repeat:no-repeat;background-position:right 13px center;}
.tv-pointrow{display:flex;gap:8px;align-items:center;}
.tv-pointrow input{flex:1;}
.tv-pickmap{flex-shrink:0;display:flex;align-items:center;gap:6px;padding:10px 13px;border-radius:10px;border:1px dashed rgba(201,154,63,0.6);background:rgba(201,154,63,0.06);color:${INK};font-size:11.5px;cursor:pointer;white-space:nowrap;transition:all .15s;}
.tv-pickmap:hover{background:rgba(201,154,63,0.14);}
.tv-adddiv{height:1px;background:linear-gradient(90deg,transparent,rgba(31,26,14,0.16),transparent);margin:20px 0;}
.tv-addacts{display:flex;flex-wrap:wrap;gap:8px;}
.tv-addstars{display:flex;gap:7px;align-items:center;height:40px;}
.tv-addstars button{background:none;border:none;cursor:pointer;padding:0;font-size:26px;line-height:1;color:rgba(31,26,14,0.2);transition:color .12s;}
.tv-addstars button.on{color:${GOLD};}
.tv-drop{display:block;border:1.5px dashed rgba(31,26,14,0.24);border-radius:12px;padding:22px;text-align:center;cursor:pointer;transition:all .15s;color:rgba(31,26,14,0.55);font-size:12.5px;}
.tv-drop:hover{border-color:${GOLD};background:rgba(201,154,63,0.05);color:${INK};}
.tv-photos{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px;}
.tv-photo{position:relative;width:66px;height:66px;border-radius:10px;background-size:cover;background-position:center;border:1px solid rgba(31,26,14,0.14);}
.tv-photo-x{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:rgba(31,26,14,0.85);color:#fff;border:1.5px solid #fff;font-size:9px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;}
.tv-photo-x:hover{background:${INK};}
.tv-photo-more{display:flex;align-items:center;justify-content:center;background:rgba(31,26,14,0.06);color:${INK};font-family:'Cinzel',serif;font-weight:700;font-size:13px;}
.tv-addfoot{position:sticky;bottom:0;background:${CARD};padding:15px 28px 20px;border-top:1px solid rgba(31,26,14,0.1);display:flex;align-items:center;gap:16px;justify-content:space-between;z-index:2;}
.tv-addnote{font-size:11px;color:rgba(31,26,14,0.5);display:flex;align-items:center;gap:7px;max-width:56%;line-height:1.45;}
.tv-addsave{display:flex;align-items:center;justify-content:center;gap:8px;background:${GOLD};color:${INK};font-family:'Cinzel',serif;font-weight:700;font-size:13px;letter-spacing:.06em;text-transform:uppercase;padding:13px 24px;border-radius:11px;cursor:pointer;border:1px solid ${GOLD};transition:all .16s;flex-shrink:0;}
.tv-addsave:hover{background:#d9a94a;}
.tv-addsave.disabled{opacity:0.4;cursor:default;}
.tv-addsave.disabled:hover{background:${GOLD};}
/* success stav */
.tv-sent{padding:50px 34px 46px;text-align:center;}
/* success = vycentrovaný stĺpec (jediné dieťa tv-center → gap sa neuplatní, spacing len z marginov nižšie) */
.tv-sent{display:flex;flex-direction:column;align-items:center;text-align:center;max-width:440px;margin:0 auto;}
.tv-sentbadge{width:76px;height:76px;border-radius:50%;background:rgba(201,154,63,0.14);border:2px solid ${GOLD};display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:36px;color:${GOLD};line-height:1;}
.tv-senth{font-family:'Cinzel',serif;font-weight:700;font-size:20px;color:${INK};margin-bottom:11px;}
.tv-sentp{font-size:13px;color:rgba(31,26,14,0.62);line-height:1.65;max-width:400px;margin:0 auto 24px;}
.tv-sentbtn{display:inline-flex;align-items:center;justify-content:center;background:${GOLD};color:${INK};font-family:'Cinzel',serif;font-weight:700;font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;padding:12px 28px;border-radius:11px;cursor:pointer;border:1px solid ${GOLD};}
/* ── wizard: zelený stepper ── */
.tv-steps{display:flex;gap:10px;margin-top:16px;width:100%;}
.tv-steps--top{flex-shrink:0;margin:0;}
.tv-steps--top .tv-steplbl{font-size:10px;letter-spacing:.06em;text-transform:uppercase;font-weight:700;margin:0 0 6px;color:rgba(31,26,14,0.34);text-align:center;}
.tv-steps--top .tv-step.active .tv-steplbl{color:#2E5FD0;}
.tv-steps--top .tv-step.done .tv-steplbl{color:#2E5FD0;}
.tv-step{flex:1;}
.tv-stepbar{height:5px;border-radius:999px;background:rgba(31,26,14,0.14);transition:background .3s;}
.tv-step.active .tv-stepbar{background:#2E5FD0;box-shadow:0 0 0 1px rgba(46,95,208,0.35);}
.tv-step.done .tv-stepbar{background:#2E5FD0;}
.tv-steplbl{font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:rgba(31,26,14,0.38);margin-top:6px;font-weight:600;}
.tv-step.active .tv-steplbl{color:rgba(31,26,14,0.72);}
.tv-step.done .tv-steplbl{color:#2E5FD0;}
/* ── crew token picker ── */
.tv-crew{display:flex;flex-wrap:wrap;gap:6px;align-items:center;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.16);border-radius:10px;padding:8px 10px;min-height:42px;}
.tv-crew:focus-within{border-color:${GOLD};}
.tv-crewchip{display:inline-flex;align-items:center;gap:6px;background:${GOLD};color:${INK};border-radius:999px;padding:4px 6px 4px 11px;font-size:12px;font-weight:600;}
.tv-crewchip button{background:rgba(31,26,14,0.2);border:none;color:${INK};border-radius:50%;width:16px;height:16px;cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0;}
.tv-crewinput{flex:1;min-width:130px;background:transparent;border:0;outline:0;color:${INK};font-size:13px;font-family:inherit;padding:4px 2px;}
.tv-crewinput::placeholder{color:rgba(31,26,14,0.4);}
.tv-crewdrop{margin-top:6px;background:${CARD};border:1px solid rgba(201,154,63,0.4);border-radius:12px;overflow:hidden;box-shadow:0 12px 34px rgba(0,0,0,0.3);max-height:232px;overflow-y:auto;}
.tv-crewrow{display:flex;align-items:center;gap:11px;padding:9px 13px;cursor:pointer;border-bottom:1px solid rgba(31,26,14,0.07);}
.tv-crewrow:last-child{border-bottom:0;}
.tv-crewrow:hover{background:rgba(201,154,63,0.12);}
.tv-crewav{width:30px;height:30px;border-radius:50%;background:rgba(201,154,63,0.22);color:${GOLD};display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:700;font-size:14px;flex-shrink:0;}
.tv-crewname{font-size:13px;font-weight:600;color:${INK};display:flex;align-items:center;gap:8px;}
.tv-crewtag{font-size:9px;letter-spacing:.05em;text-transform:uppercase;background:rgba(201,154,63,0.2);color:${GOLD};padding:2px 7px;border-radius:999px;font-weight:700;}
.tv-crewsub{font-size:11px;color:rgba(31,26,14,0.5);margin-top:1px;}
/* ── route map (krok 2) ── */
.tv-routemap{position:relative;height:300px;border-radius:14px;overflow:hidden;border:1px solid rgba(201,154,63,0.4);}
.tv-routemap .leaflet-container{width:100%;height:100%;background:#0a0a0a;}
.tv-maphint{position:absolute;left:50%;transform:translateX(-50%);bottom:12px;z-index:1000;background:rgba(5,5,5,0.74);color:${CARD};font-size:11px;letter-spacing:.03em;padding:6px 14px;border-radius:999px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);pointer-events:none;white-space:nowrap;}
.tv-abwrap{background:none;border:0;}
.tv-abpin{width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${GOLD};border:2px solid ${CARD};box-shadow:0 3px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;}
.tv-abpin span{transform:rotate(45deg);color:${INK};font-family:'Cinzel',serif;font-weight:700;font-size:12px;line-height:1;}
.tv-routebar{display:flex;align-items:center;gap:14px;margin-top:13px;}
.tv-kmchip{display:inline-flex;align-items:center;gap:7px;background:rgba(201,154,63,0.12);border:1px solid rgba(201,154,63,0.4);color:${INK};font-size:13px;font-weight:700;padding:9px 16px;border-radius:999px;}
.tv-kmchip.empty{background:rgba(31,26,14,0.04);border-color:rgba(31,26,14,0.14);color:rgba(31,26,14,0.5);font-weight:600;}
.tv-resetpts{background:none;border:0;color:${GOLD};font-size:12px;cursor:pointer;font-weight:600;font-family:inherit;}
.tv-resetpts:hover{text-decoration:underline;}
/* Route krok — štart/cieľ tlačidlá */
.tv-ptbtn{width:100%;display:flex;align-items:center;gap:11px;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.16);border-radius:11px;padding:12px 14px;cursor:pointer;font-family:inherit;color:${INK};transition:all .15s;margin-bottom:9px;text-align:left;}
.tv-ptbtn:hover{border-color:${GOLD};}
.tv-ptbtn.arming{border-color:${GOLD};background:rgba(201,154,63,0.13);box-shadow:0 0 0 2px rgba(201,154,63,0.28);}
.tv-ptbadge{width:26px;height:26px;border-radius:50%;background:${GOLD};color:${INK};display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:700;font-size:13px;flex-shrink:0;}
.tv-ptlbl{flex:1;font-size:13px;font-weight:600;}
.tv-ptstate{font-size:12px;color:${GOLD};font-weight:700;white-space:nowrap;}
.tv-ptbtn.tv-fok .tv-ptstate{color:#2FA24B;}
.tv-ptfoot{display:flex;align-items:center;gap:14px;margin-top:2px;}
.tv-pthint{font-size:11.5px;color:rgba(31,26,14,0.55);}
/* Route krok — vysvetlenie + manuálne miesto + trasovanie */
.tv-routehow{width:100%;display:flex;align-items:stretch;background:rgba(201,154,63,0.09);border:1px solid rgba(201,154,63,0.28);border-radius:11px;overflow:hidden;}
.tv-routehow-ico{flex-shrink:0;width:54px;display:flex;align-items:center;justify-content:center;background:rgba(201,154,63,0.2);border-right:1px solid rgba(201,154,63,0.28);}
.tv-routehow-ico img{width:28px;height:28px;filter:brightness(0) saturate(0);opacity:0.62;}
.tv-routehow-txt{padding:11px 13px;font-size:12px;line-height:1.5;color:rgba(31,26,14,0.68);}
.tv-routehow b{color:${INK};}
.tv-rsearch{display:flex;align-items:center;gap:9px;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.16);border-radius:10px;padding:9px 12px;}
.tv-rsearch img{width:14px;height:14px;filter:brightness(0) saturate(0);opacity:0.5;flex-shrink:0;}
.tv-rsearch input{background:transparent;border:0;outline:0;color:${INK};font-size:12.5px;width:100%;font-family:inherit;}
.tv-rsearch input::placeholder{color:rgba(31,26,14,0.4);}
.tv-orsep{display:flex;align-items:center;gap:10px;text-align:center;color:rgba(31,26,14,0.4);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;margin:2px 0;}
.tv-orsep::before,.tv-orsep::after{content:'';flex:1;height:1px;background:rgba(31,26,14,0.14);}
.tv-tracebar{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.14);border-radius:11px;padding:9px 12px;min-height:40px;}
.tv-tracetip{width:100%;font-size:11px;color:rgba(31,26,14,0.5);text-align:center;margin-top:2px;}
.tv-tracetip b{color:${GOLD};}
/* editovateľné km v route chipe — auto z route, dá sa prepísať */
.tv-kmchip .tv-kminput{width:48px;border:none;background:rgba(46,95,208,0.16);border:1px solid rgba(46,95,208,0.45);border-radius:6px;color:${INK};font-size:13px;font-weight:700;text-align:center;padding:1px 4px;margin:0 3px;font-family:inherit;-moz-appearance:textfield;}
.tv-kmchip .tv-kminput:focus{outline:none;border-color:#2E5FD0;background:rgba(46,95,208,0.24);}
.tv-kmchip .tv-kminput::-webkit-outer-spin-button,.tv-kmchip .tv-kminput::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
/* Media krok — Notes (full) + dva bloky Photo|Rating */
.tv-mediagrid{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px;align-items:start;}
.tv-mediacol{display:flex;flex-direction:column;gap:8px;align-items:center;}
.tv-mediacol > label{align-self:flex-start;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:rgba(31,26,14,0.45);}
.tv-mediabody{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;}
/* Photo stĺpec — tlačítko naľavo (lícuje s textareou hore), náhľady fotiek vpravo vedľa neho v jednom riadku */
.tv-photorow{display:flex;flex-wrap:nowrap;align-items:center;justify-content:flex-start;gap:7px;width:100%;}
.tv-photorow .tv-photo{width:40px;height:40px;border-radius:8px;flex-shrink:0;}
.tv-photorow .tv-photo-x{width:16px;height:16px;top:-5px;right:-5px;font-size:8px;}
.tv-mediacol .tv-drop{display:inline-flex;align-items:center;justify-content:center;gap:6px;width:auto;min-height:34px;padding:7px 13px;font-size:11px;border-radius:9px;flex-shrink:0;}
.tv-mediacol .tv-photo{width:46px;height:46px;border-radius:9px;}
/* Rating stĺpec — label naľavo od hviezdičiek, riadok vertikálne zarovnaný s tlačítkom */
.tv-ratingrow{display:flex;align-items:center;gap:10px;min-height:34px;}
.tv-ratinglabel{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:rgba(31,26,14,0.45);}
.tv-mediacol .tv-addstars{gap:4px;height:auto;}
.tv-mediacol .tv-addstars button{font-size:21px;}
/* ── in-block add flow (kompakt, drží výšku Bloku 1) ── */
.tv-addflow{width:100%;text-align:left;justify-content:center;gap:8px;}
.tv-addflow .tv-addfield{margin-bottom:10px;}
.tv-addflow .tv-addfield label{font-size:9.5px;margin-bottom:4px;}
.tv-addflow .tv-addfield input,.tv-addflow .tv-addfield select,.tv-addflow .tv-addfield textarea{padding:8px 11px;font-size:12.5px;border-radius:9px;}
.tv-addflow .tv-addfield input,.tv-addflow .tv-addfield select{height:38px;box-sizing:border-box;}
.tv-addflow .tv-addfield textarea{height:auto;}
/* kalendár ikona viditeľná (bola biela/neviditeľná na papyruse) */
.tv-addflow input[type="date"]{color-scheme:light;}
.tv-addflow input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.55;cursor:pointer;}
/* vyplnené políčko = modré (Matej 2026-07-14: ADD flow zjednotený na brand modrú namiesto zelenej) */
.tv-fok,.tv-fok:focus{border-color:#2E5FD0 !important;background:rgba(46,95,208,0.1) !important;}
/* km chip keď je trasa naklikaná = modrý (rovnaká logika ako vyplnené polia) */
.tv-kmok{background:rgba(46,95,208,0.16) !important;border-color:#2E5FD0 !important;color:${INK} !important;}
.tv-addflow .tv-addfield textarea{min-height:56px;}
.tv-addflow .tv-addgrid{gap:10px;}
.tv-addflow .tv-addsect{margin:0 0 7px;}
/* Basics riadky: [name·date·country vlajka] / [region·member] */
.tv-basrow1{display:grid;grid-template-columns:1fr 118px 62px;gap:9px;margin-bottom:10px;width:100%;}
.tv-basrow2{display:grid;grid-template-columns:1fr 1.35fr;gap:9px;margin-bottom:0;width:100%;}
.tv-basrow1 .tv-addfield,.tv-basrow2 .tv-addfield{margin-bottom:0;}
.tv-ctyfield{position:relative;}
.tv-ctybtn{width:100%;display:flex;align-items:center;justify-content:center;gap:4px;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.16);border-radius:9px;padding:7px 6px;font-size:16px;line-height:1;cursor:pointer;font-family:inherit;color:${INK};height:38px;box-sizing:border-box;}
.tv-ctybtn:hover{border-color:${GOLD};}
.tv-ctychev{font-size:9px;opacity:0.5;}
.tv-ctybackdrop{position:fixed;inset:0;z-index:1999;}
.tv-ctydrop{z-index:30;background:${CARD};border:1px solid rgba(201,154,63,0.4);border-radius:10px;overflow:hidden;box-shadow:0 14px 38px rgba(0,0,0,0.4);min-width:150px;}
.tv-ctyrow{padding:9px 13px;font-size:12.5px;cursor:pointer;white-space:nowrap;color:${INK};border-bottom:1px solid rgba(31,26,14,0.06);}
.tv-ctyrow:last-child{border-bottom:0;}
.tv-ctyrow:hover{background:rgba(201,154,63,0.12);}
/* crew dropdown = absolútny (nerozťahuje riadok), obmedzená výška aby sa zmestil */
.tv-addflow .tv-crewdrop{position:absolute;left:0;right:0;top:100%;margin-top:5px;z-index:25;max-height:152px;}
.tv-addflow .tv-crew{min-height:38px;padding:6px 8px;box-sizing:border-box;cursor:text;}
.tv-addflow .tv-crewinput{font-size:12.5px;min-width:90px;}
.tv-crewplus{width:22px;height:22px;border-radius:50%;background:${GOLD};color:${INK};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;line-height:1;flex-shrink:0;}
/* type = jeden riadok (nowrap, skrytý scroll ak treba) */
.tv-addflow .tv-addacts{gap:6px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:2px;}
.tv-addflow .tv-addacts::-webkit-scrollbar{display:none;}
.tv-addflow .tv-actpill{flex-shrink:0;padding:7px 11px;font-size:11.5px;gap:5px;}
.tv-addflow .tv-actpill img{width:14px;height:14px;}
.tv-addflow .tv-drop{padding:13px;font-size:12px;}
.tv-addflow .tv-addstars{height:auto;margin-top:2px;}
.tv-addflow .tv-addstars button{font-size:23px;}
.tv-addflow .tv-fade{margin:8px auto;}
/* draw box (krok 2 — kreslenie do pravej mapy) */
.tv-drawbox{width:100%;}
.tv-drawbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(201,154,63,0.1);border:1.5px dashed rgba(201,154,63,0.6);color:${INK};font-family:inherit;font-weight:600;font-size:13px;padding:12px;border-radius:11px;cursor:pointer;transition:all .15s;}
.tv-drawbtn:hover{background:rgba(201,154,63,0.18);}
.tv-drawlive{display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(31,26,14,0.05);border:1px solid rgba(31,26,14,0.14);border-radius:11px;padding:9px 11px;font-size:12.5px;color:${INK};}
.tv-drawlive b{color:${GOLD};}
.tv-drawlive .tv-kmchip{padding:6px 12px;font-size:12px;}
.tv-drawacts{display:flex;gap:7px;flex-shrink:0;}
.tv-drawundo{background:none;border:1px solid rgba(31,26,14,0.2);color:${INK};font-size:11.5px;padding:6px 11px;border-radius:8px;cursor:pointer;font-family:inherit;}
.tv-drawundo:hover{border-color:${GOLD};}
.tv-drawdone{background:${GOLD};border:1px solid ${GOLD};color:${INK};font-size:11.5px;font-weight:700;padding:6px 13px;border-radius:8px;cursor:pointer;font-family:inherit;}
.tv-drawdone:hover{background:#d9a94a;}
.tv-map.drawing .leaflet-container{cursor:crosshair;}
.tv-dotwrap{background:none;border:0;}
.tv-dot{width:8px;height:8px;border-radius:50%;background:${GOLD};border:1.5px solid ${CARD};box-shadow:0 1px 3px rgba(0,0,0,0.5);}
@media (max-width:560px){
  .tv-addgrid{grid-template-columns:1fr;}
  .tv-addfoot{flex-direction:column-reverse;align-items:stretch;}
  .tv-addnote{max-width:100%;justify-content:center;text-align:center;}
  .tv-addsave{width:100%;}
}
@media (max-width:1100px){.tv-grid{grid-template-columns:repeat(3,1fr);}}
@media (max-width:760px){
  .tv-hero{grid-template-columns:1fr;}
  .tv-map{min-height:320px;}
  .tv-map .leaflet-container{min-height:320px;}
  .tv-grid{grid-template-columns:repeat(2,1fr);}
  .tv-rankgrid{grid-template-columns:1fr;}
  .tv-evgrid{grid-template-columns:1fr;}
}
@media (max-width:480px){.tv-grid{grid-template-columns:1fr;}}
`;

function TrailCard({ card, fav, walked, onToggleFav, onOpenWalk, onOpen, heartCount }: {
  card: Card;
  fav: boolean;
  walked: boolean;
  onToggleFav: (id: string) => void;
  onOpenWalk: (card: Card) => void;
  onOpen?: (card: Card) => void;
  heartCount?: number;
}) {
  return (
    <div className="tv-gcard" onClick={() => onOpen?.(card)} style={{ cursor: onOpen ? 'pointer' : undefined }}>
      <div className="tv-timg" style={{ backgroundImage: `url('https://picsum.photos/seed/${card.img}/540/300')` }}>
        {card.diff && <span className="tv-tbadge">{card.diff}</span>}
        <div className="tv-gicons">
          <button className={`tv-gicon${fav ? ' active' : ''}`} title="Favorite" onClick={(e) => { e.stopPropagation(); onToggleFav(card.id); }}>
            <img src={ICON('heart')} alt="Favorite" />
          </button>
          <button className={`tv-gicon${walked ? ' active' : ''}`} title="Walked" onClick={(e) => { e.stopPropagation(); onOpenWalk(card); }}>
            <img src={ICON('walk')} alt="Walked" />
          </button>
        </div>
      </div>
      <div className="tv-tbody">
        <div className="tv-tname">{card.name}</div>
        <div className="tv-tmeta">
          <span>{card.region}</span>
          {card.km && <span>{card.km} km</span>}
          {card.stars != null && <span className="tv-tstar">★ {card.stars}</span>}
          {typeof heartCount === 'number' && <span className="tv-thearts">♥ {heartCount}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── "Go on a trip" — demo data (variant A) ── */
// Aktivity (človek vyberie jednu). hasDistance = má náročnosť vo vzdialenosti.
const DEFAULT_TAGS = ['Mountains', 'Lake', 'Stream', 'View', 'Meadow', 'Sunset', 'Forest'];
const TRIP_ACTIVITIES: { id: string; label: string; icon: string; hasDistance: boolean; spot?: boolean; tags: string[] }[] = [
  { id: 'hiking', label: 'Hiking', icon: 'walk', hasDistance: true, tags: DEFAULT_TAGS },
  { id: 'picnic', label: 'Picnic', icon: 'food', hasDistance: false, tags: DEFAULT_TAGS },
  { id: 'overnight', label: 'Overnight', icon: 'house-heart', hasDistance: false, tags: DEFAULT_TAGS },
  { id: 'skating', label: 'Skate', icon: 'cycle', hasDistance: false, tags: ['Forest', 'Stream', 'Embankment'] },
  { id: 'paddleboard', label: 'Paddleboard', icon: 'water', hasDistance: false, spot: true, tags: ['In the middle of nature', 'In the middle of nowhere'] }, // bodová: parking + názov jazera
];
// Blok 3 (prehliadač výletov) — emoji pre TRIP_ACTIVITIES dropdown; samostatná mapa, nemení TRIP_ACTIVITIES (používa ho aj GO flow)
const ACT_EMOJI: Record<string, string> = { hiking: '🥾', picnic: '🧺', overnight: '⛺', skating: '🛼', paddleboard: '🏄' };
// Hiking distance = jeden dropdown; Multi-day je položka (stratil vlastný dropdown)
const HIKE_DISTANCE = ['Up to 5 km', 'Up to 10 km', 'Over 10 km', 'Multi-day'];
// demo výsledky pre „Show trails" (Malé Karpaty, približné súradnice)
const RESULT_TRAILS: { name: string; pos: LatLngTuple; km: string; stars: number }[] = [
  { name: 'Záruby', pos: [48.4986, 17.4103], km: '9.1', stars: 4.7 },
  { name: 'Orlie skaly', pos: [48.5155, 17.4370], km: '5.2', stars: 4.8 },
  { name: 'Majdán', pos: [48.5310, 17.4290], km: '4.0', stars: 4.5 },
  { name: 'Vápenná', pos: [48.5062, 17.4520], km: '6.7', stars: 4.6 },
  { name: 'Čertov žľab', pos: [48.5240, 17.4045], km: '7.9', stars: 4.4 },
  { name: 'Havranica', pos: [48.4890, 17.4310], km: '3.6', stars: 4.9 },
  { name: 'Vlčia skala', pos: [48.5380, 17.4480], km: '5.8', stars: 4.3 },
];
const RESULTS_PER_PAGE = 4; // 2×2 dlaždice, zvyšok cez posuvník
const RESULT_CENTER: LatLngTuple = [48.515, 17.425];

// ── VZOROVÝ VÝLET (Matej: „chcem mať jeden vzorový...na nom sa naučíme") ──
// Jeden bohato vyplnený výlet = ako vyzerá hotový záznam po pridaní. Klik na
// ktorúkoľvek result kartu ho otvorí (headline = z karty, telo = tento vzor).
const SAMPLE_ROUTE: LatLngTuple[] = [
  [48.5086, 17.4210], [48.5108, 17.4243], [48.5137, 17.4268],
  [48.5168, 17.4259], [48.5193, 17.4224], [48.5211, 17.4182],
];
const SAMPLE_TRIP = {
  region: 'Malé Karpaty · Slovakia',
  hero: 'https://picsum.photos/seed/hektorridge/720/360',
  photos: ['a', 'b', 'c'].map(s => `https://picsum.photos/seed/hkr-${s}/220/150`),
  date: 'Jul 6, 2026',
  duration: '3 h 20 min',
  difficulty: 'Moderate',
  ascent: 420,
  descent: 380,
  activity: 'Hiking',
  tags: ['Mountains', 'Stream', 'View', 'Shade'], // NIE „dog-friendly" — v DOGYPTE je všetko dog-friendly
  crew: ['Matej', 'Hektor'],
  notes: 'Shaded forest climb along a stream, opening onto a rocky ridge with a wide view over the valley. Two water spots for the dog on the way up; the summit meadow is off-leash friendly and the descent is gentle on paws.',
  route: SAMPLE_ROUTE,
  ratingCount: 34,
  reviews: [
    { who: 'Zuzka K.', stars: 5, text: 'Perfect half-day with the dog — plenty of water and shade.' },
    { who: 'Peter M.', stars: 4, text: 'Ridge view worth it. Last climb a bit steep for small dogs.' },
  ],
};
// voliteľné tagy — horizontálny scroll s emoji, pridávame priebežne
const TRIP_TAGS: { e: string; t: string }[] = [
  { e: '🏔️', t: 'Mountains' },
  { e: '🏞️', t: 'Lake' },
  { e: '💧', t: 'Stream' },
  { e: '🌄', t: 'View' },
  { e: '🌼', t: 'Meadow' },
  { e: '🌅', t: 'Sunset' },
  { e: '🌲', t: 'Forest' },
  { e: '🛤️', t: 'Embankment' },
  { e: '🌊', t: 'Reservoir' },
  { e: '💦', t: 'Flatwater' },
  { e: '⛰️', t: 'Mountain lake' },
  { e: '🌿', t: 'In the middle of nature' },
  { e: '🌌', t: 'In the middle of nowhere' },
];
const TAG_EMOJI: Record<string, string> = Object.fromEntries(TRIP_TAGS.map(t => [t.t, t.e]));

// „Add a trail" — možnosti (reuse go-on-a-trip taxonómie)
const SK_REGIONS = ['Bratislavský', 'Trnavský', 'Trenčiansky', 'Nitriansky', 'Žilinský', 'Banskobystrický', 'Prešovský', 'Košický'];
const ADD_COUNTRIES: { v: string; flag: string; label: string }[] = [
  { v: 'Slovakia', flag: '🇸🇰', label: 'Slovakia' },
  { v: 'Czechia', flag: '🇨🇿', label: 'Czechia' },
  { v: 'Austria', flag: '🇦🇹', label: 'Austria' },
  { v: 'Switzerland', flag: '🇨🇭', label: 'Switzerland' },
];
// Crew picker — vlastný pack + členovia z DB (demo). pack=true → „your pack".
const ADD_MEMBERS: { id: string; name: string; sub: string; pack?: boolean }[] = [
  { id: 'hekthor', name: 'Hekthor', sub: 'Your pack · dog', pack: true },
  { id: 'zuzka-k', name: 'Zuzka K.', sub: 'Pilgrim · Bratislava' },
  { id: 'peter-m', name: 'Peter M.', sub: 'Pilgrim · Žilina' },
  { id: 'lucia-b', name: 'Lucia B.', sub: 'Novice · Košice' },
  { id: 'tomas-r', name: 'Tomáš R.', sub: 'Pilgrim · Nitra' },
  { id: 'janka-s', name: 'Janka S.', sub: 'Pharaoh · Prešov' },
];

// vzdušná vzdialenosť A→B (F1 = haversine; reálna trasa cez body/GraphHopper = F2)
function haversineKm(a: LatLngTuple, b: LatLngTuple): number {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const la1 = a[0] * Math.PI / 180, la2 = b[0] * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const abIcon = (label: string) => L.divIcon({
  className: 'tv-abwrap',
  html: `<div class="tv-abpin"><span>${label}</span></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

// Očíslovaný pin pre hero trail (idle mapa, prepojený s kartou v ľavom stĺpci)
const numIcon = (n: number, color: string, hot: boolean) => L.divIcon({
  className: 'tv-htr-pinwrap',
  html: `<div class="tv-htr-pin${hot ? ' hot' : ''}" style="background:${color};"><span>${n}</span></div>`,
  iconSize: hot ? [30, 30] : [26, 26],
  iconAnchor: hot ? [15, 30] : [13, 26],
});


// Pan/zoom mapy na vybranú lokalitu (Mapy.com geocode výsledok).
function FlyTo({ target }: { target: LatLngTuple | null }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo(target, 13, { duration: 1.2 }); }, [target, map]);
  return null;
}

// Zoom na celú trasu (klik na hero kartu/pin → fitBounds na jej GPS path)
function FitBounds({ path }: { path: LatLngTuple[] | null }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.length) map.fitBounds(L.latLngBounds(path), { padding: [40, 40] });
  }, [path, map]);
  return null;
}

// dĺžka trasy = súčet haversine medzi naklikanými bodmi (F1; snap na chodník = F2)
function pathKm(pts: LatLngTuple[]): number {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += haversineKm(pts[i - 1], pts[i]);
  return s;
}
const dotIcon = L.divIcon({ className: 'tv-dotwrap', html: `<div class="tv-dot"></div>`, iconSize: [11, 11], iconAnchor: [5.5, 5.5] });

// ── POI vrstva z OpenStreetMap (Overpass) ──────────────────────────────────
// Mapy.com raster POI symboly nemá (overené), tak si výhľady/pramene/vrcholy
// ťaháme z OSM podľa výrezu mapy a kreslíme ako vlastné markery. Emoji ikonky
// = prototyp (brand ikonky doladíme neskôr).
type PoiKind = 'viewpoint' | 'spring' | 'water' | 'peak' | 'shelter';
const POI_KINDS: { key: PoiKind; label: string; emoji: string; filter: string }[] = [
  { key: 'viewpoint', label: 'Viewpoints',     emoji: '🔭', filter: 'node["tourism"="viewpoint"]' },
  { key: 'spring',    label: 'Springs',        emoji: '💧', filter: 'node["natural"="spring"]' },
  { key: 'water',     label: 'Drinking water', emoji: '🚰', filter: 'node["amenity"="drinking_water"]' },
  { key: 'peak',      label: 'Peaks',          emoji: '⛰️', filter: 'node["natural"="peak"]' },
  { key: 'shelter',   label: 'Shelters',       emoji: '🛖', filter: 'node["tourism"="alpine_hut"];node["amenity"="shelter"]' },
];
const POI_EMOJI: Record<PoiKind, string> = Object.fromEntries(POI_KINDS.map(k => [k.key, k.emoji])) as Record<PoiKind, string>;

function classifyPoi(tags: Record<string, string>): PoiKind | null {
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.natural === 'spring') return 'spring';
  if (tags.amenity === 'drinking_water') return 'water';
  if (tags.natural === 'peak') return 'peak';
  if (tags.tourism === 'alpine_hut' || tags.amenity === 'shelter') return 'shelter';
  return null;
}
const poiIcon = (kind: PoiKind) => L.divIcon({
  className: 'tv-poiwrap',
  html: `<div class="tv-poi tv-poi--${kind}">${POI_EMOJI[kind]}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface OsmPoi { id: number; lat: number; lng: number; kind: PoiKind; name: string }
type PoiStatus = { loading?: boolean; count?: number; error?: boolean; lowzoom?: boolean };

// Verejné Overpass inštancie — skúšame v poradí (failover), lebo hlavná býva
// pomalá/preťažená. Prvá čo odpovie vyhráva.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];
const POI_MIN_ZOOM = 11;

async function overpassFetch(query: string, signal: AbortSignal) {
  let lastErr: unknown = null;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal,
      });
      if (!r.ok) { lastErr = new Error(`HTTP ${r.status} @ ${url}`); continue; }
      return await r.json();
    } catch (e) {
      if (signal.aborted) throw e; // zámerné zrušenie — neskúšaj ďalší
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('all overpass endpoints failed');
}

function PoiLayer({ enabled, onStatus }: { enabled: Record<PoiKind, boolean>; onStatus?: (s: PoiStatus) => void }) {
  const map = useMap();
  const [pois, setPois] = useState<OsmPoi[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);

  const activeKinds = POI_KINDS.filter(k => enabled[k.key]);

  useEffect(() => {
    if (activeKinds.length === 0) { setPois([]); onStatus?.({ count: 0 }); return; }
    function fetchPois() {
      if (map.getZoom() < POI_MIN_ZOOM) { setPois([]); onStatus?.({ lowzoom: true }); return; }
      const b = map.getBounds();
      const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
      const body = activeKinds.map(k => k.filter.split(';').map(f => `${f}(${bbox});`).join('')).join('');
      const q = `[out:json][timeout:25];(${body});out body 300;`;
      abort.current?.abort();
      abort.current = new AbortController();
      onStatus?.({ loading: true });
      overpassFetch(q, abort.current.signal)
        .then((d: { elements: { id: number; lat: number; lon: number; tags?: Record<string, string> }[] }) => {
          const out: OsmPoi[] = [];
          for (const el of d.elements ?? []) {
            const kind = classifyPoi(el.tags ?? {});
            if (!kind || !enabled[kind]) continue;
            out.push({ id: el.id, lat: el.lat, lng: el.lon, kind, name: el.tags?.name ?? '' });
          }
          // eslint-disable-next-line no-console
          console.log(`[trails POI] ${out.length} bodov v okne (zoom ${map.getZoom()})`);
          setPois(out);
          onStatus?.({ count: out.length });
        })
        .catch((e) => {
          if (abort.current?.signal.aborted) return; // zrušené novším pohybom — ticho
          // eslint-disable-next-line no-console
          console.warn('[trails POI] Overpass zlyhal:', e);
          onStatus?.({ error: true });
        });
    }
    function schedule() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(fetchPois, 500);
    }
    schedule();
    map.on('moveend', schedule);
    return () => { map.off('moveend', schedule); if (timer.current) clearTimeout(timer.current); abort.current?.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, JSON.stringify(enabled)]);

  return (
    <>
      {pois.map(p => (
        <Marker key={`${p.kind}-${p.id}`} position={[p.lat, p.lng]} icon={poiIcon(p.kind)}>
          {p.name && (
            <Tooltip direction="top" offset={[0, -12]} className="tv-trailtip">
              <div className="tv-tt-name">{p.name}</div>
            </Tooltip>
          )}
        </Marker>
      ))}
    </>
  );
}

// „Add a trail" krok 2 — Route: klikaním do mapy sa trasujú body pozdĺž chodníka (A → … → cieľ).
// `path` = kotvy (to, čo používateľ naklikal a vie undo-núť), `line` = skutočne vykreslená
// stopa prilepená na chodník. Body sa kreslia na kotvách, čiara po línii.
function PickPath({ drawing, path, line, onAdd }: {
  drawing: boolean; path: LatLngTuple[]; line?: LatLngTuple[]; onAdd: (p: LatLngTuple) => void;
}) {
  useMapEvents({ click(e) { if (drawing) onAdd([e.latlng.lat, e.latlng.lng]); } });
  const shown = line && line.length > 1 ? line : path;
  return (
    <>
      {shown.length > 1 && <Polyline positions={shown} pathOptions={{ color: GOLD, weight: 4, opacity: 0.95 }} />}
      {path.map((p, i) => <Marker key={i} position={p} icon={dotIcon} />)}
      {path.length > 0 && <Marker position={path[0]} icon={abIcon('A')} />}
      {path.length > 1 && <Marker position={path[path.length - 1]} icon={abIcon('B')} />}
    </>
  );
}

type PlaceSug = { name: string; sub: string; lat: number; lon: number };

// Klikateľná mapa krajov/kantónov pre zvolenú krajinu (SK/CZ/AT/CH). Multi-select.
function RegionMap({ country, selected, onToggle }: { country: string; selected: Set<string>; onToggle: (name: string) => void }) {
  const data = REGION_MAPS[country] || REGION_MAPS.Slovakia;
  return (
    <div className="tv-svk">
      <svg viewBox={data.viewBox}>
        {data.regions.map(r => (
          <path
            key={r.name}
            data-name={r.name}
            d={r.d}
            className={selected.has(r.name) ? 'sel' : undefined}
            onClick={() => onToggle(r.name)}
          />
        ))}
      </svg>
    </div>
  );
}

export default function TrailsPreview() {
  // BLOK 3 — prehliadač trás: vyhľadávač + kde=zóna (W/C/E) + zoradiť + „kde som nebol"
  const [browserQuery, setBrowserQuery] = useState('');
  const [browserActivity, setBrowserActivity] = useState('');
  const [browserZone, setBrowserZone] = useState<'' | Zone>('');
  const [browserSort, setBrowserSort] = useState<'rating' | 'easy' | 'short' | 'pop'>('rating');
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [myTab, setMyTab] = useState<'wishlist' | 'prejdene' | 'oblubene'>('wishlist');

  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [walkedIds, setWalkedIds] = useState<Set<string>>(new Set());
  const [walkCard, setWalkCard] = useState<Card | null>(null);
  const [walkForm, setWalkForm] = useState({ date: '', crew: '', km: '', rating: 0 });
  const [eventOpen, setEventOpen] = useState<EventItem | null>(null);

  // ── Hero idle: 12 reálnych trás — karta↔pin prepojenie, filter, stavové farby ──
  const [hoverId, setHoverId] = useState<string | null>(null); // hover karta ALEBO pin/trasa (obojsmerné)
  const [selId, setSelId] = useState<string | null>(null); // klik karta/pin → zvýraznené + otvorený detail
  const [heroQuery, setHeroQuery] = useState('');
  const [heroDiff, setHeroDiff] = useState<'' | 'Easy' | 'Moderate' | 'Hard'>('');
  const [heroBounds, setHeroBounds] = useState<LatLngTuple[] | null>(() => HERO_TRAILS.flatMap(t => t.path)); // fitBounds cieľ; default = všetkých 12 trás naraz
  const heroCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const trailColor = (id: string) => walkedIds.has(id) ? '#7BB07A' : favIds.has(id) ? GOLD : '#D47D6D';
  useEffect(() => { // hover na pin/trasu → doscrolluje zodpovedajúcu kartu
    if (hoverId) heroCardRefs.current[hoverId]?.scrollIntoView({ block: 'nearest' });
  }, [hoverId]);

  // ── Map search (Mapy.com geocode/suggest) ──
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeSug, setPlaceSug] = useState<PlaceSug[]>([]);
  const [mapTarget, setMapTarget] = useState<LatLngTuple | null>(null);
  const [mapStyle, setMapStyle] = useState<'outdoor' | 'aerial' | 'winter'>('outdoor'); // prepínač priamo na mape
  const [poiEnabled, setPoiEnabled] = useState<Record<PoiKind, boolean>>({ viewpoint: true, spring: true, water: true, peak: true, shelter: true });
  const [poiPanel, setPoiPanel] = useState(false); // rozbalený panel POI prepínačov
  const [poiStatus, setPoiStatus] = useState<PoiStatus>({}); // stav načítania POI (loading/count/error/lowzoom)

  useEffect(() => {
    const q = placeQuery.trim();
    if (q.length < 2) { setPlaceSug([]); return; }
    const t = setTimeout(async () => {
      try {
        const url = `https://api.mapy.com/v1/suggest?query=${encodeURIComponent(q)}&lang=en&limit=6&apikey=${MAPY_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const items: PlaceSug[] = (data.items || [])
          .map((it: { name?: string; label?: string; location?: string; position?: { lat?: number; lon?: number } }) => ({
            name: it.name || '',
            sub: [it.label, it.location].filter(Boolean).join(' · '),
            lat: it.position?.lat as number,
            lon: it.position?.lon as number,
          }))
          .filter((x: PlaceSug) => Number.isFinite(x.lat) && Number.isFinite(x.lon));
        setPlaceSug(items);
      } catch { setPlaceSug([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [placeQuery]);

  // ── Blok 1 mode prepínač (Trails | Places) ──
  const [cardMode, setCardMode] = useState<'trails' | 'places'>('trails');

  // ── "Go on a trip" flow (variant A): idle → region → activity (+detail inline) ──
  const [tripStep, setTripStep] = useState<'idle' | 'region' | 'activity' | 'results'>('idle');
  const [tripCountry, setTripCountry] = useState('Slovakia'); // default = geolokácia (mock: SK)
  const [tripRegions, setTripRegions] = useState<Set<string>>(new Set()); // multi-select krajov
  const toggleRegion = (name: string) => setTripRegions(prev => {
    const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n;
  });
  const [tripActivity, setTripActivity] = useState(''); // single-select
  const [tripDistance, setTripDistance] = useState(''); // hiking náročnosť
  const [tripTags, setTripTags] = useState<Set<string>>(new Set()); // voliteľné tagy
  const toggleTag = (t: string) => setTripTags(prev => {
    const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n;
  });
  const tagsRef = useRef<HTMLDivElement>(null);
  const scrollTags = (dir: number) => tagsRef.current?.scrollBy({ left: dir * 130, behavior: 'smooth' });
  const activity = TRIP_ACTIVITIES.find(a => a.id === tripActivity);
  const [showResults, setShowResults] = useState(false); // Show trails → markery na mape
  const [detailTrail, setDetailTrail] = useState<{ id: string; name: string; km?: string; stars?: number; hero?: HeroTrail } | null>(null); // otvorený vzorový výlet
  const openTrailDetail = (c: Card) => {
    setDetailTrail({ id: c.id, name: c.name, km: c.km, stars: c.stars });
  }; // detail = popup cez celú stránku (nie v Bloku 1)
  const selectTrail = (t: HeroTrail) => { // klik na hero kartu/pin → zoom na trasu + detail (reálne dáta)
    setSelId(t.id); setHeroBounds(t.path);
    setDetailTrail({ id: t.id, name: t.name, km: t.km, stars: t.stars, hero: t });
  };
  const toggleWalked = (id: string) => setWalkedIds(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const [resultPage, setResultPage] = useState(0); // stránkovanie 2×2 dlaždíc výsledkov
  const resultPages = Math.ceil(RESULT_TRAILS.length / RESULTS_PER_PAGE);

  // ── "Add a trail" — flow priamo v Bloku 1 (3 kroky, rovnaká výška bloku) ──
  const emptyAdd = {
    name: '', date: '', rating: 0,
    country: 'Slovakia', region: '', type: '', desc: '', water: '',
  };
  const [addActive, setAddActive] = useState(false); // Blok 1 v add-móde
  const [addSent, setAddSent] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [addForm, setAddForm] = useState(emptyAdd);
  const [addCrew, setAddCrew] = useState<string[]>([]);
  const [crewQuery, setCrewQuery] = useState('');
  const [crewOpen, setCrewOpen] = useState(false);
  const [addCtyOpen, setAddCtyOpen] = useState(false); // custom country dropdown (vlajka → plné názvy)
  const [addPath, setAddPath] = useState<LatLngTuple[]>([]); // Route krok 2 — KOTVY (naklikané body)
  // snap-to-trail: legs[i] = geometria chodníka medzi kotvou i a i+1 (null = rovná čiara,
  // keď routing zlyhá alebo by chcel absurdnú obchádzku). Kreslenie sa nikdy nečaká na sieť.
  const [addLegs, setAddLegs] = useState<(LatLngTuple[] | null)[]>([]);
  const [snapping, setSnapping] = useState(0);
  const [kmManual, setKmManual] = useState(''); // route km s možnosťou ručne prepísať (Matej: „z route s možnosťou prepísať")
  const [waterQuery, setWaterQuery] = useState('');          // paddleboard — vyhľadávanie vodnej plochy
  const [waterSug, setWaterSug] = useState<PlaceSug[]>([]);
  const [addTags, setAddTags] = useState<Set<string>>(new Set());
  const [addPhotos, setAddPhotos] = useState<string[]>([]);
  const addTagsRef = useRef<HTMLDivElement>(null);
  const crewInputRef = useRef<HTMLInputElement>(null);
  const ctyBtnRef = useRef<HTMLButtonElement>(null);
  const ctyDropStyle = () => {
    const r = ctyBtnRef.current?.getBoundingClientRect();
    if (!r) return {};
    return { position: 'fixed' as const, top: r.bottom + 5, left: Math.max(8, r.right - 156), width: 156, marginTop: 0, zIndex: 2000 };
  };
  const waterRef = useRef<HTMLDivElement>(null);
  const waterDropStyle = () => {
    const r = waterRef.current?.getBoundingClientRect();
    if (!r) return {};
    // otvor NAD poľom (nad blokom), nie pod — nescrolluje, neoreže sa
    return { position: 'fixed' as const, left: r.left, width: r.width, bottom: window.innerHeight - r.top + 6, marginTop: 0, maxHeight: 220, overflowY: 'auto' as const, zIndex: 2000 };
  };
  const setAdd = (patch: Partial<typeof emptyAdd>) => setAddForm(prev => ({ ...prev, ...patch }));
  const toggleAddTag = (t: string) => setAddTags(prev => {
    const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n;
  });
  const scrollAddTags = (dir: number) => addTagsRef.current?.scrollBy({ left: dir * 130, behavior: 'smooth' });
  const addCrewMember = (name: string) => { setAddCrew(prev => prev.includes(name) ? prev : [...prev, name]); setCrewQuery(''); };
  const removeCrew = (name: string) => setAddCrew(prev => prev.filter(n => n !== name));
  const startAdd = () => {
    setAddForm(emptyAdd); setAddCrew([]); setCrewQuery(''); setAddTags(new Set());
    setAddPhotos([]); setAddPath([]); setKmManual(''); setWaterQuery(''); setWaterSug([]); setAddStep(1); setAddSent(false); setAddActive(true);
  };
  const closeAdd = () => { setAddActive(false); setAddSent(false); };
  const onAddPhotos = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map(f => URL.createObjectURL(f));
    setAddPhotos(prev => [...prev, ...urls].slice(0, 12));
  };
  const removeAddPhoto = (idx: number) => setAddPhotos(prev => prev.filter((_, i) => i !== idx));
  const addRegions = addForm.country === 'Slovakia' ? SK_REGIONS : [];
  // čiara na mape = kotvy poprepájané snapnutou geometriou (kde je); km sa počíta z NEJ
  const addLine = buildLine(addPath, addLegs);
  const routeKm = addPath.length >= 2 ? pathKm(addLine) : null; // km po snapnutej trase (rovná čiara tam, kde snap nesadol)
  // route km → hiking distance kôš (rovnaké koše ako GO filter HIKE_DISTANCE → trasa sa tam neskôr prejaví)
  const kmBucket = (km: number) => (km <= 5 ? 'Up to 5 km' : km <= 10 ? 'Up to 10 km' : 'Over 10 km');
  // efektívne km = ručná hodnota ak zadaná, inak z route; kôš sa počíta z nej
  const effKm = kmManual.trim() !== '' && !Number.isNaN(parseFloat(kmManual)) ? parseFloat(kmManual) : routeKm;
  const addActivity = TRIP_ACTIVITIES.find(a => a.id === addForm.type);
  const isSpot = !!addActivity?.spot; // bodová aktivita (paddleboard) = parking + názov, nie trasa
  // spot = 1 bod (parking), inak trasa. Pri trase sa nová kotva hneď skúsi prilepiť na
  // chodník — kotva pribudne okamžite (UI nečaká), geometria dobehne a prekreslí čiaru.
  const onMapAdd = (p: LatLngTuple) => {
    if (isSpot) { setAddPath([p]); return; }
    setAddPath(prev => {
      const prevLast = prev[prev.length - 1];
      if (prevLast) {
        const legIdx = prev.length - 1;
        setSnapping(n => n + 1);
        snapSegment(prevLast, p)
          .then(line => setAddLegs(ls => { const n = [...ls]; n[legIdx] = line; return n; }))
          .finally(() => setSnapping(n => n - 1));
      }
      return [...prev, p];
    });
  };
  const crewMatches = ADD_MEMBERS.filter(m => !addCrew.includes(m.name) && m.name.toLowerCase().includes(crewQuery.trim().toLowerCase()));

  // paddleboard — vyhľadávanie vodnej plochy (Mapy.com Suggest)
  useEffect(() => {
    const q = waterQuery.trim();
    if (q.length < 2 || addForm.water) { setWaterSug([]); return; }
    const t = setTimeout(async () => {
      try {
        const url = `https://api.mapy.com/v1/suggest?query=${encodeURIComponent(q)}&lang=en&limit=6&apikey=${MAPY_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const items: PlaceSug[] = (data.items || [])
          .map((it: { name?: string; label?: string; location?: string; position?: { lat?: number; lon?: number } }) => ({
            name: it.name || '', sub: [it.label, it.location].filter(Boolean).join(' · '),
            lat: it.position?.lat as number, lon: it.position?.lon as number,
          }))
          .filter((x: PlaceSug) => Number.isFinite(x.lat) && Number.isFinite(x.lon));
        setWaterSug(items);
      } catch { setWaterSug([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [waterQuery, addForm.water]);

  const toggleFav = (id: string) => setFavIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const openWalk = (card: Card) => {
    setWalkForm({ date: '', crew: '', km: '', rating: 0 });
    setWalkCard(card);
  };

  const saveWalk = () => {
    if (walkCard) setWalkedIds(prev => new Set(prev).add(walkCard.id));
    setWalkCard(null);
  };

  const browserQueryNorm = browserQuery.trim().toLowerCase();
  const visibleCards = CARDS
    .filter(c => browserQueryNorm === '' || c.name.toLowerCase().includes(browserQueryNorm))
    .filter(c => !browserActivity || (c.activity ?? 'hiking') === browserActivity)
    .filter(c => browserZone === '' || findPohorie(c.pohorie ?? '')?.zone === browserZone)
    .sort((a, b) => (
      browserSort === 'easy' ? (a.diff ? DIFF_ORDER[a.diff] : 99) - (b.diff ? DIFF_ORDER[b.diff] : 99)
      : browserSort === 'short' ? (parseFloat(a.km ?? '') || Infinity) - (parseFloat(b.km ?? '') || Infinity)
      : browserSort === 'pop' ? (b.favCount ?? 0) - (a.favCount ?? 0)
      : (b.stars ?? 0) - (a.stars ?? 0) // rating (default)
    ));
  const myCards = MY_TRAILS[myTab];

  // hero idle zoznam — poradové číslo drží pôvodné 1..12 (sedí s číslom pinu na mape) aj pri filtri
  const heroQueryNorm = heroQuery.trim().toLowerCase();
  const visibleHeroTrails = HERO_TRAILS
    .map((t, i) => ({ t, num: i + 1 }))
    .filter(({ t }) => (heroQueryNorm === '' || t.name.toLowerCase().includes(heroQueryNorm)) && (heroDiff === '' || t.diff === heroDiff));

  return (
    <div className="tv-root">
      <style>{CSS}</style>
      <div className="tv-bg" /><div className="tv-bg2" />

      {/* horný status pruh — REÁLNY pack DevotionHeader 1:1 */}
      <DevotionHeader
        avatarUrl={MATEJ_PHOTO}
        avatarInitial="M"
        devotion={1000022}
        bones={960}
        packTotal={38}
        packToday={1}
        dogs={[{ id: 'hekthor-1', dog_name: 'Hekthor', cloudinary_main_url: HEKTOR_PHOTO }]}
        wide
        onProfile={() => {}}
        onDog={() => {}}
      />

      {/* spodný tab nav — ako pack */}
      <div className="tv-botnav">
        <div className="tv-tab"><img src={navHome} alt="" /><span>Home</span></div>
        <div className="tv-tab active"><img src={navHike} alt="" /><span>Map</span></div>
      </div>

      <div className="tv-wrap">
        <div className="tv-hero">
          {/* LEFT — personalizovaný launcher */}
          <div className="tv-opts">
            <div className="tv-user">
              <div className="tv-ava" style={{ overflow: 'hidden', background: '#1c160c' }}><img src={MATEJ_PHOTO} alt="Matej" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div className="tv-ustats"><span><b>6,174</b> km</span><span><b>238</b> trips</span><span><b>11</b> countries</span></div>
              <div className="tv-uquick">
                <div className="tv-pin" title="My location">📍</div>
                <div className="tv-cty">🇸🇰 SVK ▾</div>
                <div className="tv-qb" title="Settings"><img src={navSettings} alt="" /></div>
              </div>
            </div>

            <div className="tv-topzone">
              {/* Trails/Places prepínač = len na úvodnej karte (výber módu); vo flow ho skryjeme kvôli priestoru */}
              {!addActive && tripStep === 'idle' && (
                <div className="tv-modesw">
                  <button className={`tv-modebtn${cardMode === 'trails' ? ' on' : ''}`} onClick={() => setCardMode('trails')}>Trails</button>
                  <div className="tv-modesoon">
                    <button className="tv-modebtn soon" type="button" aria-disabled="true">Places</button>
                    <span className="tv-soontip">Coming soon</span>
                  </div>
                </div>
              )}

              {cardMode === 'trails' && addActive && !addSent && (
                <div className="tv-steps tv-steps--top">
                  {[{ n: 1, l: 'Basic' }, { n: 2, l: 'Type' }, { n: 3, l: 'Route' }, { n: 4, l: 'Media' }].map(s => (
                    <div key={s.n} className={`tv-step${addStep > s.n ? ' done' : ''}${addStep === s.n ? ' active' : ''}`}>
                      <div className="tv-steplbl">{s.l}</div>
                      <div className="tv-stepbar" />
                    </div>
                  ))}
                </div>
              )}

              {cardMode === 'trails' && !addActive && (tripStep === 'region' || tripStep === 'activity' || tripStep === 'results') && (
                <div className="tv-steps tv-steps--top">
                  {[
                    { key: 'region', l: 'Region' },
                    { key: 'activity', l: 'Activity' },
                    { key: 'trails', l: 'Trails' },
                  ].map(s => {
                    const done =
                      (s.key === 'region' && (tripStep === 'activity' || tripStep === 'results')) ||
                      (s.key === 'activity' && tripStep === 'results');
                    const active = s.key === tripStep || (s.key === 'trails' && tripStep === 'results');
                    return (
                    <div
                      key={s.key}
                      className={`tv-step${done ? ' done' : ''}${active ? ' active' : ''}`}
                    >
                      <div className="tv-steplbl">{s.l}</div>
                      <div className="tv-stepbar" />
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cardMode === 'places' && (
              <div className="tv-center"><div className="tv-placesph">
                <div className="tv-hl" style={{ fontSize: '26px' }}>PLACES</div>
                <p style={{ opacity: .6, fontSize: '13px', maxWidth: 280, margin: '0 auto' }}>Vet clinics · restaurants · hotels · springs · shelters — coming soon.</p>
              </div></div>
            )}

            {cardMode === 'trails' && tripStep === 'idle' && !addActive && (
              <div className="tv-center tv-center--herolist">
                <div className="tv-htr-filterrow">
                  <div className="tv-search">
                    <input
                      value={heroQuery}
                      onChange={e => setHeroQuery(e.target.value)}
                      placeholder="Search trails…"
                    />
                  </div>
                  <div className="tv-htr-diffchips">
                    {(['Easy', 'Moderate', 'Hard'] as const).map(d => (
                      <button
                        key={d}
                        className={`tv-htr-chip${heroDiff === d ? ' on' : ''}`}
                        onClick={() => setHeroDiff(prev => prev === d ? '' : d)}
                      >{d}</button>
                    ))}
                  </div>
                </div>

                <div className="tv-htr-planrow">
                  <div className="tv-htr-plan" onClick={() => setTripStep('region')}>Plan a trip →</div>
                  <div className="tv-htr-addlink" onClick={startAdd}><img src={ICON('plus')} alt="" /> Add a trail</div>
                </div>

                <div className="tv-htr-list">
                  {visibleHeroTrails.map(({ t, num }) => (
                    <div
                      key={t.id}
                      ref={el => { heroCardRefs.current[t.id] = el; }}
                      className={`tv-htr-card${hoverId === t.id || selId === t.id ? ' hot' : ''}`}
                      style={{ borderLeftColor: trailColor(t.id) }}
                      onMouseEnter={() => setHoverId(t.id)}
                      onMouseLeave={() => setHoverId(null)}
                      onClick={() => selectTrail(t)}
                    >
                      <div className="tv-htr-num">{num}</div>
                      <div className="tv-htr-body">
                        <div className="tv-htr-name">{t.name}</div>
                        <div className="tv-htr-meta">
                          <span className="tv-tstar">★ {t.stars}</span>
                          <span>{t.km} km</span>
                          <span>{t.diff}</span>
                        </div>
                      </div>
                      <div className="tv-htr-acts">
                        <button
                          className={`tv-htr-actbtn${walkedIds.has(t.id) ? ' on' : ''}`}
                          title="Mark as walked"
                          onClick={e => { e.stopPropagation(); openWalk({ id: t.id, name: t.name, region: t.region, img: t.id, diff: t.diff, km: t.km, stars: t.stars }); }}
                        >✓</button>
                        <button
                          className={`tv-htr-actbtn${favIds.has(t.id) ? ' on' : ''}`}
                          title="Wishlist"
                          onClick={e => { e.stopPropagation(); toggleFav(t.id); }}
                        >★</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cardMode === 'trails' && tripStep === 'region' && (
              <div className="tv-center tv-center--trip">
                <div className="tv-tripbody">
                  {/* country dropdown = HORE, ľavý kraj bloku (pod REGION indikátorom), menší rámik */}
                  <div className="tv-country">
                    <select className="tv-countrysel" value={tripCountry} onChange={e => { setTripCountry(e.target.value); setTripRegions(new Set()); }}>
                      <option value="Slovakia">🇸🇰 Slovakia</option>
                      <option value="Czechia" disabled>🇨🇿 Czechia — soon</option>
                      <option value="Austria" disabled>🇦🇹 Austria — soon</option>
                      <option value="Switzerland" disabled>🇨🇭 Switzerland — soon</option>
                    </select>
                  </div>
                  <RegionMap country={tripCountry} selected={tripRegions} onToggle={toggleRegion} />
                </div>
                <div className="tv-tripnav">
                  <div className="tv-tripback" onClick={() => setTripStep('idle')}>← Back</div>
                  <div
                    className={`tv-tripnext${tripRegions.size === 0 ? ' disabled' : ''}`}
                    onClick={() => { if (tripRegions.size === 0) return; setTripStep('activity'); }}
                  >Next →</div>
                </div>
              </div>
            )}

            {cardMode === 'trails' && tripStep === 'activity' && (
              <div className="tv-center tv-center--trip">
                <div className="tv-tripbody">
                  <div className="tv-actwrap">
                  <div className="tv-actrows">
                    {/* horný riadok: Hiking (dropdown priamo v pille, nie zvýraznený) + Paddleboard */}
                    <div className="tv-actlist">
                      <div className="tv-actpill tv-actpill--sel">
                        <img src={ICON('walk')} alt="" />
                        <select
                          className="tv-actselinner"
                          value={tripActivity === 'hiking' ? tripDistance : ''}
                          onChange={e => { setTripActivity('hiking'); setTripDistance(e.target.value); }}
                        >
                          <option value="">Hiking</option>
                          {HIKE_DISTANCE.map(d => <option key={d} value={d}>Hiking: {d}</option>)}
                        </select>
                      </div>
                      {TRIP_ACTIVITIES.filter(a => a.id === 'paddleboard').map(a => (
                        <button
                          key={a.id}
                          className={`tv-actpill${tripActivity === a.id ? ' on' : ''}`}
                          onClick={() => { setTripActivity(a.id); setTripDistance(''); }}
                        >
                          <img src={ICON(a.icon)} alt="" /><span>{a.label}</span>
                        </button>
                      ))}
                    </div>
                    {/* dolný riadok: ostatné aktivity */}
                    <div className="tv-actlist">
                      {TRIP_ACTIVITIES.filter(a => ['picnic', 'overnight', 'skating'].includes(a.id)).map(a => (
                        <button
                          key={a.id}
                          className={`tv-actpill${tripActivity === a.id ? ' on' : ''}`}
                          onClick={() => { setTripActivity(a.id); setTripDistance(''); }}
                        >
                          <img src={ICON(a.icon)} alt="" /><span>{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* tagy per-aktivita — centrované, wrap */}
                  {activity && <div className="tv-fade" />}

                  {activity && (
                    <div className="tv-fgroup">
                      <div className="tv-tags tv-tags--center" ref={tagsRef}>
                        {Array.from({ length: Math.ceil(activity.tags.length / 4) }, (_, i) => activity.tags.slice(i * 4, i * 4 + 4)).map((group, gi) => (
                          <div key={gi} className="tv-tagline">
                            {group.map(tname => (
                              <button
                                key={tname}
                                className={`tv-tag${tripTags.has(tname) ? ' on' : ''}`}
                                onClick={() => toggleTag(tname)}
                              ><span className="tv-tagemoji">{TAG_EMOJI[tname]}</span> {tname}</button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
                <div className="tv-tripnav">
                  <div className="tv-tripback" onClick={() => setTripStep('region')}>← Back</div>
                  <div
                    className={`tv-tripnext${!tripActivity ? ' disabled' : ''}`}
                    onClick={() => { if (!tripActivity) return; setShowResults(true); setResultPage(0); setMapTarget(RESULT_CENTER); setTripStep('results'); }}
                  >Show trails →</div>
                </div>
              </div>
            )}

            {cardMode === 'trails' && tripStep === 'results' && (
              <div className="tv-center tv-center--trip">
                <div className="tv-tripbody">
                  {/* 2×2 dlaždice výsledkov; ostatné cez posuvník (mapa vpravo ukazuje všetky naraz) */}
                  <div className="tv-resgrid">
                    {RESULT_TRAILS.slice(resultPage * RESULTS_PER_PAGE, resultPage * RESULTS_PER_PAGE + RESULTS_PER_PAGE).map((t, i) => (
                      <div key={t.name} className="tv-rescard2" onClick={() => setDetailTrail({ id: t.name, name: t.name, km: t.km, stars: t.stars })}>
                        <div className="tv-resbody2">
                          <div className="tv-resname2">{t.name}</div>
                          <div className="tv-resmeta2">
                            <span className="tv-tstar">★ {t.stars}</span><span>{t.km} km</span><span>🐾</span>
                          </div>
                        </div>
                        <div className="tv-resthumb2" style={{ backgroundImage: `url('https://picsum.photos/seed/trail${resultPage * RESULTS_PER_PAGE + i}/80/80')` }} />
                      </div>
                    ))}
                  </div>
                  {resultPages > 1 && (
                    <div className="tv-respager">
                      <button
                        className={`tv-respagearrow${resultPage === 0 ? ' disabled' : ''}`}
                        onClick={() => setResultPage(p => Math.max(0, p - 1))}
                      >‹</button>
                      <div className="tv-respagedots">
                        {Array.from({ length: resultPages }, (_, p) => (
                          <span key={p} className={`tv-respagedot${p === resultPage ? ' on' : ''}`} onClick={() => setResultPage(p)} />
                        ))}
                      </div>
                      <button
                        className={`tv-respagearrow${resultPage >= resultPages - 1 ? ' disabled' : ''}`}
                        onClick={() => setResultPage(p => Math.min(resultPages - 1, p + 1))}
                      >›</button>
                    </div>
                  )}
                </div>
                <div className="tv-tripnav">
                  <div className="tv-tripback" onClick={() => setTripStep('activity')}>← Back</div>
                  <div className="tv-tripcount">{RESULT_TRAILS.length} trails found</div>
                </div>
              </div>
            )}

            {/* ── ADD A TRAIL — v Bloku 1, mapa vpravo (krok 2) ── */}
            {cardMode === 'trails' && addActive && !addSent && (
              <>
                <div className="tv-center tv-center--trip">
                  <div className="tv-tripbody tv-addflow">

                  {/* KROK 1 — Basics: [Name·Date·Country vlajka] · [Region·Member] */}
                  {addStep === 1 && (
                    <>
                      <div className="tv-basrow1">
                        <div className="tv-addfield">
                          <label>Trail name</label>
                          <input className={addForm.name.trim() ? 'tv-fok' : ''} value={addForm.name} onChange={e => setAdd({ name: e.target.value })} placeholder="e.g. Hektor's Path" />
                        </div>
                        <div className="tv-addfield">
                          <label>Date</label>
                          <input className={addForm.date ? 'tv-fok' : ''} type="date" value={addForm.date} onChange={e => setAdd({ date: e.target.value })} />
                        </div>
                        <div className="tv-addfield tv-ctyfield">
                          <label>Country</label>
                          <button ref={ctyBtnRef} className={`tv-ctybtn${addForm.country ? ' tv-fok' : ''}`} onClick={() => setAddCtyOpen(o => !o)}>
                            {(ADD_COUNTRIES.find(c => c.v === addForm.country) || ADD_COUNTRIES[0]).flag}
                            <span className="tv-ctychev">▾</span>
                          </button>
                          {addCtyOpen && ctyBtnRef.current && createPortal(
                            <>
                              <div className="tv-ctybackdrop" onClick={() => setAddCtyOpen(false)} />
                              <div className="tv-ctydrop" style={ctyDropStyle()}>
                                {ADD_COUNTRIES.map(c => (
                                  <div key={c.v} className="tv-ctyrow" onClick={() => { setAdd({ country: c.v, region: '' }); setAddCtyOpen(false); }}>
                                    {c.flag} {c.label}
                                  </div>
                                ))}
                              </div>
                            </>,
                            document.body,
                          )}
                        </div>
                      </div>
                      <div className="tv-basrow2">
                        <div className="tv-addfield">
                          <label>Region</label>
                          <select className={addForm.region ? 'tv-fok' : ''} value={addForm.region} onChange={e => setAdd({ region: e.target.value })}>
                            <option value="">Select a zone</option>
                            <option value="West">West</option>
                            <option value="Center">Center</option>
                            <option value="East">East</option>
                          </select>
                        </div>
                        <div className="tv-addfield" style={{ marginBottom: 0, position: 'relative' }}>
                          <label>Members — who joined you</label>
                          <div className={`tv-crew${addCrew.length ? ' tv-fok' : ''}`} onClick={() => crewInputRef.current?.focus()}>
                            <span className="tv-crewplus">＋</span>
                            {addCrew.map(name => (
                              <span key={name} className="tv-crewchip">{name}<button onClick={e => { e.stopPropagation(); removeCrew(name); }}>×</button></span>
                            ))}
                            <input
                              ref={crewInputRef}
                              className="tv-crewinput"
                              value={crewQuery}
                              placeholder={addCrew.length ? 'Add more…' : 'Add who walked it with you'}
                              onChange={e => { setCrewQuery(e.target.value); setCrewOpen(true); }}
                              onFocus={() => setCrewOpen(true)}
                              onBlur={() => setTimeout(() => setCrewOpen(false), 130)}
                            />
                          </div>
                          {crewOpen && (crewMatches.length > 0 || crewQuery.trim()) && (
                            <div className="tv-crewdrop">
                              {crewMatches.map(m => (
                                <div key={m.id} className="tv-crewrow" onMouseDown={() => addCrewMember(m.name)}>
                                  <div className="tv-crewav">{m.name[0]}</div>
                                  <div>
                                    <div className="tv-crewname">{m.name}{m.pack && <span className="tv-crewtag">your pack</span>}</div>
                                    <div className="tv-crewsub">{m.sub}</div>
                                  </div>
                                </div>
                              ))}
                              {crewQuery.trim() && !ADD_MEMBERS.some(m => m.name.toLowerCase() === crewQuery.trim().toLowerCase()) && (
                                <div className="tv-crewrow" onMouseDown={() => addCrewMember(crewQuery.trim())}>
                                  <div className="tv-crewav">＋</div>
                                  <div className="tv-crewname">Add “{crewQuery.trim()}”</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* KROK 3 — Route: lineárne = trasuj cestu · bodové (paddleboard) = parking + názov */}
                  {addStep === 3 && (isSpot ? (
                    <>
                      <div className="tv-routehow">
                        <div className="tv-routehow-ico"><img src={ICON('water')} alt="" /></div>
                        <div className="tv-routehow-txt">
                          <b>Mark the spot.</b> Tap the map to drop your parking point — use the search box on the map to find the place — then name the lake or water below.
                        </div>
                      </div>

                      <div className={`tv-tracebar${addPath.length ? ' tv-fok' : ''}`}>
                        {addPath.length === 0
                          ? <span className="tv-pthint">Tap the map to drop your parking point</span>
                          : <span className="tv-kmchip tv-kmok">Parking point set ✓</span>}
                        {addPath.length > 0 && <button className="tv-drawundo" onClick={() => { setAddPath([]); setAddLegs([]); }}>Reset</button>}
                      </div>

                      <div className="tv-addfield" style={{ marginTop: 2 }}>
                        <label>Water / place — search or tap the map</label>
                        <div className={`tv-rsearch${addForm.water ? ' tv-fok' : ''}`} ref={waterRef}>
                          <img src={ICON('water')} alt="" />
                          <input
                            value={waterQuery}
                            onChange={e => { setWaterQuery(e.target.value); setAdd({ water: '' }); }}
                            placeholder="Search a place, or use the map search…"
                          />
                        </div>
                        {waterSug.length > 0 && waterRef.current && createPortal(
                          <>
                            <div className="tv-ctybackdrop" onClick={() => setWaterSug([])} />
                            <div className="tv-crewdrop" style={waterDropStyle()}>
                              {waterSug.map((s, i) => (
                                <div
                                  key={i}
                                  className="tv-crewrow"
                                  onMouseDown={() => { setAdd({ water: s.name }); setWaterQuery(s.name); setAddPath([[s.lat, s.lon]]); setMapTarget([s.lat, s.lon]); setWaterSug([]); }}
                                >
                                  <div className="tv-crewav">💧</div>
                                  <div>
                                    <div className="tv-crewname">{s.name}</div>
                                    {s.sub && <div className="tv-crewsub">{s.sub}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>,
                          document.body,
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="tv-routehow">
                        <div className="tv-routehow-ico"><img src={ICON('walk')} alt="" /></div>
                        <div className="tv-routehow-txt">
                          <b>Trace your trail.</b> Find the spot on the map — use the search box on the map to jump there — then tap along the path you walked, point by point (start at your parking, follow the way). More points = more accurate.
                        </div>
                      </div>

                      <div className={`tv-tracebar${addPath.length ? ' tv-fok' : ''}`}>
                        {addPath.length === 0
                          ? <span className="tv-pthint">Tap the map to drop your first point</span>
                          : <span className="tv-kmchip tv-kmok">
                              {addPath.length} point{addPath.length > 1 ? 's' : ''}{snapping > 0 ? ' · snapping…' : ''} · ≈
                              <input
                                className="tv-kminput"
                                type="number" min="0" step="0.1" inputMode="decimal"
                                value={kmManual !== '' ? kmManual : (routeKm != null ? routeKm.toFixed(1) : '')}
                                onChange={e => setKmManual(e.target.value)}
                                title="Auto from your route — tap to correct it"
                              /> km
                              {effKm != null && addForm.type === 'hiking' ? ` · ${kmBucket(effKm)}` : ''}
                            </span>}
                        {addPath.length > 0 && (
                          <div className="tv-drawacts">
                            <button className="tv-drawundo" onClick={() => { setAddPath(p => p.slice(0, -1)); setAddLegs(l => l.slice(0, -1)); }}>Undo</button>
                            <button className="tv-drawundo" onClick={() => { setAddPath([]); setAddLegs([]); setKmManual(''); }}>Clear</button>
                          </div>
                        )}
                      </div>
                      <div className="tv-tracetip">When your trail is traced, press <b>Next →</b> to finish.</div>
                    </>
                  ))}

                  {/* KROK 2 — Type + Tags = zrkadlo GO „Activity": rovnaké rozloženie pillov + per-aktivita tagy.
                      Rozdiel oproti GO: Hiking je bežný pill (vzdialenosť sa neberie ručne — počíta sa z Route km). */}
                  {addStep === 2 && (
                    <div className="tv-actwrap">
                      <div className="tv-actrows">
                        {/* horný riadok: Hiking + Paddleboard */}
                        <div className="tv-actlist">
                          {TRIP_ACTIVITIES.filter(a => a.id === 'hiking' || a.id === 'paddleboard').map(a => (
                            <button
                              key={a.id}
                              className={`tv-actpill${addForm.type === a.id ? ' on' : ''}`}
                              onClick={() => setAdd({ type: a.id })}
                            >
                              <img src={ICON(a.icon)} alt="" /><span>{a.label}</span>
                            </button>
                          ))}
                        </div>
                        {/* dolný riadok: ostatné aktivity */}
                        <div className="tv-actlist">
                          {TRIP_ACTIVITIES.filter(a => ['picnic', 'overnight', 'skating'].includes(a.id)).map(a => (
                            <button
                              key={a.id}
                              className={`tv-actpill${addForm.type === a.id ? ' on' : ''}`}
                              onClick={() => setAdd({ type: a.id })}
                            >
                              <img src={ICON(a.icon)} alt="" /><span>{a.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {addActivity && <div className="tv-fade" />}

                      {/* tagy = presne tie čo daná aktivita má v GO (paddleboard → 2 možnosti; žiadny Reservoir a pod.) */}
                      {addActivity && (
                        <div className="tv-fgroup">
                          <div className="tv-tags tv-tags--center" ref={addTagsRef}>
                            {Array.from({ length: Math.ceil(addActivity.tags.length / 4) }, (_, i) => addActivity.tags.slice(i * 4, i * 4 + 4)).map((group, gi) => (
                              <div key={gi} className="tv-tagline">
                                {group.map(tname => (
                                  <button
                                    key={tname}
                                    className={`tv-tag${addTags.has(tname) ? ' on' : ''}`}
                                    onClick={() => toggleAddTag(tname)}
                                  ><span className="tv-tagemoji">{TAG_EMOJI[tname]}</span> {tname}</button>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* KROK 4 — Media: Notes (full) + [Photo | Rating] */}
                  {addStep === 4 && (
                    <>
                      <div className="tv-addfield" style={{ width: '100%', marginBottom: 0 }}>
                        <label>Route notes <span style={{ textTransform: 'none', letterSpacing: 0, color: 'rgba(31,26,14,0.4)' }}>· optional</span></label>
                        <textarea className={addForm.desc.trim() ? 'tv-fok' : ''} style={{ minHeight: 98 }} value={addForm.desc} onChange={e => setAdd({ desc: e.target.value })} placeholder="Terrain, highlights, dog-friendly spots, warnings…" />
                      </div>

                      <div className="tv-mediagrid">
                        <div className="tv-mediacol">
                          <div className="tv-mediabody">
                            <div className="tv-photorow">
                              <label className={`tv-drop${addPhotos.length ? ' tv-fok' : ''}`}>
                                📷 {addPhotos.length ? `${addPhotos.length} added` : 'Add photos'}
                                <input type="file" accept="image/*" multiple hidden onChange={e => onAddPhotos(e.target.files)} />
                              </label>
                              {addPhotos.slice(0, 2).map((src, i) => (
                                <div key={i} className="tv-photo" style={{ backgroundImage: `url('${src}')` }}>
                                  <button type="button" className="tv-photo-x" aria-label="Remove photo" onClick={() => removeAddPhoto(i)}>✕</button>
                                </div>
                              ))}
                              {addPhotos.length > 2 && (
                                <div className="tv-photo tv-photo-more">+{addPhotos.length - 2}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="tv-mediacol">
                          <div className="tv-mediabody">
                            <div className="tv-ratingrow">
                              <span className="tv-ratinglabel">Rating</span>
                              <div className="tv-addstars">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <button key={n} className={n <= addForm.rating ? 'on' : ''} onClick={() => setAdd({ rating: n })}>★</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="tv-tripnav">
                  {addStep === 1
                    ? <div className="tv-tripback" onClick={closeAdd}>Cancel</div>
                    : <div className="tv-tripback" onClick={() => setAddStep(addStep - 1)}>← Back</div>}
                  {addStep < 4
                    ? <div
                        className={`tv-tripnext${addStep === 1 && !addForm.name.trim() ? ' disabled' : ''}`}
                        onClick={() => { if (addStep === 1 && !addForm.name.trim()) return; setAddStep(addStep + 1); }}
                      >Next →</div>
                    : <div className="tv-tripnext" onClick={() => setAddSent(true)}>Send for review →</div>}
                </div>
              </div>
              </>
            )}

            {/* ADD A TRAIL — success */}
            {cardMode === 'trails' && addActive && addSent && (
              <div className="tv-center">
                <div className="tv-sent">
                  <div className="tv-sentbadge">✓</div>
                  <div className="tv-senth">Sent for review</div>
                  <div className="tv-sentp">
                    {addForm.name ? <>“{addForm.name}” is</> : 'Your trail is'} waiting for review — this may take a few hours.<br />
                    Thank you for helping broaden the horizons.
                  </div>
                  <div className="tv-sentbtn" onClick={closeAdd}>Done</div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — mapa */}
          <div className={`tv-map${addActive && addStep === 3 ? ' drawing' : ''}`}>
            <div className="tv-mapsearch-wrap">
              <div className="tv-mapsearch">
                <img src={ICON('globe')} alt="" />
                <input
                  value={placeQuery}
                  onChange={e => setPlaceQuery(e.target.value)}
                  placeholder="Search a place or trail…"
                />
              </div>
              {placeSug.length > 0 && (
                <div className="tv-mapsug">
                  {placeSug.map((s, i) => (
                    <div
                      key={i}
                      className="tv-mapsug-item"
                      onClick={() => {
                        setMapTarget([s.lat, s.lon]); setPlaceQuery(s.name); setPlaceSug([]);
                        // paddleboard: výber z mapového vyhľadávača nastaví aj vodu + parking bod
                        if (addActive && addStep === 3 && isSpot) { setAdd({ water: s.name }); setWaterQuery(s.name); setAddPath([[s.lat, s.lon]]); }
                      }}
                    >
                      <div className="tv-mapsug-name">{s.name}</div>
                      {s.sub && <div className="tv-mapsug-sub">{s.sub}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <MapContainer center={CENTER} zoom={12} zoomControl={false} attributionControl={false} style={{ width: '100%', height: '100%' }}>
              <TileLayer key={mapStyle} url={mapyTiles(mapStyle)} />
              <ScaleControl position="bottomleft" imperial={false} />
              <FlyTo target={mapTarget} />
              <FitBounds path={heroBounds} />
              {!(addActive && addStep === 3) && <PoiLayer enabled={poiEnabled} onStatus={setPoiStatus} />}
              {addActive && addStep === 3 ? (
                <PickPath drawing={true} path={addPath} line={addLine} onAdd={onMapAdd} />
              ) : (
                <>
                  {tripStep === 'idle' && !addActive && !showResults && (
                    <>
                      {HERO_TRAILS.map(t => (
                        <Polyline
                          key={t.id}
                          positions={t.path}
                          pathOptions={{
                            color: hoverId === t.id || selId === t.id ? '#F5C73D' : trailColor(t.id),
                            weight: hoverId === t.id || selId === t.id ? 5 : 3,
                            opacity: hoverId === t.id || selId === t.id ? 1 : .75,
                          }}
                          eventHandlers={{
                            mouseover: () => setHoverId(t.id),
                            mouseout: () => setHoverId(null),
                            click: () => selectTrail(t),
                          }}
                        />
                      ))}
                      {HERO_TRAILS.map((t, i) => (
                        <Marker
                          key={t.id + ':m'}
                          position={t.path[0]}
                          icon={numIcon(i + 1, trailColor(t.id), hoverId === t.id || selId === t.id)}
                          eventHandlers={{
                            mouseover: () => setHoverId(t.id),
                            mouseout: () => setHoverId(null),
                            click: () => selectTrail(t),
                          }}
                        />
                      ))}
                    </>
                  )}
                  {showResults && RESULT_TRAILS.map(t => (
                    <Marker key={t.name} position={t.pos} icon={placeIcon('walk', true)}>
                      <Tooltip permanent direction="top" offset={[0, -18]} className="tv-trailtip">
                        <div className="tv-tt">
                          <img className="tv-tt-paw" src={ICON('paw')} alt="" />
                          <div>
                            <div className="tv-tt-name">{t.name}</div>
                            <div className="tv-tt-meta">{t.km} km · <span className="tv-tt-star">★ {t.stars}</span></div>
                          </div>
                        </div>
                      </Tooltip>
                    </Marker>
                  ))}
                </>
              )}
            </MapContainer>

            {/* Ovládací panel na mape: štýl podkladu + POI vrstvy */}
            <div className="tv-mapctl">
              <div className="tv-mapstyle">
                {([['outdoor', 'Terrain'], ['aerial', 'Satellite'], ['winter', 'Winter']] as const).map(([v, l]) => (
                  <button key={v} className={mapStyle === v ? 'on' : ''} onClick={() => setMapStyle(v)}>{l}</button>
                ))}
              </div>
              <div className="tv-poictl">
                <button className={`tv-poibtn${poiPanel ? ' open' : ''}`} onClick={() => setPoiPanel(p => !p)}>
                  ⌖ Map points
                  <span className="tv-poistat">
                    {poiStatus.loading ? '…'
                      : poiStatus.error ? '⚠'
                      : poiStatus.lowzoom ? '🔍+'
                      : typeof poiStatus.count === 'number' ? poiStatus.count
                      : ''}
                  </span>
                </button>
                {poiPanel && (
                  <div className="tv-poipanel">
                    {POI_KINDS.map(k => (
                      <label key={k.key} className="tv-poitog">
                        <input type="checkbox" checked={poiEnabled[k.key]} onChange={() => setPoiEnabled(p => ({ ...p, [k.key]: !p[k.key] }))} />
                        <span className="tv-poiemoji">{k.emoji}</span> {k.label}
                      </label>
                    ))}
                    <div className="tv-poihint">
                      {poiStatus.loading ? 'Loading points from OSM…'
                        : poiStatus.error ? "Overpass server didn't respond — try panning the map (trying 3 servers)."
                        : poiStatus.lowzoom ? 'Zoom to level 11+ to load points.'
                        : `${poiStatus.count ?? 0} points in view · source OpenStreetMap`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="tv-attr">
              <a href="https://mapy.com" target="_blank" rel="noopener noreferrer"><img src="https://api.mapy.com/img/api/logo.svg" alt="Mapy.com" style={{ height: 13, display: 'block' }} /></a>
              <span>© Seznam.cz a.s.</span>
            </div>
          </div>
        </div>

        {/* BLOK 3 — prehliadač výletov */}
        <div className="tv-sec">
         <div className="tv-panel">
          <div className="tv-sech">
            <div className="tv-sect">Trail browser</div>
            <div className="tv-secl">All trails →</div>
          </div>

          <div className="tv-b3ctrl">
            {/* a — search */}
            <input
              className="tv-b3search"
              type="text"
              placeholder="Search trails…"
              value={browserQuery}
              onChange={e => { setBrowserQuery(e.target.value); setPage(1); }}
            />

            {/* b — territory zone dropdown: Whole territory / West / Central / East */}
            <select
              className="tv-countrysel tv-b3sel"
              value={browserZone}
              onChange={e => { setBrowserZone(e.target.value as '' | Zone); setPage(1); }}
            >
              <option value="">Whole territory</option>
              <option value="W">West</option>
              <option value="C">Central</option>
              <option value="E">East</option>
            </select>

            {/* c — activity dropdown (emoji + TRIP_ACTIVITIES, shared with Go-on-a-trip flow) */}
            <select
              className="tv-countrysel tv-b3sel"
              value={browserActivity}
              onChange={e => { setBrowserActivity(e.target.value); setPage(1); }}
            >
              <option value="">All activities</option>
              {TRIP_ACTIVITIES.map(a => (
                <option key={a.id} value={a.id}>{ACT_EMOJI[a.id]} {a.label}</option>
              ))}
            </select>

            {/* d — sort dropdown */}
            <select
              className="tv-countrysel tv-b3sel"
              value={browserSort}
              onChange={e => { setBrowserSort(e.target.value as 'rating' | 'easy' | 'short' | 'pop'); setPage(1); }}
            >
              {SORT_OPTS.map(s => (
                <option key={s.v} value={s.v}>{s.l}</option>
              ))}
            </select>
          </div>

          <div className="tv-grid">
            {visibleCards.map(c => (
              <TrailCard
                key={c.id}
                card={c}
                fav={favIds.has(c.id)}
                walked={walkedIds.has(c.id)}
                onToggleFav={toggleFav}
                onOpenWalk={openWalk}
                onOpen={openTrailDetail}
              />
            ))}
          </div>

          <div className="tv-pagerow">
            <div className="tv-pshow">
              Show:
              {PERPAGE_OPTS.map(n => (
                <button
                  key={n}
                  className={`tv-pshowbtn${perPage === n ? ' active' : ''}`}
                  onClick={() => setPerPage(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="tv-pnum">
              {[1, 2, 3].map(n => (
                <button key={n} className={page === n ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
              ))}
            </div>
          </div>
         </div>
        </div>

        {/* BLOK 4 — moje trasy */}
        <div className="tv-sec">
         <div className="tv-panel">
          <div className="tv-sech">
            <div className="tv-sect">My trails</div>
          </div>

          <div className="tv-seg">
            <div className={`tv-segbtn${myTab === 'wishlist' ? ' active' : ''}`} onClick={() => setMyTab('wishlist')}>Wishlist</div>
            <div className={`tv-segbtn${myTab === 'prejdene' ? ' active' : ''}`} onClick={() => setMyTab('prejdene')}>Walked</div>
            <div className={`tv-segbtn${myTab === 'oblubene' ? ' active' : ''}`} onClick={() => setMyTab('oblubene')}>Favorites</div>
          </div>

          <div className="tv-grid">
            {myCards.map(c => (
              <TrailCard
                key={c.id}
                card={c}
                fav={favIds.has(c.id) || myTab === 'oblubene'}
                walked={walkedIds.has(c.id) || myTab === 'prejdene'}
                onToggleFav={toggleFav}
                onOpenWalk={openWalk}
                onOpen={openTrailDetail}
                heartCount={myTab === 'oblubene' ? (c as Card & { heartCount?: number }).heartCount : undefined}
              />
            ))}
          </div>
         </div>
        </div>

        {/* BLOK 5 — rebríčky */}
        <div className="tv-sec">
          <div className="tv-sech">
            <div className="tv-sect"><img src={ICON('trophy')} alt="" /> Rankings</div>
          </div>

          <div className="tv-rankgrid">
            <div className="tv-rankcard">
              <div className="tv-rankh">Trail ranking</div>
              {RANK_TRAILS.map((r, i) => (
                <div key={r.name} className="tv-rankrow">
                  <div className="tv-ranknum">{i + 1}.</div>
                  <div className="tv-rankname">{r.name}</div>
                  <div className="tv-rankmeta">★ {r.stars} · {r.visits} visits</div>
                </div>
              ))}
            </div>
            <div className="tv-rankcard">
              <div className="tv-rankh">People ranking</div>
              {RANK_PEOPLE.map((r, i) => (
                <div key={r.name} className="tv-rankrow">
                  <div className="tv-ranknum">{i + 1}.</div>
                  <div className="tv-rankname">{r.name}</div>
                  <div className="tv-rankmeta">{r.km} km · {r.places} places</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BLOK 6 — eventy */}
        <div className="tv-sec">
          <div className="tv-sech">
            <div className="tv-sect"><img src={ICON('clipboard')} alt="" /> Events</div>
          </div>

          <div className="tv-evgrid">
            {EVENTS.map(ev => (
              <div key={ev.title} className="tv-evcard">
                <div className="tv-evname">{ev.title}</div>
                <div className="tv-evmeta">{ev.date}<br />{ev.place}</div>
                <div className="tv-evbtn" onClick={() => setEventOpen(ev)}>Detail</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL — prešiel som */}
      {walkCard && (
        <div className="tv-overlay" onClick={() => setWalkCard(null)}>
          <div className="tv-modal" onClick={e => e.stopPropagation()}>
            <button className="tv-mclose" onClick={() => setWalkCard(null)}>×</button>
            <div className="tv-mtitle">Mark as walked</div>
            <div className="tv-msub">{walkCard.name}</div>

            <div className="tv-mfield">
              <label>Date</label>
              <input type="date" value={walkForm.date} onChange={e => setWalkForm({ ...walkForm, date: e.target.value })} />
            </div>
            <div className="tv-mfield">
              <label>Crew (who joined)</label>
              <input type="text" placeholder="e.g. Hektor, Zuzka…" value={walkForm.crew} onChange={e => setWalkForm({ ...walkForm, crew: e.target.value })} />
            </div>
            <div className="tv-mfield">
              <label>Km</label>
              <input type="number" placeholder={walkCard.km} value={walkForm.km} onChange={e => setWalkForm({ ...walkForm, km: e.target.value })} />
            </div>
            <div className="tv-mfield">
              <label>Rating</label>
              <div className="tv-mstars">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} className={n <= walkForm.rating ? 'on' : ''} onClick={() => setWalkForm({ ...walkForm, rating: n })}>★</button>
                ))}
              </div>
            </div>

            <div className="tv-msave" onClick={saveWalk}>Save</div>
          </div>
        </div>
      )}

      {/* MODAL — event detail */}
      {eventOpen && (
        <div className="tv-overlay" onClick={() => setEventOpen(null)}>
          <div className="tv-modal" onClick={e => e.stopPropagation()}>
            <button className="tv-mclose" onClick={() => setEventOpen(null)}>×</button>
            <div className="tv-mtitle">{eventOpen.title}</div>
            <div className="tv-msub">{eventOpen.date} · {eventOpen.place}</div>
            <a className="tv-mlink" href={eventOpen.link} target="_blank" rel="noopener noreferrer">View event</a>
          </div>
        </div>
      )}

      {/* POPUP — detail výletu (vzorový): blok text | mapa (mobil stacked, text hore) */}
      {detailTrail && (
        <div className="tv-detoverlay" onClick={() => setDetailTrail(null)}>
          <div className="tv-detcard" onClick={e => e.stopPropagation()}>
            <button className="tv-detclose" onClick={() => setDetailTrail(null)}>×</button>
            <div className="tv-detcols">
              {/* ĽAVÁ — text + detaily trasy */}
              <div className="tv-detleft">
                <div className="tv-detailscroll">
                  <div className="tv-detheadtxt">
                    <div className="tv-detname">{detailTrail.name}</div>
                    <div className="tv-detregion">{detailTrail.hero ? detailTrail.hero.region : `${SAMPLE_TRIP.region} · ${SAMPLE_TRIP.date}`}</div>
                  </div>

                  <div className="tv-detstats">
                    {detailTrail.km && <div className="tv-detstat"><b>{detailTrail.km} km</b><span>Distance</span></div>}
                    <div className="tv-detstat"><b>↑{SAMPLE_TRIP.ascent}<span className="tv-detm"> m</span></b><span>Ascent</span></div>
                    <div className="tv-detstat"><b>{SAMPLE_TRIP.duration}</b><span>Time</span></div>
                    <div className="tv-detstat"><b>{detailTrail.hero ? detailTrail.hero.diff : SAMPLE_TRIP.difficulty}</b><span>Difficulty</span></div>
                  </div>

                  <div className="tv-detchips">
                    <span className="tv-detact"><img src={ICON('walk')} alt="" />{detailTrail.hero ? 'Hiking' : SAMPLE_TRIP.activity}</span>
                    {(detailTrail.hero ? detailTrail.hero.seasons : SAMPLE_TRIP.tags).map(tg => <span key={tg} className="tv-dettag">{tg}</span>)}
                  </div>

                  {!detailTrail.hero && (
                    <div className="tv-detcrew">
                      <span className="tv-detlbl">Who joined</span>
                      <div className="tv-detcrewrow">
                        {SAMPLE_TRIP.crew.map(c => <span key={c} className="tv-detcrewchip"><span className="tv-detcrewav">{c[0]}</span>{c}</span>)}
                      </div>
                    </div>
                  )}

                  <p className="tv-detnotes">{detailTrail.hero ? detailTrail.hero.desc : SAMPLE_TRIP.notes}</p>
                  {detailTrail.hero?.dogNote && <p className="tv-detnotes">🐾 {detailTrail.hero.dogNote}</p>}

                  <div className="tv-detphotos">
                    {(detailTrail.hero ? detailTrail.hero.photos : SAMPLE_TRIP.photos).map((p, i) => <div key={i} className="tv-detphoto" style={{ backgroundImage: `url('${p}')` }} />)}
                  </div>

                  <div className="tv-detrating">
                    <div className="tv-detratehead">
                      {detailTrail.stars != null && <span className="tv-detrateavg">★ {detailTrail.stars}</span>}
                      {!detailTrail.hero && <span className="tv-detratecount">{SAMPLE_TRIP.ratingCount} ratings</span>}
                    </div>
                    {!detailTrail.hero && SAMPLE_TRIP.reviews.map((r, i) => (
                      <div key={i} className="tv-detreview">
                        <div className="tv-detreviewhead"><b>{r.who}</b><span className="tv-detreviewstars">{'★'.repeat(r.stars)}</span></div>
                        <div className="tv-detreviewtxt">{r.text}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* akcie — wishlist (primárne) + prejdené (sekundárne) */}
                <div className="tv-detactions">
                  <button
                    className={`tv-detbtn tv-detbtn--primary${favIds.has(detailTrail.id) ? ' on' : ''}`}
                    onClick={() => toggleFav(detailTrail.id)}
                  >{favIds.has(detailTrail.id) ? '♥ In wishlist' : '♡ Add to wishlist'}</button>
                  <button
                    className={`tv-detbtn tv-detbtn--ghost${walkedIds.has(detailTrail.id) ? ' on' : ''}`}
                    onClick={() => toggleWalked(detailTrail.id)}
                  >{walkedIds.has(detailTrail.id) ? '🐾 Walked ✓' : '🐾 Mark as walked'}</button>
                </div>
              </div>

              {/* PRAVÁ — mapa trasy */}
              <div className="tv-detright">
                <MapContainer
                  center={detailTrail.hero ? detailTrail.hero.path[Math.floor(detailTrail.hero.path.length / 2)] : SAMPLE_ROUTE[2]}
                  zoom={13} zoomControl={false} attributionControl={false} style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer key={mapStyle} url={mapyTiles(mapStyle)} />
                  <Polyline positions={detailTrail.hero ? detailTrail.hero.path : SAMPLE_TRIP.route} pathOptions={{ color: GOLD, weight: 5, opacity: 0.95 }} />
                  <Marker position={detailTrail.hero ? detailTrail.hero.path[0] : SAMPLE_ROUTE[0]} icon={placeIcon('walk', true)} />
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
