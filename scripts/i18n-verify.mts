// Full parity + integrity verify across all 18 locales. Run: npx tsx scripts/i18n-verify.mts
import { en } from '../src/i18n/locales/en';
const enMap = en as Record<string, string>;
const masterKeys = Object.keys(enMap);
const ALL = ['sk','cs','pol','ukr','deu','esp','fra','prt','rus','ita','chn','jpn','ind','ara','kor','nld','tur'];

// placeholders + html tags in a value
const ph = (s: string) => (String(s).match(/\{[a-zA-Z]+\}/g) || []).sort();
const tags = (s: string) => (String(s).match(/<[^>]+>/g) || []).map(t => t.replace(/\s+/g,' ')).sort();

let problems = 0;
for (const code of ALL) {
  const mod = await import(`../src/i18n/locales/${code}`);
  const d = (mod[code] ?? mod.default) as Record<string, string>;
  const keys = Object.keys(d);
  const missing = masterKeys.filter(k => !(k in d));
  const extra = keys.filter(k => !(k in enMap));
  // placeholder / tag mismatches vs EN
  let phMis = 0, tagMis = 0;
  const phExamples: string[] = [], tagExamples: string[] = [];
  for (const k of masterKeys) {
    if (!(k in d)) continue;
    if (JSON.stringify(ph(enMap[k])) !== JSON.stringify(ph(d[k]))) { phMis++; if (phExamples.length<3) phExamples.push(k); }
    if (JSON.stringify(tags(enMap[k])) !== JSON.stringify(tags(d[k]))) { tagMis++; if (tagExamples.length<3) tagExamples.push(k); }
  }
  const ok = missing.length===0 && extra.length===0 && phMis===0 && tagMis===0;
  if (!ok) problems++;
  console.log(`${ok?'✓':'✗'} ${code.padEnd(4)} keys ${keys.length}/${masterKeys.length} | missing ${missing.length} | extra ${extra.length} | ph-mismatch ${phMis}${phExamples.length?' ['+phExamples.join(', ')+']':''} | tag-mismatch ${tagMis}${tagExamples.length?' ['+tagExamples.join(', ')+']':''}`);
}
console.log(`\n${problems===0?'ALL CLEAN':problems+' locale(s) with issues'} · master ${masterKeys.length} keys`);
