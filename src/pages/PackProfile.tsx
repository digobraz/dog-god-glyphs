import { useEffect, useRef, useState } from 'react';
import { DeleteRequests } from '@/components/pack/DeleteRequests';
import { canStepBack } from '@/lib/stepBack';
import { pilgrimAuthorName } from '@/lib/pilgrimName';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PackSettings, Field } from '@/components/pack/PackSettings';
import { usePackUser, type PackDogFull } from '@/hooks/usePackUser';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePilgrimStats } from '@/components/pack/usePilgrimStats';
import { devotionLevel } from '@/lib/devotion';
import { PACK_THEME, PACK_BOX, PACK_HEAD, PACK_TEXT, PACK_SPACE, PACK_R, PACK_SHADOW, PF_FIELD_CSS, PILL_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { ME_CSS, ME_FLAT_CSS, DOG_FONT, MeCover, MeOwn, MeRank, MeFlag } from '@/components/pack/profile/meHead';
import { RANK_BADGE_ON, useServantYears } from '@/components/pack/profile/rankBadge';
import { uploadAvatarPhoto, uploadCoverPhoto, sizedUrl } from '@/services/cloudinaryService';
import { compressFile } from '@/lib/photoIntake';
import { coverAlbumOf, coverOfDay, changeDogMainPhoto, fetchMyPosts, isMoment, isLive } from '@/components/pack/profile/mePosts';
import { CoverSheet } from '@/components/pack/profile/CoverSheet';
import { DevotionSheet } from '@/components/pack/profile/DevotionSheet';
import { useToast } from '@/hooks/use-toast';
import { useT, useLang } from '@/i18n/LanguageContext';
import { countryLabel, countryOptions, normalizeCountryValue, COUNTRY_OTHER } from '@/lib/countryOptions';
import { flagEmojiFromISO2, iso2ToISO3 } from '@/lib/countryGeo';
import { STORIES_ON, PAWMATE_LIVE, APP_NEW } from '@/lib/packFlags';
import { TEST_BUILD } from '@/lib/env';
import {
  PAWMATE_RIGHTS, RIGHT_LABEL, invitePawmate, listMyPawmates, revokePawmate, revokeDogInvite, setPawmateAccess, setPawmateSuccessor,
  type MyPawmates, type PawmateRow, type PawmateRight, type PawmateRole,
} from '@/lib/pawmateRights';
import { appWebVersion } from '@/lib/appUpdate';
import { openAinubis } from '@/lib/ainubisBus';
import { createWill, listMyWills, revokeWill, type WillRow } from '@/lib/willAccess';
import { APP_PLATFORM } from '@/lib/isApp';
import {
  useProfile,
  saveHuman,
  saveAvatarUrl,
  saveDisplayName,
  type HumanProfile,
  type TaxonomyOption,
  type RelationshipStatus,
  type PersonalityTag,
  type CentralProfile,
  RELATIONSHIP_OPTIONS,
  DIET_OPTIONS,
  SMOKE_OPTIONS,
  WORK_OPTIONS,
  PERSONALITY_OPTIONS,
  MAX_PERSONALITY,
  HIDEABLE_IDENTITY_FIELDS,
  isHidden,
  customPills,
  ROLE_GROUPS,
  ROLE_EMOJI,
  MAX_ROLES,
  profileRoles,
  roleLabels,
  saveDogAttrs,
  DOG_TEMPERAMENT_TAGS,
  type ProfileRole,
  type DogProfileAttrs,
  type DogTemperamentTag,
  type ProfileFieldKey,
} from '@/components/pack/profile/packProfile';
import { HandCamera } from '@/components/pack/HandIcons';
import { MisiaBody, MISIA_ON } from '@/components/pack/profile/MisiaGroup';
import { useBeside, type Beside } from '@/components/pack/profile/profileMates';

const T = PACK_THEME;
const S = PACK_SPACE;
/** Tlačidlo v riadku ÚČTU — ten istý tvar ako ODHLÁSIŤ SA v `PackSettings`. */
const ROW_BTN: React.CSSProperties = {
  background: 'none', border: `1px solid ${T.border}`, borderRadius: PACK_R.field, padding: `${S.sm}px ${S.lg}px`,
  fontFamily: FONT_UI, fontWeight: 500, fontSize: PACK_TEXT.micro, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.inkDim, cursor: 'pointer',
};

// ── RIADKY PROFILU (21. 10. 2026) ── štítok vľavo · hodnota vpravo · tenká čiara, ako úprava
// profilu na Instagrame. Ovládače ostávajú `.pf-field` (pilulky, selecty), tu im padá rám aj výplň.
const ROWS_CSS = `
.pf-rows{display:flex;flex-direction:column;}
.pf-row{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.md}px;min-height:44px;border-bottom:1px solid ${T.hairline};color:inherit;}
.pf-rows > .pf-row:last-child,.pf-rows > :last-child > .pf-row{border-bottom:none;}
.pf-row-lbl{flex:0 0 auto;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};}
.pf-row.is-shown .pf-row-lbl{color:${LAPIS.edge};font-weight:700;}
.pf-row > :not(.pf-row-lbl){flex:1 1 auto;min-width:0;display:flex;justify-content:flex-end;}
.pf-row-txt{align-items:center;gap:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.body}px;color:${T.ink};}
.pf-rows .pf-field{background:none !important;border-color:transparent !important;box-shadow:none !important;text-align:right;text-align-last:right;font-size:${PACK_TEXT.body}px !important;padding-right:0 !important;}
.pf-rows .pf-field input{text-align:right;font-size:${PACK_TEXT.body}px !important;}
.pf-rows .pf-field:focus,.pf-rows .pf-field:focus-within{box-shadow:inset 0 -2px 0 ${LAPIS.edge} !important;}
.pf-rows .pf-field:not(.pf-selchip) > span[aria-hidden]{display:none;}
.pf-row--toggle .pf-row-lbl{text-align:left;}
.pf-rows .pf-field{justify-content:flex-end;}
.pf-rows .pf-field input{width:100% !important;}
/* Tri voľby sa vedľa štítku na mobile nezmestia — prepínač ide pod štítok cez celú šírku. */
.pf-row--toggle{flex-direction:column;align-items:stretch;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.md}px 0;}
.pf-row--toggle > .pf-toggle{justify-content:stretch;width:100%;}
.pf-row--toggle .pf-toggle__opt{flex:1 1 0;}
.pf-rows-ttl{display:flex;align-items:center;justify-content:space-between;margin-top:${PACK_SPACE.lg}px;font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};}
.pf-rows-ttl:first-child{margin-top:0;}
.pf-rows-ttl i{font-style:normal;letter-spacing:.02em;text-transform:none;}
`;

// ── UPRAVIŤ PROFIL = TÁ ISTÁ KARTA AKO PROFIL (23. 10. 2026) ─────────────────────────────
// Matej: *„nepáči sa mi to, že to je úplne iný layout = rozchádzajú sa nám štýly, majme jeden =
// pozadie a blok nad tým v tých istých šírkach … daj náhľad ako bude v realite = meno gradient
// atď … nech to má človek 1:1 … urobme to na sekcie: 1. o mne … hneď k dispozícii, nie schované,
// 2. SVORKA … psy a ľudia, 2 riadky … 3. účet"*. Prebíja v8 „po riadkoch, ťuk = pole na celú
// obrazovku" z tej istej noci.
//
// • Tapeta + KARTA = `PackLayout` + `.me-card`, presne ako `/pack/profile` (šírka `PACK_COL`).
// • HLAVA = `MeCover` + `MeOwn` z `meHead.tsx` — ten istý kód, aký kreslí profil. Meno sa
//   v náhľade mení pri písaní; titulka sa ŤAHÁ prstom (`human.coverY`), ťuk na foťák = zmeniť.
// • Tri optické skupiny = PODBLOKY (`PACK_BOX.subblock`): O MNE · SVORKA · ÚČET. Všetky polia
//   sú otvorené — nič sa neskrýva za ďalší ťuk. Ukladá sa samo (blur / ťuk).
// 🔴 Psy sa tu NEUPRAVUJÚ: kruh psa vedie do DOG ID (bio a povaha psa majú jeden zdroj).
// 🔴 BONES a línia sú v šuplíku MISIA na profile (`BonesSheet`) — staré `#network` sa tam vracia.
// ⚠️ Priehľadný kruh „osoba +" v rade ĽUDIA = miesto pre PAWTNERA. Pozvanie ďalšieho ČLOVEKA
//    k psovi NEEXISTUJE (lock pack-blok1-nav) — kruh je bez textu a ťuk povie len „pripravujeme".
const EDIT_CSS = `
.pe-card .me-under{ padding-bottom:${S.lg}px; }
.pe-cam{display:grid;place-items:center;width:32px;height:32px;border-radius:${PACK_R.pill}px;border:2px solid ${T.card};cursor:pointer;padding:0;
  background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};color:${LAPIS.ink};}
.pe-tr{display:flex;align-items:center;gap:${S.sm}px;}
.pe-drag{display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;pointer-events:none;
  background:color-mix(in srgb, ${T.pageBg} 55%, transparent);color:${T.card};font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;}
.pe-own-cam{position:absolute;right:0;bottom:${S.sm}px;z-index:4;}
.pe-grp{margin-top:${S.lg}px;padding:${S.lg}px;}
.pe-gh{display:flex;align-items:center;justify-content:space-between;gap:${S.sm}px;margin-bottom:${S.md}px;color:${T.inkDim};}
.pe-gh .pk-pill{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;padding:${S.xs}px ${S.md}px;}
.pe-lbl{display:block;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};margin:${S.lg}px 0 ${S.sm}px;}
.pe-show{display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  background:transparent;border:1.5px solid ${LAPIS.edge};color:${LAPIS.edge};font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;}
.pe-show:hover{background:${LAPIS.fill};}
.pe-line{display:flex;flex-wrap:wrap;gap:${S.md}px ${S.lg}px;}
.pe-mem{display:inline-flex;align-items:center;gap:${S.sm}px;border:0;background:none;padding:0;cursor:pointer;color:inherit;text-align:left;min-width:0;}
/* Bez obruče story (Matej 26. 10. 2026: *„sú tam kruhy story, daj to preč"*) — tenký rám ako psy na oblúku profilu. */
.pe-mem .c{flex:none;width:48px;height:48px;border-radius:${PACK_R.pill}px;padding:0;background:${T.card};box-shadow:0 0 0 2px ${T.border}, ${PACK_SHADOW.card};}
.pe-mem .c img,.pe-mem .c i{width:100%;height:100%;border-radius:${PACK_R.pill}px;object-fit:cover;display:grid;place-items:center;border:2px solid ${T.card};background:${T.card};
  font-style:normal;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.lead}px;color:${T.inkWarm};}
.pe-mem b{display:block;font-family:${DOG_FONT};font-weight:700;font-size:${PACK_TEXT.body}px;color:${T.inkStrong};white-space:nowrap;}
.pe-mem.hu b{font-family:${FONT_TITLE};letter-spacing:.02em;}
.pe-mem small{display:block;font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;color:${T.inkWarm};letter-spacing:.14em;text-transform:uppercase;}
.pe-num{display:inline-flex;align-items:center;margin-left:${S.xs}px;background:${LAPIS.grad};color:${LAPIS.ink};font-family:${FONT_UI};font-weight:600;
  font-size:${PACK_TEXT.micro}px;letter-spacing:.02em;padding:0 ${S.sm}px;border-radius:${PACK_R.pill}px;vertical-align:middle;}
.pe-ghost .c{background:transparent;box-shadow:none;border:1.5px dashed ${LAPIS.edge};opacity:.55;display:grid;place-items:center;padding:0;}
.pe-ghost:hover .c{opacity:.85;}
.pe-ghost .c img{width:auto;height:auto;border:0;background:none;border-radius:0;}
/* MENÁ — riadok = krúžok (zobraziť) · štítok · pole bez rámu. Jemné, žiadna veľká pilulka. */
.pe-names{display:flex;flex-direction:column;}
.pe-nm{display:grid;grid-template-columns:18px 104px minmax(0,1fr);align-items:center;gap:${S.sm}px;min-height:40px;border-bottom:1px solid ${T.hairline};}
.pe-nl{font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};white-space:nowrap;}
.pe-nm.on .pe-nl{color:${LAPIS.edge};}
.pe-nm input{width:100%;min-width:0;border:0;background:none;outline:none;padding:${S.sm}px 0;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.pe-nm input:focus{box-shadow:inset 0 -2px 0 ${LAPIS.edge};}
.pe-nm input::placeholder{color:${T.inkFaint};}
.pe-nm em{font-style:normal;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkDim};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pe-nm.lock{border-bottom:0;}
.pe-dot{width:16px;height:16px;border-radius:${PACK_R.pill}px;border:1.5px solid ${T.border};background:transparent;padding:0;cursor:pointer;display:grid;place-items:center;}
.pe-nm.on .pe-dot{border-color:${LAPIS.edge};background:radial-gradient(circle, ${LAPIS.edge} 0 4px, transparent 5px);}
.pe-nm.lock .pe-dot{border:0;cursor:default;}
.pe-hint{margin:${S.xs}px 0 0;font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;color:${T.inkFaint};}
/* POVAHA — všetky pilulky v TROCH radoch, ťahá sa do strany; vybraté a vlastné idú prvé. */
.pe-pills-h{display:flex;justify-content:space-between;align-items:center;margin:${S.lg}px 0 ${S.sm}px;}
.pe-min{font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;color:${T.alertRed};}
.pe-pills{display:grid;grid-template-rows:repeat(3,auto);grid-auto-flow:column;grid-auto-columns:max-content;justify-items:start;gap:6px;
  overflow-x:auto;scrollbar-width:none;margin-right:-${S.lg}px;padding:0 ${S.lg}px 2px 0;}
.pe-pills::-webkit-scrollbar{display:none;}
.pe-pills .pf-pill,.pe-pills .pe-own{white-space:nowrap;}
.pe-own{display:inline-flex;align-items:center;gap:${S.xs}px;border-radius:${PACK_R.pill}px;padding:${S.xs}px ${S.sm}px;cursor:pointer;
  background:transparent;border:1px dashed ${LAPIS.edge};color:${LAPIS.edge};font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;}
.pe-own input{width:96px;border:0;outline:none;background:none;font:inherit;color:${T.ink};padding:0;}
/* MENÁ | BIO — na PC vedľa seba. */
.pe-duo{display:grid;grid-template-columns:minmax(0,1fr);gap:${S.md}px;}
.pe-bio textarea{min-height:100%;}
/* FAKTY — tri riadky rovnakej šírky, polia ako linky (nie pilulky). */
.pe-facts{display:flex;flex-direction:column;gap:${S.xs}px;margin-top:${S.lg}px;}
.pe-fr{display:grid;width:100%;align-items:end;gap:${S.md}px;}
.pe-fr.r1{grid-template-columns:auto auto minmax(0,1fr) auto;}
.pe-fr.r2{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
.pe-fr > *{min-width:0;}
.pe-fr .pf-field{width:100% !important;min-height:0 !important;justify-content:space-between;background:none !important;border:0 !important;border-bottom:1px solid ${T.hairline} !important;
  box-shadow:none !important;border-radius:0 !important;padding:${S.sm}px 0 !important;font-size:${PACK_TEXT.body}px !important;text-align:left !important;text-align-last:left !important;}
.pe-fr .pf-field:focus,.pe-fr .pf-field:focus-within{border-bottom-color:${LAPIS.edge} !important;}
.pe-fr .pf-field input{font-size:${PACK_TEXT.body}px !important;width:100% !important;}
.pe-fr.r1 > :nth-child(3) .pf-field input{width:100% !important;}
/* MOJA SVORKA — rámik = úzky kruh (ja + psy), pod ním šípka k voliteľnému pawmatovi. */
/* Členovia stoja ROVNO v bloku MOJA SVORKA, nie vo vnorenom rámiku (Matej 23. 10.: „moc úzky obsah“). */
.pe-core{}
.pe-me{display:flex;align-items:center;justify-content:space-between;gap:${S.sm}px;padding:${S.sm}px 0;}
.pe-role{position:relative;display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;
  background:${T.tileBg};border:1px solid ${T.cardEdge};color:${T.inkStrong};font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;}
.pe-role select{appearance:none;-webkit-appearance:none;border:0;background:none;font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;cursor:pointer;padding:0;outline:none;}
.pe-dog + .pe-dog{border-top:1px solid ${T.hairline};}
.pe-dog-h{display:flex;align-items:center;gap:${S.sm}px;width:100%;padding:${S.sm}px 0;border:0;background:none;cursor:pointer;text-align:left;color:inherit;}
/* Riadok s pilulkou vpravo (JA): hlavička = dva ťuky (meno · šípka) a pilulka medzi nimi — tlačidlo v tlačidle nejde. */
.pe-dog-row{display:flex;align-items:center;gap:${S.sm}px;}
.pe-dog-row > .pe-dog-h{flex:1;min-width:0;width:auto;}
.pe-dog-row > .pe-chev{flex:none;display:grid;place-items:center;width:${S.xl}px;height:${S.xl}px;padding:0;border:0;background:none;cursor:pointer;color:${T.inkDim};transition:transform .25s ease;}
.pe-dog.open .pe-dog-row > .pe-chev{transform:rotate(180deg);}
.pe-dog-h .pe-mem{pointer-events:none;flex:1;}
.pe-dog-h > i{display:grid;place-items:center;transition:transform .25s ease;color:${T.inkDim};}
.pe-dog.open .pe-dog-h > i{transform:rotate(180deg);}
.pe-dog-b{padding:0 0 ${S.md}px;display:flex;flex-direction:column;gap:${S.sm}px;}
.pe-dog-tags{display:flex;flex-wrap:wrap;gap:6px;}
.pe-link{align-self:flex-start;display:inline-flex;align-items:center;gap:${S.xs}px;border:0;background:none;padding:${S.xs}px 0;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;color:${LAPIS.edge};}
.pe-check input:disabled{opacity:.4;cursor:default;}
.pe-pick{display:grid;grid-template-columns:1fr;gap:${S.sm}px;}
.pe-pick.two{grid-template-columns:1fr 1fr;}
.pe-sec{margin:${S.sm}px 0 0;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};}
.pe-rolebox{display:flex;flex-direction:column;gap:${S.sm}px;}
.pe-rgrp{display:flex;flex-direction:column;gap:${S.xs}px;margin-top:${S.xs}px;}
.pe-rgrp > b{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};}
.pe-add{display:flex;flex-direction:column;gap:${S.sm}px;margin-top:${S.md}px;}
.pe-addbtn{display:flex;align-items:center;justify-content:center;gap:${S.sm}px;width:100%;padding:${S.md}px ${S.lg}px;border-radius:${PACK_R.field}px;cursor:pointer;
  background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;}
.pe-door.pe-door2{flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:${S.xs}px;text-align:left;padding:${S.md}px;}
@media (min-width:768px){.pe-add .pe-pick{grid-template-columns:1fr 1fr;}}
.pe-door2 > span{display:inline-flex;align-items:center;gap:${S.sm}px;}
.pe-door2 small{font-size:${PACK_TEXT.label}px;letter-spacing:0;text-transform:none;font-weight:400;color:${T.inkDim};line-height:1.4;}
.pe-door2.on small{color:${LAPIS.ink};}
.pe-warn{margin:0;padding:${S.sm}px ${S.md}px;border-radius:${PACK_R.tile}px;background:${T.tileBg};border:1px solid ${T.hairline};font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.5;color:${T.ink};}
.pe-steps{margin:${S.xs}px 0 0;padding-left:${S.lg}px;list-style:decimal;display:flex;flex-direction:column;gap:${S.xs}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.5;color:${T.ink};}
.pe-steps li::marker{color:${LAPIS.edge};font-weight:600;}
.pe-ghb{display:flex;align-items:center;justify-content:space-between;width:100%;gap:${S.sm}px;margin:0 0 ${S.md}px;padding:0;border:0;background:none;color:${T.inkDim};cursor:pointer;text-align:left;}
.pe-ghb > span{display:inline-flex;align-items:center;gap:${S.sm}px;}
.pe-ghb .chev{display:inline-flex;transition:transform .25s ease;}
.pe-grp:not(.shut) .pe-ghb .chev{transform:rotate(180deg);}
@media (max-width:767px){
  .pe-grp.shut > :not(.pe-ghb){display:none !important;}
  .pe-grp.shut .pe-ghb{margin-bottom:0;min-height:${S.xxl}px;}
  .pe-ghb{min-height:${S.xl}px;}
}
@media (min-width:768px){
  .pe-ghb{cursor:default;pointer-events:none;}
  .pe-ghb .chev{display:none;}
}
.pe-explain{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.5;color:${T.ink};}
.pe-door{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:${S.xs}px;padding:${S.md}px ${S.sm}px;border-radius:${PACK_R.field}px;cursor:pointer;text-decoration:none;
  background:${T.card};color:${T.inkStrong};border:1px solid ${T.cardEdge};font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;}
.pe-door.on{background:${LAPIS.grad};color:${LAPIS.ink};border-color:${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};}
.pe-door:disabled{opacity:.5;cursor:default;}
.pe-mform{display:flex;flex-direction:column;gap:${S.sm}px;padding:${S.md}px 0 ${S.xs}px;}
.pe-mail-in{width:100%;border:0;border-bottom:1px solid ${T.hairline};background:none;outline:none;padding:${S.sm}px 0;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.pe-mail-in:focus{border-bottom-color:${LAPIS.edge};}
.pe-check{display:flex;align-items:center;gap:${S.sm}px;padding:${S.sm}px 0;border-bottom:1px solid ${T.hairline};cursor:pointer;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.pe-check input{appearance:none;-webkit-appearance:none;flex:none;width:18px;height:18px;margin:0;border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.field}px;background:${T.card};cursor:pointer;display:grid;place-items:center;}
.pe-check input:checked{background:${LAPIS.grad};border-color:${LAPIS.deep};}
.pe-check input:checked::after{content:'';width:5px;height:9px;border:solid ${LAPIS.ink};border-width:0 2px 2px 0;transform:translateY(-1px) rotate(45deg);}
.pe-check.sub{font-size:${PACK_TEXT.label}px;padding-left:${S.lg}px;}
.pe-danger{border-color:${T.alertRed} !important;color:${T.alertRed} !important;}
.pe-mem.dim .c{opacity:.6;}
.pe-mem.angel .c{background:linear-gradient(180deg, ${T.card}, ${T.hairline});}
.pe-mem.angel .c img{filter:grayscale(1);opacity:.8;}
.pe-sup{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:${S.sm}px;margin-top:${S.md}px;padding-top:${S.md}px;border-top:1px solid ${T.hairline};}
.pe-sup-b{display:flex;align-items:center;gap:${S.md}px;flex-wrap:wrap;}
.pe-mail{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${LAPIS.edge};}
.pe-ver{text-align:center;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;color:${T.inkDim};margin-top:${S.lg}px;}
@media (min-width:768px){
  .pe-card .me-under{ padding-bottom:${S.xl}px; }
  .pe-duo{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:${S.xl}px;}
  .pe-pills{margin-right:0;padding-right:0;}
  .pe-nm{grid-template-columns:18px 140px minmax(0,1fr);}
  .pe-grp{padding:${S.lg}px ${S.xl}px;}
  .pe-mem .c{width:56px;height:56px;}
}
`;

export default function PackProfile() {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [nameDirty, setNameDirty] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverSheet, setCoverSheet] = useState(false);
  const [aboutDev, setAboutDev] = useState(false);
  const [coverY, setCoverY] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [appVer, setAppVer] = useState('');
  useEffect(() => { appWebVersion().then(setAppVer).catch(() => {}); }, []);
  const { toast } = useToast();
  const { devotion } = usePackIdentity();
  const [mateOpen, setMateOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  // SKUPINY NA MOBILE ZBALENÉ (Matej 23. 10.: „sekcie by mohli byť colapsnuté na dropdown na mobile, otvorená
  // len prvá, svorka aj účet blok zavretý — len nadpis a ikonka"). Na PC ich CSS drží otvorené vždy.
  const [shut, setShut] = useState<Set<string>>(() => {
    const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    return new Set(q && (q.has('dakujeme') || q.has('zrusene') || q.has('odkaz')) ? ['pack', 'acc'] : ['pack', 'misia', 'acc']);
  });
  const toggleGrp = (k: string) => setShut((prev) => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const [rank, setRank] = useState<'dev' | 'pt' | null>(null);
  const [mates, setMates] = useState<MyPawmates | null>(null);
  const [wills, setWills] = useState<WillRow[]>([]);
  const reloadMates = () => {
    if (PAWMATE_LIVE) listMyPawmates().then(setMates).catch(() => setMates(null));
    listMyWills().then((r) => { if (r.ok) setWills(r.data.wills); });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reloadMates(); }, []);
  const resetFlow = useDogyptStore((st) => st.reset);
  const { dogs: loadedDogs } = usePackUser(session?.user?.id ?? null);
  // PAWMATE (žiadny pes nie je jeho) — bez hodností a bez mena z cudzej objednávky (26. 10. 2026).
  const ownLoaded = loadedDogs.filter((d) => !d.user_id || d.user_id === session?.user?.id);
  const isMate = loadedDogs.length > 0 && ownLoaded.length === 0;
  const servantYears = useServantYears(ownLoaded, RANK_BADGE_ON);
  // Práve vymenené fotky psov — kým sa `usePackUser` nenačíta nanovo (hlava aj SVORKA ich ukážu hneď).
  const [dogPhoto, setDogPhoto] = useState<Record<string, string>>({});
  const [dogBusy, setDogBusy] = useState<string | null>(null);
  const dogs = loadedDogs.map((d) => (dogPhoto[d.id] ? { ...d, cloudinary_main_url: dogPhoto[d.id] } : d));
  // Obruč 1:1 s profilom: živá story = farebná obruč, inak neutrálny pás (bez `story` padala úprava vždy na farebnú).
  // Pri vypnutých príbehoch (`STORIES_ON`) sa nič nenačítava — obruč je vždy neutrálna.
  const [storyLive, setStoryLive] = useState(false);
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid || !STORIES_ON) return;
    let alive = true;
    fetchMyPosts(uid).then((rows) => { if (alive) setStoryLive(rows.filter(isMoment).some((p) => isLive(p, Date.now()))); }).catch(() => {});
    return () => { alive = false; };
  }, [session?.user?.id]);
  const dogFileRef = useRef<HTMLInputElement | null>(null);
  const dogPick = useRef<PackDogFull | null>(null);
  const { profile } = useProfile();
  const human = profile?.human;
  const patchHuman = (p: Partial<HumanProfile>) => { saveHuman(p); };
  const myNumber = ownLoaded.map((d) => d.pack_number).filter((n): n is number => n != null).sort((a, b) => a - b)[0] ?? null;
  const beside = useBeside({ uid: session?.user?.id ?? null, isMate, showMates: human?.showMates, myNumber });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setSessionChecked(true);
      const meta = (data.session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
      // DEV-ONLY: NOAUTH guest nemá session — fallback, aby sa stránka dala posúdiť (nikdy na produkcii).
      const devNoAuth = import.meta.env.DEV && import.meta.env.VITE_PACK_NOAUTH === '1';
      setAvatarUrl(meta.avatar_url || meta.avatar || (devNoAuth ? '/images/about-matej.png' : null));
      setFullName(meta.full_name || meta.name || (devNoAuth ? 'Matej Stacho' : ''));
    });
    return () => {
      mounted = false;
    };
  }, []);

  // ?edit=avatar (ťuk na fotku na profile) → hneď výber súboru.
  useEffect(() => {
    if (searchParams.get('edit') === 'avatar') {
      const timeoutId = setTimeout(() => fileInputRef.current?.click(), 200);
      return () => clearTimeout(timeoutId);
    }
  }, [searchParams]);

  // `?welcome=1` (po platbe) = nastav si heslo → zroluj na ÚČET, `PackSettings` to vie sám.
  useEffect(() => {
    if (!searchParams.has('welcome') || !sessionChecked) return;
    setShut((prev) => { const n = new Set(prev); n.delete('acc'); return n; });
    const id = setTimeout(() => accountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    return () => clearTimeout(id);
  }, [searchParams, sessionChecked]);

  const email = session?.user?.email ?? '—';
  // Meno z objednávky — východisko, keď si človek v profile žiadne nevypísal.
  const orderName = ownLoaded.map((d) => d.owner_name?.trim()).find(Boolean) ?? '';
  const pilgrim = usePilgrimStats(session?.user?.email ?? '', pilgrimAuthorName(session?.user?.email, session?.user?.user_metadata));

  // Staré odkazy: BONES a línia žijú v šuplíku na profile, nie tu.
  if (location.hash === '#network') return <Navigate to="/pack/profile#network" replace />;
  const noAuthDev = import.meta.env.DEV && import.meta.env.VITE_PACK_NOAUTH === '1';
  if (sessionChecked && !session && !noAuthDev) {
    return <Navigate to={`/login?return=${encodeURIComponent('/pack/profile/edit')}`} replace />;
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !session?.user) return;
    setUploading(true);
    try {
      // Zmenšiť pred nahraním ako titulka v CoverSheet a príspevky — fotka z mobilu má 10+ MB (audit 26. 10.).
      const { blob } = await compressFile(file);
      const result = await uploadAvatarPhoto(blob, session.user.id);
      const { error: upErr } = await supabase.auth.updateUser({
        data: { avatar_url: result.secureUrl },
      });
      if (upErr) throw new Error(upErr.message);
      // Aj do `pack_profiles` — do `user_metadata` CUDZIEHO účtu sa iný člen nedostane (2026-08-26).
      await saveAvatarUrl(result.secureUrl);
      setAvatarUrl(result.secureUrl);
      toast({ title: tx('pack.profile.toastPhotoUpdated', 'Photo updated') });
    } catch (err) {
      toast({
        title: tx('pack.profile.toastUploadFailed', 'Upload failed'),
        description: err instanceof Error ? err.message : tx('pack.profile.toastUnknownError', 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // TITULKA = vlastné pole `human.coverPhoto`. 🔴 NIE `buddyPhoto` — to je fotka „spolu"
  // pre bránu SNIFFERA a zmena titulky by ju ticho prepísala. Nová fotka začína v strede.
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !session?.user) return;
    setCoverUploading(true);
    try {
      const { blob } = await compressFile(file);
      const result = await uploadCoverPhoto(blob, session.user.id);
      // Nová titulka ide aj do ALBUMU titulky (`CoverSheet` na profile), inak by sa po výmene stratila stará.
      await saveHuman({ coverPhoto: result.secureUrl, coverY: 50, coverAlbum: [...coverAlbumOf(human), result.secureUrl] }, { throwOnError: true });
      setCoverY(null);
      toast({ title: tx('pack.profile.toastPhotoUpdated', 'Photo updated') });
    } catch (err) {
      toast({
        title: tx('pack.profile.toastUploadFailed', 'Upload failed'),
        description: err instanceof Error ? err.message : tx('pack.profile.toastUnknownError', 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameDirty || nameSaving) return;
    setNameSaving(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() || null },
      });
      if (upErr) throw new Error(upErr.message);
      // Aj do `pack_profiles` — inak by meno videl len jeho majiteľ (2026-08-26).
      await saveDisplayName(fullName);
      setNameDirty(false);
      toast({ title: tx('pack.profile.toastNameUpdated', 'Name updated') });
    } catch (err) {
      toast({
        title: tx('pack.profile.toastCouldNotSave', 'Could not save'),
        description: err instanceof Error ? err.message : tx('pack.profile.toastUnknownError', 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setNameSaving(false);
    }
  };

  const initial = (fullName?.[0] || orderName?.[0] || email?.[0] || 'D').toUpperCase();
  // Meno v náhľade = presne to, čo uvidia ostatní (`Zobraziť ako`) a mení sa už pri písaní.
  const shownName = (() => {
    if (human?.displayAs === 'nickname' && human.nickname?.trim()) return human.nickname.trim();
    if (human?.displayAs === 'packName' && human.packName?.trim()) return human.packName.trim();
    return fullName.trim() || orderName || email.split('@')[0];
  })();
  const firstDog = dogs.find((d) => d.pack_number != null) ?? dogs[0] ?? null;
  // Tá istá titulka ako na profile — pri striedaní po dni dnešná (`coverOfDay`).
  const coverSrc = coverOfDay(human) || human?.buddyPhoto || firstDog?.cloudinary_main_url || null;
  const dev = devotionLevel(devotion);
  const soon = () => toast({ title: tx('pack.edit.soon', 'Coming soon.') });

  return (
    <PackLayout onBack={() => (canStepBack() ? navigate(-1) : navigate('/pack/profile'))} backLabel={tx('pack.edit.back', 'Back')}>
      <style>{PILL_CSS}</style>
      <style>{PF_FIELD_CSS}</style>
      <style>{ROWS_CSS}</style>
      <style>{ME_CSS}</style>
      {APP_NEW && <style>{ME_FLAT_CSS}</style>}
      <style>{EDIT_CSS}</style>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
      <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
      <input ref={dogFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
        const f = e.target.files?.[0]; e.target.value = '';
        const d = dogPick.current;
        if (!f || !d) return;
        setDogBusy(d.id);
        try {
          const url = await changeDogMainPhoto(d.id, f);
          setDogPhoto((m) => ({ ...m, [d.id]: url }));
          toast({ title: tx('pack.me.dogPhotoDone', 'New photo of {dog}').replace('{dog}', d.dog_name ?? '') });
        } catch (err) {
          toast({ title: tx('pack.profile.toastUploadFailed', 'Upload failed'), description: err instanceof Error ? err.message : '', variant: 'destructive' });
        } finally { setDogBusy(null); }
      }} />

      <section className={`me-card pe-card${APP_NEW ? ' me-flat' : ''}${beside ? ' with-mate' : ''}`}>
        {/* NÁHĽAD 1:1 — tá istá hlava ako profil. Titulka sa ťahá, foťák ju mení. */}
        <MeCover
          cover={coverSrc}
          coverY={coverY ?? human?.coverY}
          name={shownName}
          devLabel={tx(`pack.ladder.${dev.key}`, dev.name)}
          devLevel={dev.index}
          pilgrimLabel={String(pilgrim.level.level)}
          pilgrimLevel={pilgrim.level.level}
          pilgrimPct={pilgrim.level.pct}
          servantYears={servantYears}
          servantLabel={tx('pack.ladder.servant', 'Servant')}
          pilgrimRankLabel={tx('pack.map.rankPilgrim', 'Pilgrim')}
          onDev={() => setRank((r) => (r === 'dev' ? null : 'dev'))}
          onPilgrim={() => setRank((r) => (r === 'pt' ? null : 'pt'))}
          rank={rank}
          noRanks={isMate}
          onMoveY={setCoverY}
          onMoveEnd={(y) => { patchHuman({ coverY: y }); }}
          right={
            <span className="pe-tr">
              {/* Vlajka 1:1 s profilom (25. 10.) — mení sa v poli národnosti nižšie. */}
              <MeFlag code={human?.nationality ?? 'SK'} label={countryLabel(human?.nationality ?? 'SK', lang)} />
              {/* Štítok „POTIAHNI“ preč — ťahá sa aj bez neho (Matej 23. 10.: „funkciu zachovaj, tlačítko vyhoď“). */}
              {/* Foťák = ALBUM TITULKY (`CoverSheet`: viac fotiek, striedanie po dni), Matej 23. 10.:
                  *„upraviť titulku v /edit sekcii"*. Ťahanie polohy ostáva na titulke. */}
              <button type="button" className="pe-cam" onClick={() => setCoverSheet(true)} disabled={coverUploading} aria-label={tx('pack.edit.changeCover', 'Change cover')}>
                {coverUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandCamera size={15} />}
              </button>
            </span>
          }
        />

        <div className="me-under">
          <MeOwn
            story={storyLive ? 'live' : 'none'}
            mate={beside ? { ...beside, onClick: beside.to ? () => navigate(beside.to as string) : undefined } : null}
            photo={avatarUrl}
            initial={initial}
            dogs={dogs}
            onPhoto={() => fileInputRef.current?.click()}
            photoLabel={tx('pack.profile.changeAvatarAria', 'Change avatar')}
            onDogPhoto={(d) => { dogPick.current = d; dogFileRef.current?.click(); }}
            dogBusy={dogBusy}
            dogPhotoLabel={tx('pack.me.dogPhoto', 'Change dog photo')}
            badge={
              <span className="pe-cam pe-own-cam" aria-hidden>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandCamera size={15} />}
              </span>
            }
          />
          <div className="me-gap" />
          {rank && <MeRank kind={rank} devotion={devotion} pilgrim={pilgrim} servantYears={servantYears} sinceDogs={ownLoaded.filter((d) => d.life_status !== 'deceased').map((d) => ({ id: d.id, name: d.dog_name || '' }))} onDogId={dogs[0] ? () => navigate(`/pack/dogs/${dogs[0].id}`) : undefined} onStats={() => navigate('/pack/map/triplist?tab=stats')} onAbout={() => setAboutDev(true)} onClose={() => setRank(null)} tx={tx} />}
          {aboutDev && <DevotionSheet devotion={devotion} onClose={() => setAboutDev(false)} />}

          {/* ── 1 · O MNE — jediný nadpis skupiny. Poradie (Matej 23. 10.): mená · bio · fakty · povaha. ── */}
          <div className={`pe-grp${shut.has('me') ? ' shut' : ''}`} style={{ ...PACK_BOX.subblock }}>
            <GroupHead icon="person" label={tx('pack.edit.aboutMe', 'About me')} open={!shut.has('me')} onToggle={() => toggleGrp('me')} />

            {/* Na PC mená a bio VEDĽA SEBA (pri menách ostávalo vpravo prázdno), na mobile pod sebou. */}
            <div className="pe-duo">
              {/* MENÁ — tri meniteľné, jedno z nich vidia ostatní (krúžok vľavo = „toto ukáž").
                  Riadok „Na certifikáte" zrušený (Matej 23. 10.: „na certifikáte by som dal preč"). */}
              <div className="pe-names">
                {([
                  ['name', tx('pack.profile.name', 'Name')],
                  ['nickname', tx('pack.profile.nickname', 'Nickname')],
                  ['packName', tx('pack.profile.packName', 'Pack name')],
                ] as const).map(([k, label]) => {
                  const on = (human?.displayAs ?? 'name') === k;
                  return (
                    <div key={k} className={`pe-nm${on ? ' on' : ''}`}>
                      <button type="button" className="pe-dot" aria-pressed={on} aria-label={`${tx('pack.profile.showAs', 'Show as')}: ${label}`}
                        onClick={() => patchHuman({ displayAs: k })} />
                      <span className="pe-nl">{label}</span>
                      {k === 'name' ? (
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => { setFullName(e.target.value); setNameDirty(true); }}
                          onBlur={() => { handleSaveName(); }}
                          /* Prázdne = platí meno z OBJEDNÁVKY (Matej 2026-08-26) — ukážeme ho ako predlohu. */
                          placeholder={orderName || tx('pack.profile.namePlaceholder', 'Your name')}
                        />
                      ) : (
                        <LineInput
                          value={(k === 'nickname' ? human?.nickname : human?.packName) ?? ''}
                          onSave={(v) => patchHuman(k === 'nickname' ? { nickname: v || undefined } : { packName: v || undefined })}
                          placeholder={k === 'nickname' ? tx('pack.profile.nicknamePlaceholder', 'Pack calls you') : tx('pack.profile.packNamePlaceholder', 'Your household')}
                        />
                      )}
                    </div>
                  );
                })}
                <p className="pe-hint">{tx('pack.edit.shownHint', '● = the name others see')}</p>
              </div>

              {/* BIO — bez nadpisu, otázka je priamo v poli. */}
              <div className="pe-bio">
                <WordLimitTextarea
                  value={human?.dogVoiceBio ?? ''}
                  onSave={(v) => patchHuman({ dogVoiceBio: v })}
                  placeholder={tx('pack.profile.bioHeading', 'BIO: What my dog would probably say about me')}
                  rows={5}
                  white
                />
              </div>
            </div>

            {/* FAKTY — tri RIADKY rovnakej šírky, bez štítkov (Matej 23. 10.: „na riadky nie na pills"):
                1 vek · národnosť · mesto (roztiahnuté) · oko · 2 stav · fajčenie · 3 strava · práca.
                Oko je v PRVOM riadku (Matej 23. 10.: „viditeľnosť daj na prvý riadok"), riadky 2–3 sú 2×2. */}
            <div className="pe-facts">
              <div className="pe-fr r1">
                <HideWrap hidden={isHidden(profile, 'age')}>
                  <MiniChipInput emoji="🎂" type="number" value={human?.age} placeholder={tx('pack.profile.agePlaceholder', 'Age')} width={44}
                    onSave={(v) => patchHuman({ age: v === '' ? undefined : Number(v) })} />
                </HideWrap>
                <NationalitySelect value={human?.nationality ?? 'SK'} onChange={(v) => patchHuman({ nationality: v })} />
                <HideWrap hidden={isHidden(profile, 'region')}>
                  <MiniChipInput emoji="📍" value={human?.region ?? ''} placeholder={tx('pack.profile.cityPlaceholder', 'City')} width={200}
                    onSave={(v) => patchHuman({ region: v || undefined })} />
                </HideWrap>
                <IdentityVisibilityEye profile={profile} patchHuman={patchHuman} />
              </div>
              <div className="pe-fr r2">
                <StatusSelect value={human?.relationship} onChange={(v) => patchHuman({ relationship: v })} placeholder={tx('pack.profile.statusPlaceholder', 'Status')} />
                <LifestyleSelect emoji="" placeholder={tx('pack.profile.smokePlaceholder', 'Smoke')} options={SMOKE_OPTIONS} value={human?.smoke} onChange={(v) => patchHuman({ smoke: v })} />
              </div>
              <div className="pe-fr r2">
                <LifestyleSelect emoji="" placeholder={tx('pack.profile.dietPlaceholder', 'Diet')} options={DIET_OPTIONS} value={human?.diet} onChange={(v) => patchHuman({ diet: v })} />
                <LifestyleSelect emoji="" placeholder={tx('pack.profile.workPlaceholder', 'Work')} options={WORK_OPTIONS} value={human?.work} onChange={(v) => patchHuman({ work: v })} />
              </div>
            </div>

            <PillPicker human={human} patchHuman={patchHuman} />
          </div>

          {/* ── 2 · MOJA SVORKA — podľa Matejovej skice 23. 10.: v rámiku KAŽDÝ ČLEN = vlastný riadok
              s rozklikom (JA · psy · pawmati pod sebou), pod nimi lišta „+ PES / MATE", pod rámikom veta.
              Zosnulí psy stoja v tom istom zozname ako anjeli. Bez popupu. ── */}
          <div className={`pe-grp${shut.has('pack') ? ' shut' : ''}`} style={{ ...PACK_BOX.subblock }}>
            <GroupHead icon="people" label={tx('pack.edit.mySvorka', 'My pack')} open={!shut.has('pack')} onToggle={() => toggleGrp('pack')} />
            <div className="pe-core">
              {/* K4c: vyradený pawmate žiada o zmazanie — rozhoduješ ty (nič sa nemaže samo) */}
              {!isMate && <DeleteRequests />}
              <MemberRow
                photo={avatarUrl ? sizedUrl(avatarUrl, 140) : null}
                initial={initial}
                name={shownName}
                // POD MENOM postavenie + roly; v rozkliku pawmate na profile a výber rolí (Matej 26. 10. 2026: *„ponechaj len
                // meno a pod menom ROLU, až na rozklik sa zobrazí show lenka aj výber s pills ROLA … pekne prehľadne rozpísal
                // aj vysvetlil"*). Pilulka s rozbaľovačom vedľa mena (z rána 26. 10.) tým zaniká.
                sub={roleLabels(isMate, human, tx).join(' · ')}
                human
              >
                <ShowMates mates={mates} isMate={isMate} beside={beside} value={human?.showMates ?? []}
                  onChange={(ids) => patchHuman({ showMates: ids })} />
                <RolePicker value={profileRoles(human)} onChange={(roles) => patchHuman({ roles, role: roles[0] })} />
              </MemberRow>
              {dogs.map((d) => (
                <DogEditRow key={d.id} dog={d} attrs={profile?.dogs?.[d.id]} onDogId={() => navigate(`/pack/dogs/${d.id}`)} />
              ))}
              {mates?.people.map((m) => (
                <MateRow key={`${m.kind}-${m.user_id ?? m.email}`} mate={m} onChanged={reloadMates} />
              ))}
              {wills.map((w) => <WillMateRow key={w.id} will={w} dogs={dogs} onChanged={reloadMates} />)}

              {/* PRIDAŤ ČLENA — jedno lapisové tlačidlo cez celú šírku, po ťuku dvoje dvere s vysvetlením (Matej 26. 10. 2026:
                  *„jedno lapis tlačítko cez celé, nie kruh a tlačítko … PES / člen domácnosti (pawmate) … vysvetlenie malým
                  písmom … teraz to nie je vysvetlené"*). PES = výroba heroglyfu, ČLEN = formulár pawmata pod ním. */}
              <AddMember isMate={isMate} open={addOpen} onToggle={() => { setAddOpen((o) => !o); setMateOpen(false); }}
                mateOpen={mateOpen} onMate={() => (PAWMATE_LIVE ? setMateOpen((o) => !o) : soon())} onDog={resetFlow} />
              {mateOpen && <MateForm dogs={dogs.filter((d) => d.life_status !== 'deceased')} lang={lang} onDone={() => { setMateOpen(false); setAddOpen(false); reloadMates(); }} />}
            </div>
          </div>

          {/* ── 3 · MISIA — pokladnica svorky a dar (Matej 24. 10. 2026: „sekcia v /profile … o mne · svorka · toto
              (misia) · účet“). Nákres plany/nakres-profil-misia-2026-10-24.html, telo v MisiaGroup.tsx. ── */}
          {MISIA_ON && <div className={`pe-grp${shut.has('misia') ? ' shut' : ''}`} id="misia" style={{ ...PACK_BOX.subblock, scrollMarginTop: 96 }}>
            <GroupHead icon="heartpaw" label={tx('pack.misia.title', 'Mission')} open={!shut.has('misia')} onToggle={() => toggleGrp('misia')} />
            <MisiaBody />
          </div>}

          {/* ── 4 · ÚČET A APPKA ── */}
          <div className={`pe-grp${shut.has('acc') ? ' shut' : ''}`} ref={accountRef} style={{ ...PACK_BOX.subblock, scrollMarginTop: 96 }}>
            <GroupHead icon="sliders" label={tx('pack.edit.secAccount', 'Account & app')} open={!shut.has('acc')} onToggle={() => toggleGrp('acc')} />
            {/* PODPORA = ďalšie riadky toho istého zoznamu (Matej 23. 10.: „urob to normálne, ako keby to len
                pokračovalo, nie ako niečo úplne iné"). Tlačidlo má tvar ODHLÁSIŤ SA, e-mail tvar riadku E-MAIL. */}
            <PackSettings bare after={<>
              {/* Len PODPORA (Matej 23. 10.: „dole daj len podpora, nie napíš nám — podpora otvorí AINUBIS chat"). */}
              <Field icon={<BrandIcon name="question" size={16} tint="dim" />} label={tx('pack.edit.support', 'Support')} last>
                <button type="button" className="pf-tap" onClick={() => openAinubis()} style={ROW_BTN}>{tx('pack.edit.supportAi', 'Ask AINUBIS')}</button>
              </Field>
            </>} />
            {/* ČÍSLO VERZIE — LEN V APPKE (21. 10. 2026), rovnaké ako `version` v dogypt.com/app-update.json. */}
            {appVer && <div className="pe-ver">DOGYPT · {APP_PLATFORM} · {appVer}{TEST_BUILD ? ' · TEST' : ''}</div>}
          </div>
        </div>
      </section>
      {coverSheet && session?.user?.id && <CoverSheet uid={session.user.id} human={human} onClose={() => setCoverSheet(false)} />}
    </PackLayout>
  );
}

// `MyGodsContent` (psia galéria — accordion editor BIO+tagov) ZMAZANÝ 2026-08-06
// spolu so sekciou „OH, MY DOG!" (viď komentár pri jej bývalom mieste vyššie).
// Komponent `DogGalleryAccordion` sám NEZANIKOL — read-only ho ďalej používa
// `PublicProfile.tsx` (`/pack/u/:id`). Editovanie psích polí patrí do kvízov v MY PACK.

// `Field`/`Badge` (Account info riadky) ZMAZANÉ 2026-08-12 — boli súkromné len pre karte
// „Account", ktorú nahradil zdieľaný `<PackSettings/>`. Rovnaké komponenty žijú tam.

// ─────────────────────────────────────────────────────────────────────────
// Koncentrát osobnosti + lifestyle — BLOK 2 rozpustený do BLOK 1 (ľavý
// stĺpec, pod bio) — zadanie-profil-koncentrat-2026-07-24. Nahrádza starý
// samostatný <ProfileEditor/> ("Topics & style" karta, Topics/vibe/off-the-
// leash/person-type/smoking/alcohol/looking-for pill groups + per-field
// visibility toggle). Read/write stále cez useProfile()/saveHuman() —
// žiadny priamy localStorage.
// ─────────────────────────────────────────────────────────────────────────

const MAX_WORDS = 150;
function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

// LANGUAGE_OPTIONS removed from BLOK 1 UI (zadanie-profil-blok1-rework-2026-07-24
// — `human.languages` data field stays, just no longer rendered here).


// Reusable pill — selected = gold fill (T.accentGold) + dark text, unselected =
// T.bg + hairline border + inkDim text. Emoji prefix (font-native, per
// zadanie-profil-kompakt-emoji-2026-07-24) replaces the old <BrandIcon>; falls
// back to no prefix when an option has neither (never invents one). `disabled`
// = at MAX_PERSONALITY and not yet selected — dimmed, click is a no-op.
function ProfilePill<V extends string>({
  option,
  selected,
  disabled,
  onClick,
}: {
  option: TaxonomyOption<V>;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const t = useT();
  // Štítky o človeku v jeho rode (⚥ v slovníku) — profil je vlastný, rod berieme z neho.
  const rodG = useProfile().profile?.human?.gender ?? '';
  const tx = (key: string, fallback: string) => { const v = t(key, { rod: rodG }); return v === key ? fallback : v; };
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`pf-pill inline-flex items-center gap-1${selected ? ' is-selected' : ''}`}
      style={{
        borderRadius: 999,
        padding: '4px 8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 10,
        fontWeight: selected ? 600 : 500,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {option.emoji ? <span aria-hidden>{option.emoji}</span> : null}
      {/* Hodnota pilulky ide cez konvenčný kľúč `pack.profileTag.<value>` — rovnaký vzor ako
          `pack.dogTag.<value>` (dogQuiz.ts:94). Taxonómia v `packProfile.ts` tak ostáva čisté
          dáta bez i18n poľa a `labelEN` slúži ako fallback, keď preklad chýba. */}
      {tx(`pack.profileTag.${option.value}`, option.labelEN)}
    </button>
  );
}


// Compact lifestyle dropdown — same rounded-pill select chrome as
// Nationality/Status above (ČASŤ B.3). Generic over any TaxonomyOption union.
function LifestyleSelect<V extends string>({
  emoji,
  placeholder,
  options,
  value,
  onChange,
}: {
  emoji: string;
  placeholder: string;
  options: TaxonomyOption<V>[];
  value: V | undefined;
  onChange: (v: V | undefined) => void;
}) {
  const t = useT();
  // Štítky o človeku v jeho rode (⚥ v slovníku) — profil je vlastný, rod berieme z neho.
  const rodG = useProfile().profile?.human?.gender ?? '';
  const tx = (key: string, fallback: string) => { const v = t(key, { rod: rodG }); return v === key ? fallback : v; };
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? (e.target.value as V) : undefined)}
      className="pf-field pf-selpad"
      style={{
        borderRadius: 999,
        width: '100%',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: PACK_TEXT.label,
        color: value ? T.ink : T.inkFaint,
        cursor: 'pointer',
      }}
    >
      <option value="">{emoji ? `${emoji} ` : ''}{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.emoji ? `${opt.emoji} ` : ''}{tx(`pack.profileTag.${opt.value}`, opt.labelEN)}</option>
      ))}
    </select>
  );
}

