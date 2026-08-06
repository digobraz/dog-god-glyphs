// ŠTATISTIKY (ročný heatmap kalendár) — presunuté z karty psa do MY PACK 2026-08-06
// (Matej: „premiestni STATS do /DOGS ako posledné (coming soon)").
//
// PREČO SEM: kalendár je o RYTME MAJITEĽA (koľko dní zapísal), nie o údajoch jedného psa —
// na pet pase (výstup pre veterinára/opatrovateľa) nemal čo robiť. V hube stojí ako
// POSLEDNÝ blok, pod dlaždicami aj pod AINUBISOM: je to výhľad, nie akcia.
//
// ⚠️ Stále COMING SOON — dáta sa nikde nezbierajú, obsah je vyblednutá ukážka pod
// prekrytím. `statDemoColor()` vyrába DEMO farby, nie skutočné záznamy; nesmie sa to
// začať čítať ako pravda o psovi.
//
// Vytiahnuté 1:1 z `PackDogDetail.tsx` — z neho sa NEIMPORTUJE nič (~3200 riadkov, lazy).
import React, { useState } from 'react';
import { BrandIcon } from './BrandIcon';
import { PACK_THEME } from './packTheme';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

export function DogStats({ birthMonth = null, birthDay = null }: { birthMonth?: number | null; birthDay?: number | null }) {
  const t = useT();
  return (
        <section
          id="stats"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: T.cardGrad,
            border: `1.5px solid ${T.cardEdge}`,
            borderRadius: 16,
            padding: 24,
            boxShadow: T.cardShadow,
          }}
        >
          {/* Faded preview — STATS not live yet */}
          <div aria-hidden style={{ opacity: 0.38, filter: 'grayscale(0.4)', pointerEvents: 'none', userSelect: 'none' }}>
          {/* Big heading */}
          <div className="flex items-center gap-2.5" style={{ marginBottom: 4 }}>
            <BrandIcon name="bars" size={24} tint="gold" />
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: T.ink,
                lineHeight: 1.05,
              }}
            >
              {t('pack.dog.statsTitle')}
            </h2>
          </div>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12.5,
              color: T.inkDim,
              marginBottom: 18,
            }}
          >
            {t('pack.dog.statsDesc')}
          </p>

          {/* 67 / 33 split: calendar (left) · legend (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
            <div className="lg:col-span-2">
              <StatsCalendar birthMonth={birthMonth} birthDay={birthDay} />
            </div>
            <div className="lg:col-span-1">
              <StatsLegend onAdd={() => undefined} />
            </div>
          </div>
          </div>

          {/* Coming soon overlay */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ padding: 16 }}>
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: T.accentGold,
                background: 'rgba(255, 251, 242, 0.72)',
                border: '1px solid rgba(201, 154, 63, 0.40)',
                backdropFilter: 'blur(1px)',
                padding: '12px 26px',
                borderRadius: 999,
                boxShadow: '0 10px 30px -10px rgba(20, 8, 40, 0.35)',
              }}
            >
              {t('pack.dog.comingSoon')}
            </span>
          </div>
        </section>
  );
}

const GOLD_FILTER =
  'brightness(0) saturate(100%) invert(58%) sepia(56%) saturate(481%) hue-rotate(2deg) brightness(91%) contrast(86%)';

function getStatLegend(t: ReturnType<typeof useT>) {
  return [
    { label: t('pack.dog.legendTrip'), desc: t('pack.dog.legendTripDesc'), color: '#2E7D4F', icon: 'forest' },
    { label: t('pack.dog.legendWalk'), desc: t('pack.dog.legendWalkDesc'), color: '#7FB04A', icon: 'paw' },
    { label: t('pack.dog.legendStroll'), desc: t('pack.dog.legendStrollDesc'), color: '#E6B23A', icon: 'walk' },
    { label: t('pack.dog.legendVet'), desc: t('pack.dog.legendVetDesc'), color: '#3B82C4', icon: 'vet' },
    { label: t('pack.dog.legendBirthday'), desc: t('pack.dog.legendBirthdayDesc'), color: '#8B5CF6', icon: 'star' },
    { label: t('pack.dog.legendHumanYear'), desc: t('pack.dog.legendHumanYearDesc'), color: '#EC6FA6', icon: 'sun' },
  ];
}

const BIRTHDAY_PURPLE = '#8B5CF6';
const HUMAN_YEAR_PINK = '#EC6FA6';

function statDemoColor(i: number): string {
  if (i === 96 || i === 286) return '#3B82C4'; // vet visits (demo until real log)
  const v = (i * 37 + 13) % 19;
  if (v < 2) return '#2E7D4F';
  if (v < 6) return '#7FB04A';
  if (v < 9) return '#E6B23A';
  return 'rgba(31, 26, 14, 0.06)'; // rest day — neutral, never red
}

