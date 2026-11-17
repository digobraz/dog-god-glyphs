// Stráž prvej pomoci: SK · EN · CS musia mať tie isté karty, rovnaký počet krokov a položiek a tie isté obrázky.
// Preklad, ktorý stratí krok, je v núdzi horší než žiadny preklad.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AID_SK, AID_LINKS_SK } from '@/components/pack/sos/aid/aidSk';
import { AID_EN, AID_LINKS_EN } from '@/components/pack/sos/aid/aidEn';
import { AID_CS, AID_LINKS_CS } from '@/components/pack/sos/aid/aidCs';
import type { AidCard, AidLinks } from '@/components/pack/sos/aid/aidTypes';

const shape = (c: AidCard) => ({
  id: c.id,
  group: c.group,
  img: c.img,
  sub: !!c.sub,
  fotky: c.fotky?.map((f) => [f.src, f.znak ?? '']),
  porovnanie: c.porovnanie?.img,
  dalsi: c.dalsi?.map((d) => [d.img, !!d.t]),
  vet: c.vet && [c.vet.items.length, !!c.vet.pre, !!c.vet.post],
  spoznas: c.spoznas?.length,
  lead: c.lead?.length,
  kroky: c.kroky?.length,
  zoznam: c.zoznam?.length,
  posledne: c.posledne?.img,
  fakty: c.fakty?.length,
  extra: c.extra?.map((e) => [!!e.t, e.items?.length ?? 0, !!e.pills, !!e.after, !!e.warn]),
  nikdy: c.nikdy?.length,
  bezSignalu: !!c.bezSignalu,
});

const allText = (cards: AidCard[]) => JSON.stringify(cards);
const linkHits = (cards: AidCard[], links: AidLinks) => links.map(([re, id]) => [id, (allText(cards).match(new RegExp(re.source, 'g')) ?? []).length]);

describe('prvá pomoc · obsah', () => {
  it('EN a CS majú rovnaký tvar ako SK', () => {
    expect(AID_EN.map(shape)).toEqual(AID_SK.map(shape));
    expect(AID_CS.map(shape)).toEqual(AID_SK.map(shape));
  });
  it('každý obrázok je v public/', () => {
    const imgs = AID_SK.flatMap((c) => [c.img, c.porovnanie?.img, c.posledne?.img, ...(c.fotky ?? []).map((f) => f.src), ...(c.dalsi ?? []).map((d) => d.img)]).filter(Boolean) as string[];
    const missing = imgs.filter((p) => !existsSync(resolve(__dirname, '../../public', p.slice(1))));
    expect(missing).toEqual([]);
  });
  it('odkazy medzi kartami sa v každom jazyku nájdu rovnako často', () => {
    const sk = linkHits(AID_SK, AID_LINKS_SK);
    expect(sk.every(([, n]) => (n as number) > 0)).toBe(true);
    expect(linkHits(AID_EN, AID_LINKS_EN)).toEqual(sk);
    expect(linkHits(AID_CS, AID_LINKS_CS)).toEqual(sk);
  });
});