// ≤150-word textarea with a live counter — blocks further growth once over
// the limit (spec: „nad limit blokuj ďalší vstup"). Auto-saves on blur.
function WordLimitTextarea({
  value,
  onSave,
  placeholder,
  rows = 4,
  align = 'left',
  white = false,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  rows?: number;
  align?: 'left' | 'center';
  /** Matej 2026-07-26: „texta area daj biele" — textarea má byť SVETLEJŠIA než
   *  zlatý gradient ostatných `.pf-field` prvkov. Od 13. 8. je to najsvetlejší
   *  papyrusový tón `${T.card}`, nie čistá `#FFFFFF`: biela bola jediný taký prvok
   *  na celej stránke a porušovala lock bledého bloku (audit A2). Zámer ostáva,
   *  mení sa odtieň. Inline `background` prebije CSS triedu, takže `.pf-field`
   *  border/shadow/focus glow ostávajú. Ten istý tón nesie bio psa
   *  v `profile/DogGallery.tsx` — meniť oba naraz. */
  white?: boolean;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  const count = countWords(local);
  const over = count > MAX_WORDS;

  return (
    // IG-style: counter overlaid inside the textarea's bottom-right corner
    // (per Matej — no separate line below, consolidates space).
    <div style={{ position: 'relative' }}>
      <textarea
        value={local}
        onChange={(e) => {
          const next = e.target.value;
          if (countWords(next) > MAX_WORDS && next.length > local.length) return;
          setLocal(next);
        }}
        onBlur={() => { if (local !== value) onSave(local); }}
        placeholder={placeholder}
        rows={rows}
        className={`pf-field${white ? ' pf-field--flat' : ''}`}
        style={{
          width: '100%',
          // radius 8 = úroveň 4 MATRICE, rovnako ako MENO a PREZÝVKA nad ňou.
          // Textarea tu mala 10 a vedľajšie polia 8 — rozdiel, ktorý oko vidí a nevie pomenovať.
          borderRadius: 8,
          padding: '8px 12px 24px',
          minHeight: 48,
          color: T.ink,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 12,
          lineHeight: 1.4,
          textAlign: align,
          resize: 'vertical',
          // farba prichádza z `.pf-field--flat` (packTheme.ts) — jedno miesto pre všetky tri polia
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: 10,
          bottom: 8,
          pointerEvents: 'none',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: over ? '#A04040' : T.inkFaint,
        }}
      >
        {count}/{MAX_WORDS}
      </span>
    </div>
  );
}

// Mini pill chip — wraps gender (read-only) / age / region into a compact,
// single-line row instead of the old label-then-full-width-input stack
// (zadanie-profil-kompakt-emoji-2026-07-24).
// Skryté pole ostáva vo VLASTNOM profile plne editovateľné — len stlmené a s
// preškrtnutým okom, aby si na prvý pohľad videl, čo pack nevidí. Skrývanie sa
// deje až pri čítaní cudzím okom (PublicProfile), nie tu.
function HideWrap({ hidden, children }: { hidden: boolean; children: React.ReactNode }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  if (!hidden) return <>{children}</>;
  return (
    <span
      className="relative inline-flex items-center"
      title={tx('pack.profile.hiddenTooltip', 'Hidden from the pack — only you see this')}
      style={{ opacity: 0.45 }}
    >
      {children}
      <EyeOff className="h-3 w-3" style={{ color: T.inkFaint, marginLeft: 3 }} />
    </span>
  );
}

// D3 — jedno oko na identity riadok. Klik otvorí zoznam skrývateľných polí
// (vek · národnosť · mesto). Zapisuje do human.visibility: 'private' = skryté,
// vymazanie kľúča = späť na default. Počet psov v zozname nie je zámerne.
function IdentityVisibilityEye({
  profile,
  patchHuman,
}: {
  profile: CentralProfile | null;
  patchHuman: (p: Partial<HumanProfile>) => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [open, setOpen] = useState(false);
  const hiddenKeys = HIDEABLE_IDENTITY_FIELDS.filter((f) => isHidden(profile, f.key));
  const anyHidden = hiddenKeys.length > 0;

  const toggle = (key: ProfileFieldKey) => {
    const current = { ...(profile?.human.visibility ?? {}) };
    if (current[key] === 'private') delete current[key];
    else current[key] = 'private';
    patchHuman({ visibility: current });
  };

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={tx('pack.profile.identityVisibilityAria', 'Who sees these details')}
        aria-expanded={open}
        className="pf-hit inline-flex items-center gap-1"
        style={{
          background: anyHidden ? 'rgba(201,154,63,0.10)' : T.bg,
          border: `1px solid ${anyHidden ? '${T.border}' : T.hairline}`,
          borderRadius: 999,
          padding: '4px 8px',
          color: anyHidden ? T.accentGold : T.inkFaint,
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {anyHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {anyHidden && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
            {hiddenKeys.length}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop — klik mimo zatvára. Native <select>-y v riadku by inak
              ostali pod otvoreným panelom nedostupné. */}
          <span
            className="fixed inset-0"
            style={{ zIndex: 40 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="absolute"
            style={{
              zIndex: 41,
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 208,
              // Úroveň 4 MATRICE (`PACK_BOX.panel`). `T.card` je PLNÁ farba, nie gradient —
              // CLAUDE.md pred tým výslovne varuje a tu bola použitá ako pozadie panelu.
              ...PACK_BOX.panel,
              padding: 8,
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontFamily: FONT_UI, fontWeight: 500,
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: T.inkFaint,
                display: 'block',
                marginBottom: 8,
              }}
            >
              {tx('pack.profile.hideFromPack', 'Hide from the pack')}
            </span>
            {HIDEABLE_IDENTITY_FIELDS.map((f) => {
              const off = isHidden(profile, f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggle(f.key)}
                  className="flex items-center gap-2 w-full"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12,
                    color: off ? T.inkFaint : T.ink,
                  }}
                >
                  <span aria-hidden>{f.emoji}</span>
                  <span className="flex-1" style={{ textDecoration: off ? 'line-through' : 'none' }}>
                    {/* Rovnaký text ako placeholder toho poľa v riadku identity — jeden údaj,
                        jedno slovo. `HIDEABLE_IDENTITY_FIELDS` má kľúče `age` / `region`. */}
                    {tx(f.key === 'region' ? 'pack.profile.cityPlaceholder' : 'pack.profile.agePlaceholder', f.labelEN)}
                  </span>
                  {off ? (
                    <EyeOff className="h-3.5 w-3.5" style={{ color: T.accentGold }} />
                  ) : (
                    <Eye className="h-3.5 w-3.5" style={{ color: T.inkFaint }} />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </span>
  );
}

function MiniChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="pf-field inline-flex items-center gap-1"
      style={{
        borderRadius: 999,
        padding: '4px 8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 10,
        color: T.ink,
      }}
    >
      {children}
    </span>
  );
}

// Editable variant — emoji prefix + borderless inline input inside a MiniChip.
function MiniChipInput({
  emoji,
  type = 'text',
  value,
  placeholder,
  width,
  onSave,
}: {
  emoji: string;
  type?: 'text' | 'number';
  value: string | number | undefined;
  placeholder?: string;
  width: number;
  onSave: (v: string) => void;
}) {
  const initial = value == null ? '' : String(value);
  const [local, setLocal] = useState(initial);
  useEffect(() => setLocal(initial), [initial]);
  return (
    <MiniChip>
      <span aria-hidden>{emoji}</span>
      <input
        type={type}
        min={type === 'number' ? 13 : undefined}
        max={type === 'number' ? 120 : undefined}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if (local !== initial) onSave(local); }}
        placeholder={placeholder}
        style={{
          width,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: 0,
          color: T.ink,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 10,
        }}
      />
    </MiniChip>
  );
}

// Nationality — flag + short-code pill dropdown (e.g. "🇸🇰 SVK", not the full
// country name — zadanie-profil-shrink-2026-07-24, was full labelEN). Native
// <select>, default 'SK'.
// VŠETKY krajiny sveta (Matej 2026-08-13: „vlajky tu nie su všetky"). Zoznam sa
// nepíše ručne — vlajka sa POČÍTA z ISO2 a názov dodá `Intl.DisplayNames` v aktívnom
// jazyku, viď `lib/countryOptions.ts`. Známe krajiny stoja hore vo vlastnej skupine,
// aby Slovák nescrolloval cez 230 položiek.
// ⚠️ Legacy hodnota `UK` sa zobrazí ako Spojené kráľovstvo, ale uloží sa `GB`.
function NationalitySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { frequent, rest } = countryOptions(lang);
  const isOther = value?.toUpperCase() === COUNTRY_OTHER;
  const iso2 = isOther ? null : normalizeCountryValue(value);
  const selected = isOther ? COUNTRY_OTHER : (iso2 ?? '');
  return (
    <span
      className="pf-field pf-selchip inline-flex items-center gap-1.5"
      style={{
        borderRadius: 999,
        padding: '4px 12px 4px 12px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 10,
        color: T.ink,
        cursor: 'pointer',
      }}
    >
      <span aria-hidden style={{ fontSize: 12, lineHeight: 1 }}>
        {iso2 ? flagEmojiFromISO2(iso2) : '\u{1F3F3}\uFE0F'}
      </span>
      <span style={{ fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
        {iso2 ? iso2ToISO3(iso2) : tx('pack.profile.countryOtherShort', 'N/A')}
      </span>
      <ChevronDown aria-hidden className="h-3 w-3 shrink-0" style={{ color: T.inkDim }} />
      {/* Natívny <select> leží priehľadný nad celým chipom — zoznam ostáva systémový
          (na mobile je to picker, ktorý človek pozná), viditeľný tvar je náš. */}
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        aria-label={tx('pack.profile.countryAria', 'Country')}
      >
        <optgroup label={tx('pack.profile.countryFrequent', 'Nearby')}>
          {frequent.map((o) => (
            <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
          ))}
        </optgroup>
        <optgroup label={tx('pack.profile.countryAll', 'All countries')}>
          {rest.map((o) => (
            <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
          ))}
          <option value={COUNTRY_OTHER}>{'\u{1F3F3}\uFE0F'} {tx('pack.profile.countryOther', 'Other')}</option>
        </optgroup>
      </select>
    </span>
  );
}

// Status (relationship) — ONE pill dropdown instead of separate Single/Taken
// pills (zadanie-profil-shrink-2026-07-24). Empty value = placeholder/clear.
function StatusSelect({
  value,
  onChange,
  placeholder = '—',
}: {
  value: RelationshipStatus | undefined;
  onChange: (v: RelationshipStatus | undefined) => void;
  placeholder?: string;
}) {
  const t = useT();
  // Štítky o človeku v jeho rode (⚥ v slovníku) — profil je vlastný, rod berieme z neho.
  const rodG = useProfile().profile?.human?.gender ?? '';
  const tx = (key: string, fallback: string) => { const v = t(key, { rod: rodG }); return v === key ? fallback : v; };
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? (e.target.value as RelationshipStatus) : undefined)}
      className="pf-field pf-selpad"
      style={{
        borderRadius: 999,
        width: '100%',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: PACK_TEXT.label,
        color: value ? T.ink : T.inkFaint,
        cursor: 'pointer',
      }}
    >
      <option value="">{placeholder}</option>
      {RELATIONSHIP_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.emoji} {tx(`pack.profileTag.${opt.value}`, opt.labelEN)}</option>
      ))}
    </select>
  );
}