function getStatMonths(t: ReturnType<typeof useT>): [string, number][] {
  return [
    [t('pack.dog.monthJan'), 31], [t('pack.dog.monthFeb'), 28], [t('pack.dog.monthMar'), 31],
    [t('pack.dog.monthApr'), 30], [t('pack.dog.monthMay'), 31], [t('pack.dog.monthJun'), 30],
    [t('pack.dog.monthJul'), 31], [t('pack.dog.monthAug'), 31], [t('pack.dog.monthSep'), 30],
    [t('pack.dog.monthOct'), 31], [t('pack.dog.monthNov'), 30], [t('pack.dog.monthDec'), 31],
  ];
}

function StatsCalendar({ birthMonth, birthDay }: { birthMonth: number | null; birthDay: number | null }) {
  const t = useT();
  const STAT_MONTHS = getStatMonths(t);
  let offset = 0;
  const rows = STAT_MONTHS.map(([name, days]) => {
    const base = offset;
    offset += days;
    return { name, days, base };
  });
  const YEAR = offset; // 365

  // Real birthday + 6 human-year birthdays (year axis split into 7).
  let birthDoy: number | null = null;
  if (birthMonth && birthDay && birthMonth >= 1 && birthMonth <= 12) {
    birthDoy = rows[birthMonth - 1].base + (birthDay - 1);
  }
  const pinkSet = new Set<number>();
  if (birthDoy !== null) {
    for (let k = 1; k < 7; k++) pinkSet.add((birthDoy + Math.round((k * YEAR) / 7)) % YEAR);
  }

  const cellColor = (i: number): string => {
    if (i === birthDoy) return BIRTHDAY_PURPLE;
    if (pinkSet.has(i)) return HUMAN_YEAR_PINK;
    return statDemoColor(i);
  };

  return (
    <div className="flex flex-col" style={{ gap: 3 }}>
      {/* day numbers 1–31 header */}
      <div className="flex items-center" style={{ gap: 7, marginBottom: 2 }}>
        <span style={{ width: 28, flexShrink: 0 }} />
        <div className="flex" style={{ gap: 3, flex: 1, minWidth: 0 }}>
          {Array.from({ length: 31 }).map((_, d) => (
            <span
              key={d}
              style={{
                flex: '1 1 0',
                minWidth: 0,
                textAlign: 'center',
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 7,
                color: T.inkFaint,
              }}
            >
              {d + 1}
            </span>
          ))}
        </div>
      </div>

      {/* 12 month rows — flexible cells, fits without horizontal scroll */}
      {rows.map((m) => (
        <div key={m.name} className="flex items-center" style={{ gap: 7 }}>
          <span
            style={{
              width: 28,
              flexShrink: 0,
              fontFamily: "'Cinzel', serif",
              fontSize: 9,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: T.inkFaint,
            }}
          >
            {m.name}
          </span>
          <div className="flex" style={{ gap: 3, flex: 1, minWidth: 0 }}>
            {Array.from({ length: 31 }).map((_, d) => (
              <span
                key={d}
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  aspectRatio: '1 / 1',
                  borderRadius: 3,
                  background: d < m.days ? cellColor(m.base + d) : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsLegend({ onAdd }: { onAdd: () => void }) {
  const t = useT();
  const STAT_LEGEND = getStatLegend(t);
  return (
    <div className="flex flex-col gap-2">
      <div
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: T.inkDim,
          marginBottom: 2,
        }}
      >
        {t('pack.dog.legend')}
      </div>

      {STAT_LEGEND.map((l) => (
        <div key={l.label} className="flex items-center gap-2.5">
          <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, background: l.color }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, fontWeight: 700, color: T.ink, lineHeight: 1.1 }}>
              {l.label}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: T.inkFaint }}>{l.desc}</div>
          </div>
        </div>
      ))}

      {/* Add custom activity — coming soon */}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-3"
        style={{
          marginTop: 4,
          padding: '8px 8px',
          borderRadius: 11,
          border: `1.5px dashed ${T.border}`,
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          className="inline-flex items-center justify-center"
          style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, border: `1px dashed ${T.border}` }}
        >
          <img src="/icons/pack/plus.svg" alt="" style={{ width: 16, height: 16, filter: GOLD_FILTER }} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, fontWeight: 700, color: T.ink, lineHeight: 1.1 }}>
            {t('pack.dog.addActivity')}
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: T.inkFaint }}>
            {t('pack.dog.addActivityDesc')}
          </div>
        </div>
      </button>
    </div>
  );
}