// Pole mena bez rámu (riadok `.pe-nm`) — ukladá sa pri opustení, ako ostatné polia profilu.
function LineInput({ value, onSave, placeholder }: { value: string; onSave: (v: string) => void; placeholder?: string }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { if (local !== value) onSave(local.trim()); }}
      placeholder={placeholder}
    />
  );
}

// POVAHA v UPRAVIŤ PROFIL (23. 10. 2026). Matej: *„pri pridaj vlastné daj viac možností nie len
// jednu … ušetri priestor ale zachovaj pills nech sú na 3–4 riadky"*.
// Všetko je v JEDNOM páse so ŠTYRMI radmi, ťahá sa do strany (pretŕča cez okraj karty ako pilulky
// na profile). Poradie: „+ vlastná" · moje vlastné · vybraté · zvyšok — čo mám, vidím bez ťahania.
// Vlastných môže byť viac; strop ostáva spoločný `MAX_PERSONALITY`.
/** Minimum pilulek povahy (Matej 23. 10.: „daj minimálne 3 pills povinné“). Neblokuje odznačenie —
 *  len svieti, kým ich nie je dosť; nútiť pri odznačení by bolo otravné. */
const MIN_PERSONALITY = 3;

function PillPicker({ human, patchHuman }: { human: HumanProfile | undefined; patchHuman: (p: Partial<HumanProfile>) => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const selected = human?.personality ?? [];
  const customs = customPills(human);
  const total = selected.length + customs.length;
  const atMax = total >= MAX_PERSONALITY;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const saveCustoms = (list: string[]) => patchHuman({ customPersonality: list[0] || undefined, customExtra: list.slice(1) });
  const toggle = (v: PersonalityTag) => {
    if (selected.includes(v)) patchHuman({ personality: selected.filter((x) => x !== v) });
    else if (!atMax) patchHuman({ personality: [...selected, v] });
  };
  const commit = () => {
    const w = draft.trim().slice(0, 24);
    if (w && !atMax && !customs.includes(w)) saveCustoms([...customs, w]);
    setDraft('');
    setAdding(false);
  };
  const ordered = [...PERSONALITY_OPTIONS.filter((o) => selected.includes(o.value)), ...PERSONALITY_OPTIONS.filter((o) => !selected.includes(o.value))];

  return (
    <>
      {/* Bez nadpisu (jediný nadpis skupiny je O MNE) — len počítadlo; pod 3 svieti červeno (min. 3 povinné). */}
      <div className="pe-pills-h">
        {total < MIN_PERSONALITY ? <span className="pe-min">{tx('pack.edit.minPills', 'Pick at least 3')}</span> : <span />}
        <span style={{ fontFamily: FONT_UI, fontSize: PACK_TEXT.micro, color: total < MIN_PERSONALITY ? T.alertRed : atMax ? T.accentGold : T.inkFaint }}>{total}/{MAX_PERSONALITY}</span>
      </div>
      <div className="pe-pills">
        {adding ? (
          <span className="pe-own">
            <input
              autoFocus
              // Vlastné slovo (vôdzka) klávesnica prepisovala na „vodičku“ — Alenka 14. 10. 2026.
              autoCorrect="off"
              spellCheck={false}
              value={draft}
              maxLength={24}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commit(); }
                if (e.key === 'Escape') { setDraft(''); setAdding(false); }
              }}
              placeholder={tx('pack.profile.customPersonalityPlaceholder', 'Your own…')}
            />
          </span>
        ) : !atMax ? (
          <button type="button" className="pe-own" onClick={() => setAdding(true)}>{tx('pack.profile.addOwnPersonality', '＋ Add your own')}</button>
        ) : null}
        {customs.map((c) => (
          <button key={`c-${c}`} type="button" className="pf-pill is-selected inline-flex items-center gap-1"
            onClick={() => saveCustoms(customs.filter((x) => x !== c))}
            style={{ borderRadius: PACK_R.pill, padding: '4px 8px', fontFamily: FONT_UI, fontSize: PACK_TEXT.micro, fontWeight: 600, cursor: 'pointer' }}>
            <span aria-hidden>✏️</span>{c}<span aria-hidden style={{ opacity: 0.7 }}>✕</span>
          </button>
        ))}
        {ordered.map((opt) => {
          const on = selected.includes(opt.value);
          return <ProfilePill key={opt.value} option={opt} selected={on} disabled={!on && atMax} onClick={() => toggle(opt.value)} />;
        })}
      </div>
    </>
  );
}

// ČLEN SVORKY — jeden riadok s rozklikom (Matejova skica 23. 10.): kruh s fotkou · meno · šípka.
// Ten istý tvar pre JA, psa aj pawmata, aby sa svorka čítala ako jeden zoznam.
function MemberRow({ photo, initial, name, num, sub, angel = false, human = false, dim = false, aside, children }: {
  photo: string | null;
  /** Pilulka vpravo vedľa mena (JA = rola). Stojí MIMO ťuku na riadok, aby mala vlastný rozbaľovač. */
  aside?: React.ReactNode;
  initial?: string;
  name: string;
  num?: number | null;
  sub?: string;
  angel?: boolean;
  human?: boolean;
  dim?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const head = (
    <span className={`pe-mem${angel ? ' angel' : ''}${human ? ' hu' : ''}${dim ? ' dim' : ''}`}>
      <span className="c">{photo ? <img src={photo} alt="" /> : <i>{initial ?? ''}</i>}</span>
      <span>
        <b>{name}{num != null && <span className="pe-num">#{num}</span>}</b>
        {sub && <small>{sub}</small>}
      </span>
    </span>
  );
  if (aside) {
    return (
      <div className={`pe-dog${open ? ' open' : ''}`}>
        <div className="pe-dog-row">
          <button type="button" className="pe-dog-h" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{head}</button>
          {aside}
          <button type="button" className="pe-chev" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={name}>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        {open && <div className="pe-dog-b">{children}</div>}
      </div>
    );
  }
  return (
    <div className={`pe-dog${open ? ' open' : ''}`}>
      <button type="button" className="pe-dog-h" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={`pe-mem${angel ? ' angel' : ''}${human ? ' hu' : ''}${dim ? ' dim' : ''}`}>
          <span className="c">{photo ? <img src={photo} alt="" /> : <i>{initial ?? ''}</i>}</span>
          <span>
            <b>{name}{num != null && <span className="pe-num">#{num}</span>}</b>
            {sub && <small>{sub}</small>}
          </span>
        </span>
        <i aria-hidden><ChevronDown className="h-4 w-4" /></i>
      </button>
      {open && <div className="pe-dog-b">{children}</div>}
    </div>
  );
}

// PAWMATE NA PROFILE — voľba v rozkliku riadku JA (Matej 26. 10. 2026: *„jej fotka sa bude môcť dať zverejniť
// vedľa majiteľovej fotky v nastaveniach majiteľa … či ho uviesť v profile"*). Rozhoduje majiteľ; pawmate tu len
// vidí, kto ho ukázal. Ukázaný je najviac JEDEN (vedľa fotky je miesto na jedného človeka).
function ShowMates({ mates, isMate, beside, value, onChange }: { mates: MyPawmates | null; isMate: boolean; beside: Beside | null; value: string[]; onChange: (ids: string[]) => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  if (isMate) {
    return <p className="pe-hint" style={{ marginTop: 0 }}>{beside
      ? tx('pack.edit.mateShownBy', '{name} shows you on their profile, next to their photo.').replace('{name}', beside.label)
      : tx('pack.edit.mateNotShown', 'Your pawtner decides whether you appear on their profile.')}</p>;
  }
  const people = (mates?.people ?? []).filter((p) => p.kind === 'human' && p.user_id);
  if (!people.length) {
    return <p className="pe-hint" style={{ marginTop: 0 }}>{tx('pack.edit.mateNone', "When you have a pawmate, you can show their photo next to yours on the profile.")}</p>;
  }
  return (
    <>
      {people.map((p) => {
        const on = value.includes(p.user_id as string);
        return (
          <label key={p.user_id} className="pe-check">
            <input type="checkbox" checked={on} onChange={() => onChange(on ? [] : [p.user_id as string])} />
            <span>{tx('pack.edit.mateShow', 'Show {name} on my profile').replace('{name}', p.name || p.email || tx('pack.add.pawmate', 'Pawmate'))}</span>
          </label>
        );
      })}
    </>
  );
}

// ROLY — tri skupiny pilulek priamo v rozkliku riadku JA, každá s vetou, čo znamená (Matej 26. 10. 2026: *„výber
// s pills ROLA … pekne prehľadne rozpísal aj vysvetlil. Aká je tvoja rola v DOGYPTe, aký je tvoj prínos"*).
// Najviac DVE (23. 10.); tretí ťuk vytlačí najstaršiu, aby sa nemuselo odznačovať. Prázdne smie byť — postavenie
// (Pawtner/Pawmate) stojí pod menom vždy.
function RolePicker({ value, onChange }: { value: ProfileRole[]; onChange: (v: ProfileRole[]) => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const toggle = (r: ProfileRole) => onChange(value.includes(r) ? value.filter((x) => x !== r) : [...value, r].slice(-MAX_ROLES));
  return (
    <div className="pe-rolebox">
      <p className="pe-sec">{tx('pack.edit.roleTitle', 'Your role in DOGYPT')}</p>
      <p className="pe-hint" style={{ marginTop: 0 }}>{tx('pack.edit.roleHint', 'What do you bring to the pack? Pick up to two — they show under your name.')}</p>
      {ROLE_GROUPS.map((g) => (
        <div key={g.id} className="pe-rgrp">
          <b>{g.emoji} {tx(`pack.roleGroup.${g.id}`, g.id)}</b>
          <p className="pe-hint" style={{ margin: 0 }}>{tx(`pack.roleGroup.${g.id}Hint`, '')}</p>
          <div className="pe-dog-tags">
            {g.roles.map((r) => (
              <button key={r} type="button" onClick={() => toggle(r)} className={`pf-pill${value.includes(r) ? ' is-selected' : ''}`}
                style={{ borderRadius: PACK_R.pill, padding: '4px 8px', fontFamily: FONT_UI, fontSize: PACK_TEXT.label, fontWeight: value.includes(r) ? 600 : 500, cursor: 'pointer' }}>
                {ROLE_EMOJI[r]} {tx(`pack.role.${r}`, r)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// PRIDAŤ ČLENA (Matej 26. 10. 2026) — jedno lapisové tlačidlo, po ťuku dvoje dvere: PES (heroglyf) a ČLEN DOMÁCNOSTI
// (pawmate). Pod tým stručne, prečo má pes jedného pána, a upozornenie pre domácnosť s dvoma psami dvoch pánov.
// Pawmate pawmata nepridáva — vidí len dvere PES (vlastný pes = stane sa pawtnerom).
function AddMember({ isMate, open, onToggle, mateOpen, onMate, onDog }: {
  isMate: boolean; open: boolean; onToggle: () => void; mateOpen: boolean; onMate: () => void; onDog: () => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  return (
    <div className="pe-add">
      <button type="button" className="pe-addbtn" onClick={onToggle} aria-expanded={open}>
        <BrandIcon name="plus" size={16} tint="white" />{tx('pack.edit.addMember', 'Add a member')}
      </button>
      {open && (
        <>
          <p className="pe-explain">{tx('pack.edit.addWhy', 'In DOGYPT a dog has one master — the one who created its heroglyph. But at home we live with partners and family who love the dog too. Add them as a Pawmate.')}</p>
          <div className="pe-pick">
            <Link to="/heroglyph/name" onClick={onDog} className="pe-door pe-door2">
              <span><BrandIcon name="dogsphinx" size={20} tint="dim" />{tx('pack.hero.roleDog', 'Dog')}</span>
              <small>{tx('pack.edit.addDogHint', 'A new dog = its own heroglyph. You become its pawtner.')}</small>
            </Link>
            {!isMate && (
              <button type="button" className={`pe-door pe-door2${mateOpen ? ' on' : ''}`} onClick={onMate}>
                <span><BrandIcon name="add-user" size={16} tint={mateOpen ? 'white' : 'dim'} />{tx('pack.edit.addHousehold', 'Household member · Pawmate')}</span>
                <small>{tx('pack.edit.addHouseholdHint', 'Partner or family. Sees your pack and helps — changes only what you allow.')}</small>
              </button>
            )}
          </div>
          {!isMate && <p className="pe-warn">{tx('pack.edit.addWarn', 'Two dogs at home, each with a different master? Each master creates their own heroglyph first — then you connect the accounts.')}</p>}
        </>
      )}
    </div>
  );
}

// PES V SVORKE — riadok s rozbaľovačom (Matej 23. 10.: *„psy budú mať jeden riadok s dropdownom BIO a
// pillsy a možnosť otvoriť celý DOG ID"*). Bio a povaha sú TIE ISTÉ polia ako v DOG ID
// (`profile.dogs[id]`, `saveDogAttrs`) — upraví sa tu aj tam, jeden zdroj.
function DogEditRow({ dog, attrs, onDogId }: { dog: PackDogFull; attrs: DogProfileAttrs | undefined; onDogId: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const angel = dog.life_status === 'deceased';
  const tags = attrs?.tags?.temperament ?? [];
  const toggleTag = (g: DogTemperamentTag) => {
    const next = tags.includes(g) ? tags.filter((x) => x !== g) : [...tags, g];
    saveDogAttrs(dog.id, { tags: { temperament: next, trail: attrs?.tags?.trail ?? [] } });
  };
  return (
    <MemberRow
      photo={dog.cloudinary_main_url ? sizedUrl(dog.cloudinary_main_url, 140) : null}
      name={dog.dog_name ?? ''}
      num={dog.pack_number}
      sub={angel ? tx('pack.tree.angel', 'Angel') : undefined}
      angel={angel}
    >
      <WordLimitTextarea
        value={attrs?.bio ?? ''}
        onSave={(v) => saveDogAttrs(dog.id, { bio: v.trim().slice(0, 200) })}
        placeholder={tx('pack.edit.dogBioPh', "Dog's bio — what are they like?")}
        rows={3}
        white
      />
      <div className="pe-dog-tags">
        {DOG_TEMPERAMENT_TAGS.map((g) => (
          <button key={g} type="button" onClick={() => toggleTag(g)} className={`pf-pill${tags.includes(g) ? ' is-selected' : ''}`}
            style={{ borderRadius: PACK_R.pill, padding: '4px 8px', fontFamily: FONT_UI, fontSize: PACK_TEXT.micro, fontWeight: tags.includes(g) ? 600 : 500, cursor: 'pointer' }}>
            {tx(`pack.dogTag.${g}`, g)}
          </button>
        ))}
      </div>
      {/* Odkaz, nie pilulka — šípka hovorí, že ide na inú stránku (Matej 23. 10.). */}
      <button type="button" className="pe-link" onClick={onDogId}>
        {tx('pack.edit.openDogId', 'Full DOG ID')}<BrandIcon name="back" size={12} tint="dim" style={{ transform: 'rotate(180deg)' }} />
      </button>
    </MemberRow>
  );
}

// PAWMATE V SVORKE — riadok človeka alebo čakajúcej pozvánky. Rozklik = ku ktorým psom a čo smie
// + vyradiť / stiahnuť pozvánku. Jemné doladenie práv po psoch ostáva v DOG ID (`PawmatePanel`).
function MateRow({ mate, onChanged }: { mate: PawmateRow; onChanged: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { toast } = useToast();
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const invite = mate.kind === 'invite';
  const label = mate.name || mate.email || tx('pack.mate.someone', 'Pawmate');
  const remove = async () => {
    setBusy(true);
    try {
      for (const d of mate.dogs) {
        if (invite && d.invite_id) await revokeDogInvite(d.dog_id, d.invite_id);
        else if (!invite && mate.user_id) await revokePawmate(d.dog_id, mate.user_id);
      }
      onChanged();
    } finally { setBusy(false); setAsk(false); }
  };
  // PRÁVA SA SPRAVUJÚ TU (Matej 26. 10. 2026: *„pawmate … v rozkliku práva, nie len vymazať, ale aj práva, ktoré sme
  // jej dali na začiatku"*). Jedno nastavenie platí pre všetkých psov, ku ktorým pawmate stojí — jemné doladenie po
  // psoch ostáva v DOG ID (`PawmatePanel`). Pozvánka sa meniť nedá, kým ju človek neprijme (riadok ešte neexistuje).
  const [rights, setRights] = useState<PawmateRight[]>(() => PAWMATE_RIGHTS.filter((r) => mate.dogs.some((d) => d.rights?.[r])));
  const [role, setRole] = useState<PawmateRole>(() => (mate.role === 'family' ? 'family' : 'partner'));
  const save = async (nextRole: PawmateRole, next: PawmateRight[]) => {
    if (invite || !mate.user_id) return;
    setRole(nextRole); setRights(next);
    const map = Object.fromEntries(PAWMATE_RIGHTS.map((r) => [r, next.includes(r)]));
    try {
      for (const d of mate.dogs) await setPawmateAccess(d.dog_id, mate.user_id, nextRole, map);
    } catch (e) {
      toast({ title: tx('pack.profile.toastCouldNotSave', 'Could not save'), description: String((e as Error).message ?? e), variant: 'destructive' });
      onChanged();
    }
  };
  const flip = (r: PawmateRight) => save(role, rights.includes(r) ? rights.filter((x) => x !== r) : [...rights, r]);
  // K2 · NÁSTUPCA (26. 10. 2026): „{meno} prevezme {pes}" — po psoch, jeden nástupca na psa.
  // Je to záznam vôle; samotné prevzatie ostáva ručné (kolo 5 závetu).
  const [heirOf, setHeirOf] = useState<string[]>(() => mate.dogs.filter((d) => d.successor).map((d) => d.dog_id));
  const flipHeir = async (dogId: string) => {
    if (!mate.user_id) return;
    const on = !heirOf.includes(dogId);
    setHeirOf(on ? [...heirOf, dogId] : heirOf.filter((x) => x !== dogId));
    try { await setPawmateSuccessor(dogId, mate.user_id, on); } catch (e) {
      toast({ title: tx('pack.profile.toastCouldNotSave', 'Could not save'), description: String((e as Error).message ?? e), variant: 'destructive' });
      onChanged();
    }
  };
  const editable = PAWMATE_RIGHTS.filter((r) => r !== 'will');
  const roleName = tx(`pack.mate.role.${role}`, role === 'family' ? 'Family' : 'Partner');
  return (
    <MemberRow
      photo={mate.avatar_url ? sizedUrl(mate.avatar_url, 140) : null}
      initial={label.charAt(0).toUpperCase()}
      name={label}
      sub={invite ? tx('pack.mate.waiting', 'Waiting to accept')
        : [tx('pack.add.pawmate', 'Pawmate'), roleName, rights.length ? null : tx('pack.mate.viewOnly', 'view only')].filter(Boolean).join(' · ')}
      human
      dim={invite}
    >
      <div className="pe-dog-tags">
        {mate.dogs.map((d) => <span key={d.dog_id} className="pk-pill">{d.dog_name ?? tx('pack.mate.unnamedDog', 'Your dog')}</span>)}
      </div>
      {!invite && (
        <>
          <p className="pe-sec">{tx('pack.mate.whoTitle', 'Who they are to the pack')}</p>
          <div className="pe-pick two">
            {(['partner', 'family'] as const).map((r) => (
              <button key={r} type="button" className={`pe-door${role === r ? ' on' : ''}`} onClick={() => save(r, rights)}>
                {tx(`pack.mate.role.${r}`, r === 'family' ? 'Family' : 'Partner')}
              </button>
            ))}
          </div>
          <p className="pe-sec">{tx('pack.mate.rightsTitle', 'What they may change')}</p>
          <p className="pe-hint" style={{ marginTop: 0 }}>{tx('pack.mate.rightsHint', 'They see everything. Without a right they can only look.')}</p>
          <div>
            {editable.map((r) => (
              <label key={r} className="pe-check sub" style={{ paddingLeft: 0 }}>
                <input type="checkbox" checked={rights.includes(r)} onChange={() => flip(r)} />
                <span>{tx(RIGHT_LABEL[r][0], RIGHT_LABEL[r][1])}</span>
              </label>
            ))}
          </div>
          <p className="pe-hint">{tx('pack.mate.never', 'Never: payments, deleting a dog, adding people, the pack name.')}</p>
          <p className="pe-sec">{tx('pack.mate.heirTitle', 'Successor')}</p>
          <div>
            {mate.dogs.map((d) => (
              <label key={d.dog_id} className="pe-check sub" style={{ paddingLeft: 0 }}>
                <input type="checkbox" checked={heirOf.includes(d.dog_id)} onChange={() => flipHeir(d.dog_id)} />
                <span>{tx('pack.mate.heirTakes', '{name} takes over {dog}').replace('{name}', label).replace('{dog}', d.dog_name ?? tx('pack.mate.unnamedDog', 'Your dog'))}</span>
              </label>
            ))}
          </div>
          <p className="pe-hint" style={{ marginTop: 0 }}>{tx('pack.mate.heirHint', 'When you can no longer care for the dog. We confirm the takeover by hand — nothing moves on its own.')}</p>
        </>
      )}
      {ask ? (
        <div className="pe-me">
          <span className="pe-hint" style={{ margin: 0 }}>{invite ? tx('pack.mate.revokeAsk', 'Withdraw this invitation?') : tx('pack.mates.removeAsk', 'Remove {name} from the pack?').replace('{name}', label)}</span>
          {/* K4c: čo vyradenie znamená — nákres §3 „Vyradiť Lenku?“ */}
          {!invite && <span className="pe-hint" style={{ margin: 0 }}>{tx('pack.mates.removeHint', 'They get 3 days and can only ask you to delete their photos. Everything else stays yours.')}</span>}
          <span style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="pe-show pe-danger" disabled={busy} onClick={remove}>{invite ? tx('pack.mate.revokeYes', 'Withdraw') : tx('pack.mate.removeYes', 'Remove')}</button>
            <button type="button" className="pe-show" onClick={() => setAsk(false)}>{tx('pack.mate.cancel', 'Cancel')}</button>
          </span>
        </div>
      ) : (
        <div><button type="button" className="pe-show pe-danger" onClick={() => setAsk(true)}>{invite ? tx('pack.mate.revoke', 'Withdraw the invitation') : tx('pack.mates.removeAll', 'Remove from the pack')}</button></div>
      )}
    </MemberRow>
  );
}

// NOVÝ PAWMATE (Matej 23. 10., kolo 2): *„po kliknutí na +pawmate sa zobrazia len 2 možnosti — vytvoriť nové
// konto / prístup k záveti; až po výbere sa zroluje e-mail a prístup a vysvetlenie postupu … CTA sa mení"*.
// KONTO = pozvánka `invite-pawmate` (plný prístup alebo vybrané práva) · ZÁVET = edge `will`: dedič bez konta,
// odkaz v maili, heslo mu povie pawtner (`pages/PackWill.tsx`).
function MateForm({ dogs, lang, onDone }: { dogs: PackDogFull[]; lang: string; onDone: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [kind, setKind] = useState<'account' | 'will' | null>(null);
  if (!kind) {
    return (
      <div className="pe-mform">
        <div className="pe-pick">
          <button type="button" className="pe-door" onClick={() => setKind('account')}>
            <BrandIcon name="add-user" size={16} tint="dim" />{tx('pack.mate.kindAccount', 'New DOGYPT account')}
          </button>
          <button type="button" className="pe-door" onClick={() => setKind('will')}>
            <BrandIcon name="document" size={16} tint="dim" />{tx('pack.mate.kindWill', 'Access to the will')}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="pe-mform">
      <button type="button" className="pe-role" style={{ alignSelf: 'stretch', justifyContent: 'space-between' }} onClick={() => setKind(null)}>
        {kind === 'account' ? tx('pack.mate.kindAccount', 'New DOGYPT account') : tx('pack.mate.kindWill', 'Access to the will')}
        <ChevronDown aria-hidden className="h-3 w-3" style={{ transform: 'rotate(180deg)' }} />
      </button>
      {kind === 'account' ? <AccountForm dogs={dogs} onDone={onDone} /> : <WillForm dogs={dogs} lang={lang} onDone={onDone} />}
    </div>
  );
}

/** Hlavička skupiny — na mobile rozbaľovač (ikonka · nadpis · šípka), na PC len nadpis. */
function GroupHead({ icon, label, open, onToggle }: { icon: string; label: string; open: boolean; onToggle: () => void }) {
  // Zbalená skupina je na mobile CELÝ obsah bloku — nadpis musí niesť riadok sám (Matej 25. 10.: *„ak sú
  // colapsnuté, prijal by som výraznejšie písmo a ikonku"*). Tvar sekcie (.22em, verzálky) ostáva, len silnejší.
  return (
    <button type="button" className="pe-ghb" onClick={onToggle} aria-expanded={open}>
      <span><BrandIcon name={icon} size={22} tint="dark" /><span style={{ ...PACK_HEAD.section, fontSize: PACK_TEXT.label, fontWeight: 600, color: T.inkStrong }}>{label}</span></span>
      <span className="chev" aria-hidden><ChevronDown className="h-4 w-4" /></span>
    </button>
  );
}

/** Postup v číslovaných krokoch — čo sa stane po ťuku na CTA (Matej: „aby sme im to vysvetlili"). */
function Steps({ items }: { items: string[] }) {
  return <ol className="pe-steps">{items.map((s) => <li key={s}>{s}</li>)}</ol>;
}

function AccountForm({ dogs, onDone }: { dogs: PackDogFull[]; onDone: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [full, setFull] = useState(true);
  const [picked, setPicked] = useState<PawmateRight[]>([]);
  const [busy, setBusy] = useState(false);
  const ok = /\S+@\S+\.\S+/.test(email.trim()) && dogs.length > 0 && (full || picked.length > 0);
  const send = async () => {
    if (!ok || busy) return;
    setBusy(true);
    const rights = Object.fromEntries(PAWMATE_RIGHTS.map((r) => [r, full || picked.includes(r)]));
    const r = await invitePawmate(dogs.map((d) => d.id), email.trim(), 'partner', rights);
    setBusy(false);
    if (r.ok) {
      toast({ title: tx('pack.mate.sent', 'Invitation on its way to {email}.').replace('{email}', email.trim()) });
      onDone();
    } else {
      const code = 'code' in r ? r.code : 'internal';
      toast({ title: code === 'no_slots' ? tx('pack.mates.err.noSlots', 'That dog has no free place.') : tx('pack.profile.toastCouldNotSave', 'Could not save'), description: code, variant: 'destructive' });
    }
  };
  return (
    <>
      <input type="email" inputMode="email" autoComplete="off" className="pe-mail-in" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder={tx('pack.mate.emailPh', 'name@example.com')} aria-label={tx('pack.mate.emailLabel', "Pawmate's e-mail")} />
      <label className="pe-check">
        <input type="checkbox" checked={full} onChange={(e) => setFull(e.target.checked)} />
        <span>{tx('pack.edit.fullAccess', 'Full access')}</span>
        <ChevronDown aria-hidden className="h-3 w-3" style={{ marginLeft: 'auto', transform: full ? 'none' : 'rotate(180deg)' }} />
      </label>
      {!full && (
        <div className="pe-rights">
          {PAWMATE_RIGHTS.filter((r) => r !== 'will').map((r) => (
            <label key={r} className="pe-check sub">
              <input type="checkbox" checked={picked.includes(r)} onChange={() => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]))} />
              <span>{tx(RIGHT_LABEL[r][0], RIGHT_LABEL[r][1])}</span>
            </label>
          ))}
        </div>
      )}
      <Steps items={[
        tx('pack.mate.stepA1', 'An invitation with a personal link arrives at this e-mail right away.'),
        tx('pack.mate.stepA2', 'They click it and sign in without a password — the account is created on its own.'),
        tx('pack.mate.stepA3', 'They see your dogs and can do only what you allow. The link is valid for 7 days.'),
      ]} />
      <button type="button" className="pe-door on" disabled={!ok || busy} onClick={send} style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : tx('pack.mate.send', 'Send invitation')}
      </button>
    </>
  );
}

function WillForm({ dogs, lang, onDone }: { dogs: PackDogFull[]; lang: string; onDone: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { toast } = useToast();
  // LEN E-MAIL (Matej 23. 10., kolo 3: *„dajme to bez hesla … príde mu na mail a on si to vie otvoriť hneď"*).
  // Obsah závetu je v DOG ID; poistka proti zneužitiu = pawtnerovi príde upozornenie pri otvorení.
  // DVA e-maily — hlavný a záložný (Matej 23. 10., kolo 4: „pre istotu"). Záložný je nepovinný.
  const [email, setEmail] = useState('');
  const [email2, setEmail2] = useState('');
  const [busy, setBusy] = useState(false);
  const isMail = (v: string) => /\S+@\S+\.\S+/.test(v.trim());
  const ok = isMail(email) && (!email2.trim() || (isMail(email2) && email2.trim().toLowerCase() !== email.trim().toLowerCase())) && dogs.length > 0;
  const send = async () => {
    if (!ok || busy) return;
    setBusy(true);
    const r = await createWill({ dogIds: dogs.map((d) => d.id), heirEmail: email.trim(), heirEmail2: email2.trim() || undefined, lang });
    setBusy(false);
    if (r.ok) {
      toast({ title: tx('pack.wacc.sentTo', 'The will is on its way to {email}.').replace('{email}', email.trim()) });
      onDone();
    } else {
      toast({ title: r.code === 'self' ? tx('pack.wacc.errSelf', 'Pick someone other than yourself.') : tx('pack.profile.toastCouldNotSave', 'Could not save'), description: r.code, variant: 'destructive' });
    }
  };
  return (
    <>
      <input type="email" inputMode="email" autoComplete="off" className="pe-mail-in" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder={tx('pack.wacc.email1Ph', 'Main e-mail')} aria-label={tx('pack.wacc.email1Ph', 'Main e-mail')} />
      <input type="email" inputMode="email" autoComplete="off" className="pe-mail-in" value={email2}
        onChange={(e) => setEmail2(e.target.value)} placeholder={tx('pack.wacc.email2Ph', 'Backup e-mail (optional)')} aria-label={tx('pack.wacc.email2Ph', 'Backup e-mail (optional)')} />
      <Steps items={[
        tx('pack.wacc.step1', 'A link to your will arrives at this e-mail.'),
        tx('pack.wacc.step2', 'They open it with one tap — no account, no password. Before opening they confirm it is truly necessary, and you get notified.'),
        tx('pack.wacc.step3', 'They see the will from your dogs’ DOG ID. When you are gone, they ask to take over the dog through the same link; we verify it before anything is transferred.'),
        tx('pack.wacc.step4', 'They get no account and no access to your profile. You can cancel the will any time.'),
      ]} />
      <button type="button" className="pe-door on" disabled={!ok || busy} onClick={send} style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : tx('pack.wacc.send', 'Send the will')}
      </button>
    </>
  );
}

// DEDIČ ZÁVETU v svorke — riadok ako pawmate; rozklik = psy, otázka, stav a ZRUŠIŤ.
function WillMateRow({ will, dogs, onChanged }: { will: WillRow; dogs: PackDogFull[]; onChanged: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const state = will.status === 'declined' ? tx('pack.wacc.stDeclined', 'Declined')
    : will.claim_at ? tx('pack.wacc.stClaim', 'Asked to take over')
    : will.opened_at ? tx('pack.wacc.stOpened', 'Opened')
    : tx('pack.wacc.stSent', 'Sent');
  return (
    <MemberRow initial={will.heir_name.charAt(0).toUpperCase()} name={will.heir_name} photo={null}
      sub={`${tx('pack.wacc.title', 'Will')} · ${state}`} human dim={will.status === 'declined'}>
      <div className="pe-dog-tags">
        {dogs.filter((d) => will.dog_ids.includes(d.id)).map((d) => <span key={d.id} className="pk-pill">{d.dog_name}</span>)}
      </div>
      <p className="pe-hint" style={{ marginTop: 0 }}>{[will.heir_email, will.heir_email2].filter(Boolean).join(' · ')}</p>
      {ask ? (
        <div className="pe-me">
          <span className="pe-hint" style={{ margin: 0 }}>{tx('pack.wacc.revokeAsk', 'Cancel this will? The link stops working.')}</span>
          <span style={{ display: 'flex', gap: S.sm }}>
            <button type="button" className="pe-show pe-danger" disabled={busy}
              onClick={async () => { setBusy(true); await revokeWill(will.id); setBusy(false); setAsk(false); onChanged(); }}>
              {tx('pack.wacc.revokeYes', 'Cancel it')}
            </button>
            <button type="button" className="pe-show" onClick={() => setAsk(false)}>{tx('pack.mate.cancel', 'Cancel')}</button>
          </span>
        </div>
      ) : (
        <div><button type="button" className="pe-show pe-danger" onClick={() => setAsk(true)}>{tx('pack.wacc.revoke', 'Cancel the will')}</button></div>
      )}
    </MemberRow>
  );
}
