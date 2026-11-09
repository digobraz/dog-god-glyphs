// GENEROVANÉ: scripts/gen-dogid-flow.mjs. Needituj ručne; texty sú v plany/nakres-kvizy-dogid-2026-11-01/spec.json.
import type { FlowScreen } from './flowTypes';

export const FLOW_SCREENS: FlowScreen[] = [
 {
  "id": "z-prez",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.z_prez.t",
  "s": "pack.flow.z_prez.s",
  "sec": "pack.flow.sec.Ktoje",
  "secE": "🐾",
  "art": "k0-zrkadlo",
  "fields": [
   {
    "field": "basics.nicknames",
    "l": "pack.flow.z_prez.f0",
    "ph": "pack.flow.z_prez.f0.ph"
   }
  ]
 },
 {
  "id": "z-size",
  "flow": "base",
  "kind": "size",
  "t": "pack.flow.z_size.t",
  "s": "pack.flow.z_size.s",
  "sec": "pack.flow.sec.Ktoje",
  "secE": "🐾",
  "art": "k0-zrkadlo",
  "field": "basics.size",
  "opts": [
   {
    "v": "S",
    "t": "pack.flow.z_size.o.S",
    "d": "pack.flow.z_size.o.S.d"
   },
   {
    "v": "M",
    "t": "pack.flow.z_size.o.M",
    "d": "pack.flow.z_size.o.M.d"
   },
   {
    "v": "L",
    "t": "pack.flow.z_size.o.L",
    "d": "pack.flow.z_size.o.L.d"
   },
   {
    "v": "XL",
    "t": "pack.flow.z_size.o.XL",
    "d": "pack.flow.z_size.o.XL.d"
   }
  ]
 },
 {
  "id": "z-kastr",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_kastr.t",
  "sec": "pack.flow.sec.Ktoje",
  "secE": "🐾",
  "art": "k0-zrkadlo",
  "field": "basics.neutered",
  "opts": [
   {
    "v": "yes",
    "t": "pack.flow.z_kastr.o.yes",
    "e": "✂️",
    "warn": "pack.flow.z_kastr.o.yes.warn",
    "warnT": "pack.flow.z_kastr.o.yes.warnT",
    "reveal": {
     "ph": "pack.flow.z_kastr.o.yes.ph",
     "field": "basics.neuterAge",
     "chips": [
      {
       "v": "neviem",
       "t": "pack.flow.z_kastr.o.yes.c0"
      }
     ]
    }
   },
   {
    "v": "no",
    "t": "pack.flow.z_kastr.o.no",
    "e": "🌰",
    "sub": {
     "field": "basics.breedingPlan",
     "opts": [
      {
       "v": "kennel",
       "t": "pack.flow.z_kastr.o.no.sub.kennel",
       "warn": "pack.flow.z_kastr.o.no.sub.kennel.warn",
       "warnT": "pack.flow.z_kastr.o.no.sub.kennel.warnT"
      },
      {
       "v": "plan_neuter",
       "t": "pack.flow.z_kastr.o.no.sub.plan_neuter",
       "warn": "pack.flow.z_kastr.o.no.sub.plan_neuter.warn",
       "warnT": "pack.flow.z_kastr.o.no.sub.plan_neuter.warnT"
      },
      {
       "v": "puppies",
       "t": "pack.flow.z_kastr.o.no.sub.puppies",
       "warn": "pack.flow.z_kastr.o.no.sub.puppies.warn",
       "warnT": "pack.flow.z_kastr.o.no.sub.puppies.warnT"
      }
     ]
    }
   }
  ]
 },
 {
  "id": "z-povod",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_povod.t",
  "sec": "pack.flow.sec.Ktoje",
  "secE": "🐾",
  "art": "k0-zrkadlo",
  "field": "basics.origin",
  "opts": [
   {
    "v": "breeder",
    "t": "pack.flow.z_povod.o.breeder",
    "e": "📄",
    "reveal": {
     "ph": "pack.flow.z_povod.o.breeder.ph",
     "field": "basics.originNote"
    }
   },
   {
    "v": "shelter",
    "t": "pack.flow.z_povod.o.shelter",
    "e": "❤️‍🩹",
    "reveal": {
     "ph": "pack.flow.z_povod.o.shelter.ph",
     "field": "basics.originNote"
    }
   },
   {
    "v": "loving_family",
    "t": "pack.flow.z_povod.o.loving_family",
    "e": "🏡",
    "reveal": {
     "ph": "pack.flow.z_povod.o.loving_family.ph",
     "field": "basics.originNote"
    }
   },
   {
    "v": "street",
    "t": "pack.flow.z_povod.o.street",
    "e": "💢",
    "reveal": {
     "ph": "pack.flow.z_povod.o.street.ph",
     "field": "basics.originNote"
    }
   },
   {
    "v": "other",
    "t": "pack.flow.z_povod.o.other",
    "e": "✏️",
    "reveal": {
     "ph": "pack.flow.z_povod.o.other.ph",
     "field": "basics.originNote"
    }
   }
  ]
 },
 {
  "id": "z-odkedy",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.z_odkedy.t",
  "s": "pack.flow.z_odkedy.s",
  "sec": "pack.flow.sec.Ktoje",
  "secE": "🐾",
  "art": "k0-zrkadlo",
  "fields": [
   {
    "field": "basics.since",
    "l": "pack.flow.z_odkedy.f0",
    "type": "date"
   }
  ]
 },
 {
  "id": "z-cip",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.z_cip.t",
  "s": "pack.flow.z_cip.s",
  "sec": "pack.flow.sec.Ktoje",
  "secE": "🐾",
  "art": "k0-zrkadlo",
  "fields": [
   {
    "field": "basics.chip",
    "l": "pack.flow.z_cip.f0",
    "ph": "pack.flow.z_cip.f0.ph"
   }
  ]
 },
 {
  "id": "z-kond",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_kond.t",
  "sec": "pack.flow.sec.Pohyb",
  "secE": "🥾",
  "art": "k2-kresba",
  "field": "howWorks.fitness",
  "opts": [
   {
    "v": "full",
    "t": "pack.flow.z_kond.o.full",
    "e": "💪"
   },
   {
    "v": "normal",
    "t": "pack.flow.z_kond.o.normal",
    "e": "🐾"
   },
   {
    "v": "take_it_easy",
    "t": "pack.flow.z_kond.o.take_it_easy",
    "e": "🪫"
   },
   {
    "v": "limited",
    "t": "pack.flow.z_kond.o.limited",
    "e": "♿",
    "reveal": {
     "ph": "pack.flow.z_kond.o.limited.ph",
     "field": "howWorks.fitnessNote"
    }
   }
  ]
 },
 {
  "id": "z-km",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_km.t",
  "sec": "pack.flow.sec.Pohyb",
  "secE": "🥾",
  "art": "k2-kresba",
  "field": "howWorks.range",
  "opts": [
   {
    "v": "short",
    "t": "pack.flow.z_km.o.short",
    "e": "🛋️"
   },
   {
    "v": "r5",
    "t": "pack.flow.z_km.o.r5",
    "e": "🌳"
   },
   {
    "v": "r15",
    "t": "pack.flow.z_km.o.r15",
    "e": "🥾"
   },
   {
    "v": "r30",
    "t": "pack.flow.z_km.o.r30",
    "e": "⛰️"
   },
   {
    "v": "all_day",
    "t": "pack.flow.z_km.o.all_day",
    "e": "🏔️"
   }
  ]
 },
 {
  "id": "z-posl",
  "flow": "base",
  "kind": "matrix",
  "t": "pack.flow.z_posl.t",
  "sec": "pack.flow.sec.Pohyb",
  "secE": "🥾",
  "art": "k2-kresba",
  "rows": [
   {
    "field": "howWorks.obedience",
    "l": "pack.flow.z_posl.r0",
    "vals": [
     {
      "v": "green",
      "t": "pack.flow.z_posl.r0.v0"
     },
     {
      "v": "amber",
      "t": "pack.flow.z_posl.r0.v1"
     },
     {
      "v": "red",
      "t": "pack.flow.z_posl.r0.v2"
     }
    ],
    "e": "🏠",
    "noteField": "howWorks.obedienceNote"
   },
   {
    "field": "howWorks.obedienceLeash",
    "l": "pack.flow.z_posl.r1",
    "vals": [
     {
      "v": "green",
      "t": "pack.flow.z_posl.r1.v0"
     },
     {
      "v": "amber",
      "t": "pack.flow.z_posl.r1.v1"
     },
     {
      "v": "red",
      "t": "pack.flow.z_posl.r1.v2"
     }
    ],
    "e": "🦮",
    "noteField": "howWorks.obedienceLeashNote"
   },
   {
    "field": "howWorks.obedienceOff",
    "l": "pack.flow.z_posl.r2",
    "vals": [
     {
      "v": "green",
      "t": "pack.flow.z_posl.r2.v0"
     },
     {
      "v": "amber",
      "t": "pack.flow.z_posl.r2.v1"
     },
     {
      "v": "red",
      "t": "pack.flow.z_posl.r2.v2"
     }
    ],
    "e": "🏞️",
    "noteField": "howWorks.obedienceOffNote"
   },
   {
    "field": "howWorks.recall",
    "l": "pack.flow.z_posl.r3",
    "vals": [
     {
      "v": "green",
      "t": "pack.flow.z_posl.r3.v0"
     },
     {
      "v": "amber",
      "t": "pack.flow.z_posl.r3.v1"
     },
     {
      "v": "red",
      "t": "pack.flow.z_posl.r3.v2"
     }
    ],
    "e": "📢",
    "noteField": "howWorks.recallNote"
   }
  ],
  "colored": true
 },
 {
  "id": "z-uci",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_uci.t",
  "sec": "pack.flow.sec.Pohyb",
  "secE": "🥾",
  "art": "k2-kresba",
  "field": "howWorks.learning",
  "opts": [
   {
    "v": "quick",
    "t": "pack.flow.z_uci.o.quick",
    "e": "🎓"
   },
   {
    "v": "short_focus",
    "t": "pack.flow.z_uci.o.short_focus",
    "e": "⏳"
   },
   {
    "v": "excited",
    "t": "pack.flow.z_uci.o.excited",
    "e": "🌀"
   },
   {
    "v": "scattered",
    "t": "pack.flow.z_uci.o.scattered",
    "e": "🦋"
   },
   {
    "v": "own_way",
    "t": "pack.flow.z_uci.o.own_way",
    "e": "😏"
   }
  ]
 },
 {
  "id": "z-povely",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.z_povely.t",
  "sec": "pack.flow.sec.Pohyb",
  "secE": "🥾",
  "art": "k2-kresba",
  "add": true,
  "noteOpen": true,
  "notePh": "pack.flow.z_povely.note",
  "field": "howWorks.commands",
  "opts": [
   {
    "v": "sit",
    "t": "pack.flow.z_povely.o.sit",
    "e": "🪑"
   },
   {
    "v": "down",
    "t": "pack.flow.z_povely.o.down",
    "e": "🛏️"
   },
   {
    "v": "come",
    "t": "pack.flow.z_povely.o.come",
    "e": "📣"
   },
   {
    "v": "stay",
    "t": "pack.flow.z_povely.o.stay",
    "e": "✋"
   },
   {
    "v": "place",
    "t": "pack.flow.z_povely.o.place",
    "e": "📍"
   },
   {
    "v": "heel",
    "t": "pack.flow.z_povely.o.heel",
    "e": "🦶"
   },
   {
    "v": "leave_it",
    "t": "pack.flow.z_povely.o.leave_it",
    "e": "🚫"
   },
   {
    "v": "paw",
    "t": "pack.flow.z_povely.o.paw",
    "e": "🐾"
   },
   {
    "v": "give",
    "t": "pack.flow.z_povely.o.give",
    "e": "🤲"
   },
   {
    "v": "fetch",
    "t": "pack.flow.z_povely.o.fetch",
    "e": "🎾"
   },
   {
    "v": "drop",
    "t": "pack.flow.z_povely.o.drop",
    "e": "👐"
   },
   {
    "v": "bark",
    "t": "pack.flow.z_povely.o.bark",
    "e": "🎶"
   }
  ]
 },
 {
  "id": "x-auto",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.x_auto.t",
  "sec": "pack.flow.sec.Pohyb",
  "secE": "🥾",
  "art": "k3-kresba",
  "add": true,
  "field": "howWorks.travel",
  "opts": [
   {
    "v": "car_ok",
    "t": "pack.flow.x_auto.o.car_ok",
    "e": "🚗",
    "reveal": {
     "ph": "pack.flow.x_auto.o.car_ok.ph",
     "field": "howWorks.travelNote",
     "chips": [
      {
       "v": "vkufrialeboboxe",
       "t": "pack.flow.x_auto.o.car_ok.c0"
      },
      {
       "v": "nazadnychsedadlach",
       "t": "pack.flow.x_auto.o.car_ok.c1"
      },
      {
       "v": "vpredupodnohami",
       "t": "pack.flow.x_auto.o.car_ok.c2"
      },
      {
       "v": "ine",
       "t": "pack.flow.x_auto.o.car_ok.c3"
      }
     ],
     "chipsField": "howWorks.travelSeat"
    }
   },
   {
    "v": "car_sick",
    "t": "pack.flow.x_auto.o.car_sick",
    "e": "🤢"
   },
   {
    "v": "car_barks",
    "t": "pack.flow.x_auto.o.car_barks",
    "e": "📢"
   },
   {
    "v": "train",
    "t": "pack.flow.x_auto.o.train",
    "e": "🚆"
   },
   {
    "v": "cableway",
    "t": "pack.flow.x_auto.o.cableway",
    "e": "🚡"
   },
   {
    "v": "never",
    "t": "pack.flow.x_auto.o.never",
    "e": "🏠",
    "none": true
   }
  ]
 },
 {
  "id": "z-von",
  "flow": "base",
  "kind": "matrix",
  "t": "pack.flow.z_von.t",
  "sec": "pack.flow.sec.Rezim",
  "secE": "🕰️",
  "art": "k3-kresba",
  "rows": [
   {
    "field": "food.walks",
    "l": "pack.flow.z_von.r0",
    "vals": [
     {
      "v": "1",
      "t": "pack.flow.z_von.r0.v0"
     },
     {
      "v": "2",
      "t": "pack.flow.z_von.r0.v1"
     },
     {
      "v": "3",
      "t": "pack.flow.z_von.r0.v2"
     },
     {
      "v": "4plus",
      "t": "pack.flow.z_von.r0.v3"
     }
    ],
    "e": "🔁"
   },
   {
    "field": "food.walkTime",
    "l": "pack.flow.z_von.r1",
    "vals": [
     {
      "v": "30",
      "t": "pack.flow.z_von.r1.v0"
     },
     {
      "v": "60",
      "t": "pack.flow.z_von.r1.v1"
     },
     {
      "v": "120",
      "t": "pack.flow.z_von.r1.v2"
     },
     {
      "v": "more",
      "t": "pack.flow.z_von.r1.v3"
     }
    ],
    "e": "⏱️"
   }
  ]
 },
 {
  "id": "z-den",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_den.t",
  "sec": "pack.flow.sec.Rezim",
  "secE": "🕰️",
  "art": "k4-kresba",
  "field": "routine.daytime",
  "opts": [
   {
    "v": "with_me",
    "t": "pack.flow.z_den.o.with_me",
    "e": "🏡"
   },
   {
    "v": "work",
    "t": "pack.flow.z_den.o.work",
    "e": "💼"
   },
   {
    "v": "with_other",
    "t": "pack.flow.z_den.o.with_other",
    "e": "👨‍👩‍👧"
   },
   {
    "v": "alone",
    "t": "pack.flow.z_den.o.alone",
    "e": "🚪",
    "reveal": {
     "ph": "pack.flow.z_den.o.alone.ph",
     "field": "routine.daytimeNote"
    }
   },
   {
    "v": "varies",
    "t": "pack.flow.z_den.o.varies",
    "e": "🔀",
    "reveal": {
     "ph": "pack.flow.z_den.o.varies.ph",
     "field": "routine.daytimeNote"
    }
   }
  ]
 },
 {
  "id": "z-sam",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_sam.t",
  "sec": "pack.flow.sec.Rezim",
  "secE": "🕰️",
  "art": "k3-kresba",
  "field": "howWorks.alone",
  "opts": [
   {
    "v": "fine",
    "t": "pack.flow.z_sam.o.fine",
    "e": "😌"
   },
   {
    "v": "a_while",
    "t": "pack.flow.z_sam.o.a_while",
    "e": "⏱️"
   },
   {
    "v": "cannot",
    "t": "pack.flow.z_sam.o.cannot",
    "e": "😢"
   },
   {
    "v": "never",
    "t": "pack.flow.z_sam.o.never",
    "e": "🤝"
   }
  ]
 },
 {
  "id": "x-spi",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.x_spi.t",
  "sec": "pack.flow.sec.Rezim",
  "secE": "🕰️",
  "art": "k3-kresba",
  "field": "routine.sleep",
  "opts": [
   {
    "v": "bed",
    "t": "pack.flow.x_spi.o.bed",
    "e": "🛏️"
   },
   {
    "v": "bedroom",
    "t": "pack.flow.x_spi.o.bedroom",
    "e": "🌙"
   },
   {
    "v": "elsewhere",
    "t": "pack.flow.x_spi.o.elsewhere",
    "e": "🏠"
   },
   {
    "v": "crate",
    "t": "pack.flow.x_spi.o.crate",
    "e": "📦"
   },
   {
    "v": "outside",
    "t": "pack.flow.x_spi.o.outside",
    "e": "🛖"
   }
  ]
 },
 {
  "id": "z-rezim",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.z_rezim.t",
  "sec": "pack.flow.sec.Rezim",
  "secE": "🕰️",
  "art": "k2-kresba",
  "fields": [
   {
    "field": "routine.morning",
    "l": "pack.flow.z_rezim.f0",
    "ph": "pack.flow.z_rezim.f0.ph"
   },
   {
    "field": "routine.day",
    "l": "pack.flow.z_rezim.f1",
    "ph": "pack.flow.z_rezim.f1.ph"
   },
   {
    "field": "routine.evening",
    "l": "pack.flow.z_rezim.f2",
    "ph": "pack.flow.z_rezim.f2.ph"
   },
   {
    "field": "routine.night",
    "l": "pack.flow.z_rezim.f3",
    "ph": "pack.flow.z_rezim.f3.ph"
   }
  ]
 },
 {
  "id": "z-psy",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_psy.t",
  "sec": "pack.flow.sec.Vztahy",
  "secE": "🤝",
  "art": "k1-kresba",
  "field": "social.dogs",
  "opts": [
   {
    "v": "green",
    "t": "pack.flow.z_psy.o.green",
    "e": "🥰"
   },
   {
    "v": "tolerates",
    "t": "pack.flow.z_psy.o.tolerates",
    "e": "😐"
   },
   {
    "v": "amber",
    "t": "pack.flow.z_psy.o.amber",
    "e": "🤔",
    "reveal": {
     "ph": "pack.flow.z_psy.o.amber.ph",
     "field": "social.dogsNote",
     "chips": [
      {
       "v": "velkost",
       "t": "pack.flow.z_psy.o.amber.c0"
      },
      {
       "v": "pohlavie",
       "t": "pack.flow.z_psy.o.amber.c1"
      },
      {
       "v": "energiadruhehopsa",
       "t": "pack.flow.z_psy.o.amber.c2"
      },
      {
       "v": "navoditku",
       "t": "pack.flow.z_psy.o.amber.c3"
      },
      {
       "v": "znamiacudzi",
       "t": "pack.flow.z_psy.o.amber.c4"
      }
     ],
     "chipsField": "social.dogsDepends"
    }
   },
   {
    "v": "red",
    "t": "pack.flow.z_psy.o.red",
    "e": "🙅"
   },
   {
    "v": "unknown",
    "t": "pack.flow.z_psy.o.unknown",
    "e": "❓"
   }
  ]
 },
 {
  "id": "z-deti",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_deti.t",
  "sec": "pack.flow.sec.Vztahy",
  "secE": "🤝",
  "art": "k3-kresba",
  "field": "social.kids",
  "opts": [
   {
    "v": "green",
    "t": "pack.flow.z_deti.o.green",
    "e": "🥰"
   },
   {
    "v": "tolerates",
    "t": "pack.flow.z_deti.o.tolerates",
    "e": "😐"
   },
   {
    "v": "amber",
    "t": "pack.flow.z_deti.o.amber",
    "e": "🤔",
    "reveal": {
     "ph": "pack.flow.z_deti.o.amber.ph",
     "field": "social.kidsNote",
     "chips": [
      {
       "v": "vekdietata",
       "t": "pack.flow.z_deti.o.amber.c0"
      },
      {
       "v": "hlasnearychledeti",
       "t": "pack.flow.z_deti.o.amber.c1"
      },
      {
       "v": "kedhohladkaju",
       "t": "pack.flow.z_deti.o.amber.c2"
      },
      {
       "v": "prijedle",
       "t": "pack.flow.z_deti.o.amber.c3"
      }
     ],
     "chipsField": "social.kidsDepends"
    }
   },
   {
    "v": "red",
    "t": "pack.flow.z_deti.o.red",
    "e": "🙅"
   },
   {
    "v": "unknown",
    "t": "pack.flow.z_deti.o.unknown",
    "e": "❓"
   }
  ]
 },
 {
  "id": "z-macky",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_macky.t",
  "sec": "pack.flow.sec.Vztahy",
  "secE": "🤝",
  "art": "k5-kresba",
  "field": "social.cats",
  "opts": [
   {
    "v": "green",
    "t": "pack.flow.z_macky.o.green",
    "e": "🐈"
   },
   {
    "v": "tolerates",
    "t": "pack.flow.z_macky.o.tolerates",
    "e": "😐"
   },
   {
    "v": "amber",
    "t": "pack.flow.z_macky.o.amber",
    "e": "🤔",
    "reveal": {
     "ph": "pack.flow.z_macky.o.amber.ph",
     "field": "social.catsNote",
     "chips": [
      {
       "v": "svojeacudzie",
       "t": "pack.flow.z_macky.o.amber.c0"
      },
      {
       "v": "kedutekaju",
       "t": "pack.flow.z_macky.o.amber.c1"
      },
      {
       "v": "domaavonku",
       "t": "pack.flow.z_macky.o.amber.c2"
      }
     ],
     "chipsField": "social.catsDepends"
    }
   },
   {
    "v": "red",
    "t": "pack.flow.z_macky.o.red",
    "e": "🙅"
   },
   {
    "v": "unknown",
    "t": "pack.flow.z_macky.o.unknown",
    "e": "❓"
   }
  ]
 },
 {
  "id": "z-cudzi",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_cudzi.t",
  "sec": "pack.flow.sec.Vztahy",
  "secE": "🤝",
  "art": "k3-kresba",
  "field": "social.strangers",
  "opts": [
   {
    "v": "green",
    "t": "pack.flow.z_cudzi.o.green",
    "e": "🥰"
   },
   {
    "v": "tolerates",
    "t": "pack.flow.z_cudzi.o.tolerates",
    "e": "😐"
   },
   {
    "v": "amber",
    "t": "pack.flow.z_cudzi.o.amber",
    "e": "🤔",
    "reveal": {
     "ph": "pack.flow.z_cudzi.o.amber.ph",
     "field": "social.strangersNote",
     "chips": [
      {
       "v": "muziazeny",
       "t": "pack.flow.z_cudzi.o.amber.c0"
      },
      {
       "v": "kedknemuidu",
       "t": "pack.flow.z_cudzi.o.amber.c1"
      },
      {
       "v": "unasdoma",
       "t": "pack.flow.z_cudzi.o.amber.c2"
      },
      {
       "v": "klobukypalicekapucne",
       "t": "pack.flow.z_cudzi.o.amber.c3"
      }
     ],
     "chipsField": "social.strangersDepends"
    }
   },
   {
    "v": "red",
    "t": "pack.flow.z_cudzi.o.red",
    "e": "🙅"
   },
   {
    "v": "unknown",
    "t": "pack.flow.z_cudzi.o.unknown",
    "e": "❓"
   }
  ]
 },
 {
  "id": "z-aky",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.z_aky.t",
  "sec": "pack.flow.sec.Povaha",
  "secE": "🎭",
  "art": "k0-zrkadlo",
  "add": true,
  "field": "temperament.tags",
  "opts": [
   {
    "v": "playful",
    "t": "pack.flow.z_aky.o.playful",
    "e": "🎾"
   },
   {
    "v": "friendly",
    "t": "pack.flow.z_aky.o.friendly",
    "e": "🤗"
   },
   {
    "v": "calm",
    "t": "pack.flow.z_aky.o.calm",
    "e": "😌"
   },
   {
    "v": "energetic",
    "t": "pack.flow.z_aky.o.energetic",
    "e": "⚡"
   },
   {
    "v": "shy",
    "t": "pack.flow.z_aky.o.shy",
    "e": "🫣"
   },
   {
    "v": "alert",
    "t": "pack.flow.z_aky.o.alert",
    "e": "👀"
   },
   {
    "v": "independent",
    "t": "pack.flow.z_aky.o.independent",
    "e": "🐺"
   },
   {
    "v": "cuddly",
    "t": "pack.flow.z_aky.o.cuddly",
    "e": "🥰"
   },
   {
    "v": "stubborn",
    "t": "pack.flow.z_aky.o.stubborn",
    "e": "🐐"
   },
   {
    "v": "sensitive",
    "t": "pack.flow.z_aky.o.sensitive",
    "e": "🥺"
   },
   {
    "v": "protective",
    "t": "pack.flow.z_aky.o.protective",
    "e": "🛡️"
   },
   {
    "v": "goofy",
    "t": "pack.flow.z_aky.o.goofy",
    "e": "🤪"
   }
  ]
 },
 {
  "id": "z-strach",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.z_strach.t",
  "sec": "pack.flow.sec.Povaha",
  "secE": "🎭",
  "art": "k5-kresba",
  "add": true,
  "field": "temperament.fears",
  "opts": [
   {
    "v": "storm",
    "t": "pack.flow.z_strach.o.storm",
    "e": "⛈️"
   },
   {
    "v": "fireworks",
    "t": "pack.flow.z_strach.o.fireworks",
    "e": "🎆"
   },
   {
    "v": "drones",
    "t": "pack.flow.z_strach.o.drones",
    "e": "✈️"
   },
   {
    "v": "loud",
    "t": "pack.flow.z_strach.o.loud",
    "e": "🔊"
   },
   {
    "v": "water",
    "t": "pack.flow.z_strach.o.water",
    "e": "💧"
   },
   {
    "v": "cars",
    "t": "pack.flow.z_strach.o.cars",
    "e": "🚗"
   },
   {
    "v": "strangers",
    "t": "pack.flow.z_strach.o.strangers",
    "e": "🧍"
   },
   {
    "v": "kids",
    "t": "pack.flow.z_strach.o.kids",
    "e": "🧒"
   },
   {
    "v": "dogs",
    "t": "pack.flow.z_strach.o.dogs",
    "e": "🐕"
   },
   {
    "v": "big_animals",
    "t": "pack.flow.z_strach.o.big_animals",
    "e": "🐄"
   },
   {
    "v": "vacuum",
    "t": "pack.flow.z_strach.o.vacuum",
    "e": "🧹"
   },
   {
    "v": "stairs",
    "t": "pack.flow.z_strach.o.stairs",
    "e": "🪜"
   },
   {
    "v": "vet",
    "t": "pack.flow.z_strach.o.vet",
    "e": "🩺"
   },
   {
    "v": "alone",
    "t": "pack.flow.z_strach.o.alone",
    "e": "🚪"
   },
   {
    "v": "none",
    "t": "pack.flow.z_strach.o.none",
    "e": "💪",
    "none": true
   }
  ]
 },
 {
  "id": "x-upokoj",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.x_upokoj.t",
  "s": "pack.flow.x_upokoj.s",
  "sec": "pack.flow.sec.Povaha",
  "secE": "🎭",
  "art": "k3-kresba",
  "add": true,
  "field": "temperament.calming",
  "opts": [
   {
    "v": "signals",
    "t": "pack.flow.x_upokoj.o.signals",
    "e": "🥱"
   },
   {
    "v": "petting",
    "t": "pack.flow.x_upokoj.o.petting",
    "e": "🤲"
   },
   {
    "v": "scent",
    "t": "pack.flow.x_upokoj.o.scent",
    "e": "👕"
   },
   {
    "v": "time_out",
    "t": "pack.flow.x_upokoj.o.time_out",
    "e": "🛏️"
   },
   {
    "v": "voice",
    "t": "pack.flow.x_upokoj.o.voice",
    "e": "🗣️"
   },
   {
    "v": "leave_alone",
    "t": "pack.flow.x_upokoj.o.leave_alone",
    "e": "🕊️"
   },
   {
    "v": "blanket",
    "t": "pack.flow.x_upokoj.o.blanket",
    "e": "🧣"
   },
   {
    "v": "food",
    "t": "pack.flow.x_upokoj.o.food",
    "e": "🦴"
   },
   {
    "v": "play",
    "t": "pack.flow.x_upokoj.o.play",
    "e": "🎾"
   }
  ]
 },
 {
  "id": "z-chnap",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.z_chnap.t",
  "s": "pack.flow.z_chnap.s",
  "sec": "pack.flow.sec.Povaha",
  "secE": "🎭",
  "art": "k5-kresba",
  "add": true,
  "field": "temperament.triggers",
  "opts": [
   {
    "v": "at_food",
    "t": "pack.flow.z_chnap.o.at_food",
    "e": "🥣"
   },
   {
    "v": "at_toy",
    "t": "pack.flow.z_chnap.o.at_toy",
    "e": "🦴"
   },
   {
    "v": "near_owner",
    "t": "pack.flow.z_chnap.o.near_owner",
    "e": "🚶"
   },
   {
    "v": "on_leash",
    "t": "pack.flow.z_chnap.o.on_leash",
    "e": "🦮"
   },
   {
    "v": "jump_on_back",
    "t": "pack.flow.z_chnap.o.jump_on_back",
    "e": "🐕"
   },
   {
    "v": "woken",
    "t": "pack.flow.z_chnap.o.woken",
    "e": "😴"
   },
   {
    "v": "tight_space",
    "t": "pack.flow.z_chnap.o.tight_space",
    "e": "📦"
   },
   {
    "v": "cornered",
    "t": "pack.flow.z_chnap.o.cornered",
    "e": "🧱"
   },
   {
    "v": "collar",
    "t": "pack.flow.z_chnap.o.collar",
    "e": "✋"
   },
   {
    "v": "pain",
    "t": "pack.flow.z_chnap.o.pain",
    "e": "🤕"
   },
   {
    "v": "vet",
    "t": "pack.flow.z_chnap.o.vet",
    "e": "🩺"
   },
   {
    "v": "never",
    "t": "pack.flow.z_chnap.o.never",
    "e": "😇",
    "none": true
   }
  ]
 },
 {
  "id": "z-radost",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.z_radost.t",
  "sec": "pack.flow.sec.Povaha",
  "secE": "🎭",
  "art": "k5-kresba",
  "add": true,
  "field": "temperament.joys",
  "opts": [
   {
    "v": "water",
    "t": "pack.flow.z_radost.o.water",
    "e": "💧"
   },
   {
    "v": "snow",
    "t": "pack.flow.z_radost.o.snow",
    "e": "❄️"
   },
   {
    "v": "mud",
    "t": "pack.flow.z_radost.o.mud",
    "e": "🟤"
   },
   {
    "v": "stick",
    "t": "pack.flow.z_radost.o.stick",
    "e": "🪵"
   },
   {
    "v": "ball",
    "t": "pack.flow.z_radost.o.ball",
    "e": "🎾"
   },
   {
    "v": "fetch",
    "t": "pack.flow.z_radost.o.fetch",
    "e": "🎾"
   },
   {
    "v": "sniffing",
    "t": "pack.flow.z_radost.o.sniffing",
    "e": "👃"
   },
   {
    "v": "searching",
    "t": "pack.flow.z_radost.o.searching",
    "e": "🔍"
   },
   {
    "v": "hikes",
    "t": "pack.flow.z_radost.o.hikes",
    "e": "🥾"
   },
   {
    "v": "dogs",
    "t": "pack.flow.z_radost.o.dogs",
    "e": "🐕"
   },
   {
    "v": "kids",
    "t": "pack.flow.z_radost.o.kids",
    "e": "🧒"
   },
   {
    "v": "petting",
    "t": "pack.flow.z_radost.o.petting",
    "e": "🤲"
   },
   {
    "v": "food",
    "t": "pack.flow.z_radost.o.food",
    "e": "🍖"
   },
   {
    "v": "training",
    "t": "pack.flow.z_radost.o.training",
    "e": "🎯"
   },
   {
    "v": "car_rides",
    "t": "pack.flow.z_radost.o.car_rides",
    "e": "🚗"
   },
   {
    "v": "couch",
    "t": "pack.flow.z_radost.o.couch",
    "e": "🛋️"
   },
   {
    "v": "sun",
    "t": "pack.flow.z_radost.o.sun",
    "e": "☀️"
   }
  ]
 },
 {
  "id": "z-pozor",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.z_pozor.t",
  "s": "pack.flow.z_pozor.s",
  "sec": "pack.flow.sec.Povaha",
  "secE": "🎭",
  "art": "k5-kresba",
  "add": true,
  "notePh": "pack.flow.z_pozor.note",
  "field": "temperament.watch",
  "opts": [
   {
    "v": "hunts_cats",
    "t": "pack.flow.z_pozor.o.hunts_cats",
    "e": "🐈"
   },
   {
    "v": "chases_game",
    "t": "pack.flow.z_pozor.o.chases_game",
    "e": "🦌"
   },
   {
    "v": "steals_table",
    "t": "pack.flow.z_pozor.o.steals_table",
    "e": "🍗"
   },
   {
    "v": "jumps_people",
    "t": "pack.flow.z_pozor.o.jumps_people",
    "e": "🦘"
   },
   {
    "v": "eats_poop",
    "t": "pack.flow.z_pozor.o.eats_poop",
    "e": "💩"
   },
   {
    "v": "scavenges",
    "t": "pack.flow.z_pozor.o.scavenges",
    "e": "🗑️"
   },
   {
    "v": "swallows",
    "t": "pack.flow.z_pozor.o.swallows",
    "e": "🧦"
   },
   {
    "v": "runs_off",
    "t": "pack.flow.z_pozor.o.runs_off",
    "e": "💨"
   },
   {
    "v": "pulls",
    "t": "pack.flow.z_pozor.o.pulls",
    "e": "🦮"
   },
   {
    "v": "destroys",
    "t": "pack.flow.z_pozor.o.destroys",
    "e": "🧨"
   },
   {
    "v": "marks_home",
    "t": "pack.flow.z_pozor.o.marks_home",
    "e": "💦"
   },
   {
    "v": "barks_all",
    "t": "pack.flow.z_pozor.o.barks_all",
    "e": "📢"
   },
   {
    "v": "attacks_dogs",
    "t": "pack.flow.z_pozor.o.attacks_dogs",
    "e": "⚠️"
   },
   {
    "v": "none",
    "t": "pack.flow.z_pozor.o.none",
    "e": "😇",
    "none": true
   }
  ]
 },
 {
  "id": "x-motiv",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.x_motiv.t",
  "s": "pack.flow.x_motiv.s",
  "sec": "pack.flow.sec.Povaha",
  "secE": "🎭",
  "art": "k3-kresba",
  "fields": [
   {
    "field": "temperament.motivator",
    "l": "pack.flow.x_motiv.f0",
    "ph": "pack.flow.x_motiv.f0.ph"
   }
  ]
 },
 {
  "id": "x-groom",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.x_groom.t",
  "sec": "pack.flow.sec.Povaha",
  "secE": "🎭",
  "art": "k3-kresba",
  "add": true,
  "field": "temperament.grooming",
  "opts": [
   {
    "v": "nails",
    "t": "pack.flow.x_groom.o.nails",
    "e": "💅"
   },
   {
    "v": "bath",
    "t": "pack.flow.x_groom.o.bath",
    "e": "🛁"
   },
   {
    "v": "brush",
    "t": "pack.flow.x_groom.o.brush",
    "e": "🪮"
   },
   {
    "v": "dryer",
    "t": "pack.flow.x_groom.o.dryer",
    "e": "💨"
   },
   {
    "v": "teeth",
    "t": "pack.flow.x_groom.o.teeth",
    "e": "🪥"
   },
   {
    "v": "ears",
    "t": "pack.flow.x_groom.o.ears",
    "e": "👂"
   },
   {
    "v": "paws",
    "t": "pack.flow.x_groom.o.paws",
    "e": "🐾"
   },
   {
    "v": "none",
    "t": "pack.flow.x_groom.o.none",
    "e": "👍",
    "none": true
   }
  ]
 },
 {
  "id": "z-vaha",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.z_vaha.t",
  "s": "pack.flow.z_vaha.s",
  "sec": "pack.flow.sec.Zdravie",
  "secE": "🩺",
  "art": "k0-zrkadlo",
  "fields": [
   {
    "field": "health.weightKg",
    "l": "pack.flow.z_vaha.f0",
    "ph": "pack.flow.z_vaha.f0.ph"
   }
  ],
  "big": true,
  "photos": {
   "title": "pack.flow.z_vaha.ph_title",
   "hint": "pack.flow.z_vaha.ph_hint",
   "side": "pack.flow.z_vaha.ph_side",
   "top": "pack.flow.z_vaha.ph_top",
   "cta": "pack.flow.z_vaha.ph_cta",
   "sent": "pack.flow.z_vaha.ph_sent",
   "sideHint": "pack.flow.z_vaha.ph_sideHint",
   "topHint": "pack.flow.z_vaha.ph_topHint"
  }
 },
 {
  "id": "z-alerg",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.z_alerg.t",
  "sec": "pack.flow.sec.Zdravie",
  "secE": "🩺",
  "art": "k4-kresba",
  "add": true,
  "noteOpen": true,
  "notePh": "pack.flow.z_alerg.note",
  "field": "health.allergies",
  "opts": [
   {
    "v": "none",
    "t": "pack.flow.z_alerg.o.none",
    "e": "✅",
    "none": true
   },
   {
    "v": "suspect",
    "t": "pack.flow.z_alerg.o.suspect",
    "e": "🤔",
    "none": true
   },
   {
    "v": "chicken",
    "t": "pack.flow.z_alerg.o.chicken",
    "e": "🍗"
   },
   {
    "v": "beef",
    "t": "pack.flow.z_alerg.o.beef",
    "e": "🥩"
   },
   {
    "v": "grain",
    "t": "pack.flow.z_alerg.o.grain",
    "e": "🌾"
   },
   {
    "v": "dairy",
    "t": "pack.flow.z_alerg.o.dairy",
    "e": "🥛"
   },
   {
    "v": "pollen",
    "t": "pack.flow.z_alerg.o.pollen",
    "e": "🌼"
   },
   {
    "v": "flea_saliva",
    "t": "pack.flow.z_alerg.o.flea_saliva",
    "e": "🦟"
   }
  ]
 },
 {
  "id": "z-chor",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.z_chor.t",
  "sec": "pack.flow.sec.Zdravie",
  "secE": "🩺",
  "art": "k4-kresba",
  "add": true,
  "notePh": "pack.flow.z_chor.note",
  "field": "health.conditions",
  "opts": [
   {
    "v": "none",
    "t": "pack.flow.z_chor.o.none",
    "e": "😇",
    "none": true
   },
   {
    "v": "suspect",
    "t": "pack.flow.z_chor.o.suspect",
    "e": "🤔",
    "none": true
   },
   {
    "v": "epilepsy",
    "t": "pack.flow.z_chor.o.epilepsy",
    "e": "⚡"
   },
   {
    "v": "hip_dysplasia",
    "t": "pack.flow.z_chor.o.hip_dysplasia",
    "e": "🦴"
   },
   {
    "v": "arthritis",
    "t": "pack.flow.z_chor.o.arthritis",
    "e": "🦵"
   },
   {
    "v": "heart",
    "t": "pack.flow.z_chor.o.heart",
    "e": "❤️"
   },
   {
    "v": "thyroid",
    "t": "pack.flow.z_chor.o.thyroid",
    "e": "🦋"
   },
   {
    "v": "diabetes",
    "t": "pack.flow.z_chor.o.diabetes",
    "e": "🩸"
   },
   {
    "v": "kidney",
    "t": "pack.flow.z_chor.o.kidney",
    "e": "🫘"
   },
   {
    "v": "skin",
    "t": "pack.flow.z_chor.o.skin",
    "e": "🩹"
   },
   {
    "v": "blind",
    "t": "pack.flow.z_chor.o.blind",
    "e": "🕶️"
   },
   {
    "v": "deaf",
    "t": "pack.flow.z_chor.o.deaf",
    "e": "🔇"
   },
   {
    "v": "limb",
    "t": "pack.flow.z_chor.o.limb",
    "e": "🐾"
   },
   {
    "v": "wheelchair",
    "t": "pack.flow.z_chor.o.wheelchair",
    "e": "🛞"
   }
  ]
 },
 {
  "id": "x-operacie",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.x_operacie.t",
  "s": "pack.flow.x_operacie.s",
  "sec": "pack.flow.sec.Zdravie",
  "secE": "🩺",
  "art": "k3-kresba",
  "fields": [
   {
    "field": "health.surgeries",
    "l": "pack.flow.x_operacie.f0",
    "ph": "pack.flow.x_operacie.f0.ph",
    "area": true
   }
  ]
 },
 {
  "id": "z-lieky",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.z_lieky.t",
  "s": "pack.flow.z_lieky.s",
  "sec": "pack.flow.sec.Zdravie",
  "secE": "🩺",
  "art": "k4-kresba",
  "fields": [
   {
    "field": "health.meds",
    "l": "pack.flow.z_lieky.f0",
    "ph": "pack.flow.z_lieky.f0.ph",
    "area": true
   }
  ]
 },
 {
  "id": "z-ocko",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.z_ocko.t",
  "sec": "pack.flow.sec.Zdravie",
  "secE": "🩺",
  "art": "k4-kresba",
  "noteOpen": true,
  "notePh": "pack.flow.z_ocko.note",
  "tip": [
   "pack.flow.z_ocko.tip0",
   "pack.flow.z_ocko.tip1"
  ],
  "tipT": "pack.flow.z_ocko.tipT",
  "fields": [
   {
    "field": "health.vaxRabies",
    "l": "pack.flow.z_ocko.f0",
    "type": "date"
   },
   {
    "field": "health.vaxCombo",
    "l": "pack.flow.z_ocko.f1",
    "type": "date"
   }
  ]
 },
 {
  "id": "z-parazity",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_parazity.t",
  "sec": "pack.flow.sec.Zdravie",
  "secE": "🩺",
  "art": "k4-kresba",
  "tip": [
   "pack.flow.z_parazity.tip0"
  ],
  "tipT": "pack.flow.z_parazity.tipT",
  "field": "health.parasites",
  "opts": [
   {
    "v": "stool",
    "t": "pack.flow.z_parazity.o.stool",
    "e": "🔬",
    "reveal": {
     "ph": "pack.flow.z_parazity.o.stool.ph",
     "field": "health.parasitesNote",
     "dateField": "health.deworm"
    }
   },
   {
    "v": "tablets",
    "t": "pack.flow.z_parazity.o.tablets",
    "e": "💊",
    "reveal": {
     "ph": "pack.flow.z_parazity.o.tablets.ph",
     "field": "health.parasitesNote",
     "dateField": "health.deworm"
    }
   },
   {
    "v": "natural",
    "t": "pack.flow.z_parazity.o.natural",
    "e": "🌿",
    "reveal": {
     "ph": "pack.flow.z_parazity.o.natural.ph",
     "field": "health.parasitesNote",
     "dateField": "health.deworm"
    }
   },
   {
    "v": "none",
    "t": "pack.flow.z_parazity.o.none",
    "e": "🤷"
   }
  ]
 },
 {
  "id": "x-striedka",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.x_striedka.t",
  "sec": "pack.flow.sec.Zdravie",
  "secE": "🩺",
  "art": "k3-kresba",
  "field": "health.ticks",
  "opts": [
   {
    "v": "tablet",
    "t": "pack.flow.x_striedka.o.tablet",
    "e": "💊",
    "reveal": {
     "ph": "pack.flow.x_striedka.o.tablet.ph",
     "field": "health.ticksNote"
    }
   },
   {
    "v": "collar_drops",
    "t": "pack.flow.x_striedka.o.collar_drops",
    "e": "💧",
    "reveal": {
     "ph": "pack.flow.x_striedka.o.collar_drops.ph",
     "field": "health.ticksNote"
    }
   },
   {
    "v": "natural",
    "t": "pack.flow.x_striedka.o.natural",
    "e": "🌿",
    "reveal": {
     "ph": "pack.flow.x_striedka.o.natural.ph",
     "field": "health.ticksNote"
    }
   },
   {
    "v": "inspection",
    "t": "pack.flow.x_striedka.o.inspection",
    "e": "🔍"
   },
   {
    "v": "none",
    "t": "pack.flow.x_striedka.o.none",
    "e": "🤷"
   }
  ]
 },
 {
  "id": "z-krmivo",
  "flow": "base",
  "kind": "chips",
  "t": "pack.flow.z_krmivo.t",
  "s": "pack.flow.z_krmivo.s",
  "sec": "pack.flow.sec.Strava",
  "secE": "🍖",
  "art": "k3-kresba",
  "notePh": "pack.flow.z_krmivo.note",
  "field": "food.feeding",
  "opts": [
   {
    "v": "kibble",
    "t": "pack.flow.z_krmivo.o.kibble",
    "e": "🥣"
   },
   {
    "v": "wet",
    "t": "pack.flow.z_krmivo.o.wet",
    "e": "🥫"
   },
   {
    "v": "barf",
    "t": "pack.flow.z_krmivo.o.barf",
    "e": "🥩"
   },
   {
    "v": "cooked",
    "t": "pack.flow.z_krmivo.o.cooked",
    "e": "🍲"
   }
  ]
 },
 {
  "id": "z-davky",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.z_davky.t",
  "sec": "pack.flow.sec.Strava",
  "secE": "🍖",
  "art": "k0-zrkadlo",
  "field": "food.mealsPerDay",
  "opts": [
   {
    "v": "1",
    "t": "pack.flow.z_davky.o.1",
    "e": "1️⃣"
   },
   {
    "v": "2",
    "t": "pack.flow.z_davky.o.2",
    "e": "2️⃣"
   },
   {
    "v": "3",
    "t": "pack.flow.z_davky.o.3",
    "e": "3️⃣"
   },
   {
    "v": "free",
    "t": "pack.flow.z_davky.o.free",
    "e": "🍽️",
    "warn": "pack.flow.z_davky.o.free.warn",
    "warnT": "pack.flow.z_davky.o.free.warnT"
   }
  ]
 },
 {
  "id": "z-kolko",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.z_kolko.t",
  "s": "pack.flow.z_kolko.s",
  "sec": "pack.flow.sec.Strava",
  "secE": "🍖",
  "art": "k0-zrkadlo",
  "fields": [
   {
    "field": "food.portion",
    "l": "pack.flow.z_kolko.f0",
    "ph": "pack.flow.z_kolko.f0.ph"
   }
  ]
 },
 {
  "id": "z-tel",
  "flow": "base",
  "kind": "fields",
  "t": "pack.flow.z_tel.t",
  "sec": "pack.flow.sec.Kontakty",
  "secE": "📞",
  "art": "k4-kresba",
  "fields": [
   {
    "field": "health.ownerPhone",
    "l": "pack.flow.z_tel.f0",
    "ph": "pack.flow.z_tel.f0.ph",
    "type": "tel"
   },
   {
    "field": "health.backupName",
    "l": "pack.flow.z_tel.f1",
    "ph": "pack.flow.z_tel.f1.ph"
   },
   {
    "field": "health.backupContact",
    "l": "pack.flow.z_tel.f2",
    "ph": "pack.flow.z_tel.f2.ph",
    "type": "tel"
   }
  ]
 },
 {
  "id": "z-vet",
  "flow": "base",
  "kind": "vet",
  "t": "pack.flow.z_vet.t",
  "s": "pack.flow.z_vet.s",
  "sec": "pack.flow.sec.Kontakty",
  "secE": "📞",
  "art": "k4-kresba",
  "field": "health.vetContact"
 },
 {
  "id": "x-strata",
  "flow": "base",
  "kind": "single",
  "t": "pack.flow.x_strata.t",
  "s": "pack.flow.x_strata.s",
  "sec": "pack.flow.sec.Kontakty",
  "secE": "📞",
  "art": "k3-kresba",
  "field": "safety.lost",
  "opts": [
   {
    "v": "goes_to_anyone",
    "t": "pack.flow.x_strata.o.goes_to_anyone",
    "e": "🤗"
   },
   {
    "v": "name_treat",
    "t": "pack.flow.x_strata.o.name_treat",
    "e": "🍖"
   },
   {
    "v": "runs_away",
    "t": "pack.flow.x_strata.o.runs_away",
    "e": "🏃"
   },
   {
    "v": "may_defend",
    "t": "pack.flow.x_strata.o.may_defend",
    "e": "⚠️"
   },
   {
    "v": "comes_home",
    "t": "pack.flow.x_strata.o.comes_home",
    "e": "🏠"
   }
  ]
 },
 {
  "id": "moduly",
  "flow": "modules",
  "kind": "modules",
  "t": "pack.flow.moduly.t",
  "s": "pack.flow.moduly.s",
  "mods": [
   {
    "key": "base",
    "t": "pack.flow.moduly.m_z_prez",
    "d": "pack.flow.moduly.m_z_prez.d",
    "ic": "dogsphinx",
    "bg": "k0-zrkadlo"
   },
   {
    "key": "nature",
    "t": "pack.flow.moduly.m_n_uvod",
    "d": "pack.flow.moduly.m_n_uvod.d",
    "ic": "yinyang",
    "bg": "nature-quiz-art"
   },
   {
    "key": "will",
    "t": "pack.flow.moduly.m_zavet",
    "d": "pack.flow.moduly.m_zavet.d",
    "ic": "feather",
    "bg": "k4-f4"
   }
  ],
  "soon": {
   "t": "pack.flow.moduly.soon",
   "ic": "food"
  }
 },
 {
  "id": "n-uvod",
  "flow": "nature",
  "kind": "intro",
  "t": "pack.flow.n_uvod.t",
  "s": "pack.flow.n_uvod.s",
  "sec": "pack.flow.sec.Uvod",
  "art": "nature-quiz-art",
  "attr": "pack.flow.n_uvod.attr",
  "badgesTitle": "pack.flow.n_uvod.badges",
  "cta": "pack.flow.n_uvod.cta"
 },
 {
  "id": "e-telo",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.e_telo.t",
  "sec": "pack.flow.sec.Element",
  "secE": "🔥",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.e_telo.o.o1",
    "e": "🧱",
    "score": [
     "fire"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.e_telo.o.o2",
    "e": "🏃",
    "score": [
     "wood"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.e_telo.o.o3",
    "e": "🐻",
    "score": [
     "earth"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.e_telo.o.o4",
    "e": "🥶",
    "score": [
     "water"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.e_telo.o.o5",
    "e": "🦁",
    "score": [
     "metal"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.e_telo.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.e_telo.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "e-jedlo",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.e_jedlo.t",
  "sec": "pack.flow.sec.Element",
  "secE": "🔥",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.e_jedlo.o.o1",
    "e": "🍖",
    "score": [
     "earth"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.e_jedlo.o.o2",
    "e": "😋",
    "score": [
     "metal"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.e_jedlo.o.o3",
    "e": "🥺",
    "score": [
     "water",
     "fire"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.e_jedlo.o.o4",
    "e": "😠",
    "score": [
     "wood"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.e_jedlo.o.o5",
    "e": "🎾",
    "score": [
     "fire"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.e_jedlo.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.e_jedlo.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "e-psi",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.e_psi.t",
  "sec": "pack.flow.sec.Element",
  "secE": "🔥",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.e_psi.o.o1",
    "e": "🧍",
    "score": [
     "earth"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.e_psi.o.o2",
    "e": "🐺",
    "score": [
     "metal"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.e_psi.o.o3",
    "e": "😰",
    "score": [
     "water"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.e_psi.o.o4",
    "e": "💥",
    "score": [
     "wood"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.e_psi.o.o5",
    "e": "🤝",
    "score": [
     "fire",
     "earth"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.e_psi.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.e_psi.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "e-novy",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.e_novy.t",
  "sec": "pack.flow.sec.Element",
  "secE": "🔥",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.e_novy.o.o1",
    "e": "🦴",
    "score": [
     "earth"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.e_novy.o.o2",
    "e": "😐",
    "score": [
     "metal"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.e_novy.o.o3",
    "e": "🫣",
    "score": [
     "water"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.e_novy.o.o4",
    "e": "🛡️",
    "score": [
     "wood"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.e_novy.o.o5",
    "e": "👋",
    "score": [
     "fire"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.e_novy.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.e_novy.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "e-domov",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.e_domov.t",
  "sec": "pack.flow.sec.Element",
  "secE": "🔥",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.e_domov.o.o1",
    "e": "🎉",
    "score": [
     "fire"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.e_domov.o.o2",
    "e": "🛋️",
    "score": [
     "earth"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.e_domov.o.o3",
    "e": "🙄",
    "score": [
     "metal",
     "wood"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.e_domov.o.o4",
    "e": "🧨",
    "score": [
     "water",
     "wood"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.e_domov.o.o5",
    "e": "😤",
    "score": [
     "wood"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.e_domov.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.e_domov.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "e-ucenie",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.e_ucenie.t",
  "sec": "pack.flow.sec.Element",
  "secE": "🔥",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.e_ucenie.o.o1",
    "e": "🤝",
    "score": [
     "earth"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.e_ucenie.o.o2",
    "e": "🔁",
    "score": [
     "metal"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.e_ucenie.o.o3",
    "e": "💡",
    "score": [
     "water"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.e_ucenie.o.o4",
    "e": "🏆",
    "score": [
     "wood"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.e_ucenie.o.o5",
    "e": "🌟",
    "score": [
     "fire"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.e_ucenie.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.e_ucenie.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "e-hra",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.e_hra.t",
  "sec": "pack.flow.sec.Element",
  "secE": "🔥",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.e_hra.o.o1",
    "e": "🎈",
    "score": [
     "fire"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.e_hra.o.o2",
    "e": "😴",
    "score": [
     "earth"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.e_hra.o.o3",
    "e": "🎾",
    "score": [
     "wood"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.e_hra.o.o4",
    "e": "🥱",
    "score": [
     "fire",
     "water"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.e_hra.o.o5",
    "e": "🧐",
    "score": [
     "metal"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.e_hra.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.e_hra.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "e-spanok",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.e_spanok.t",
  "sec": "pack.flow.sec.Element",
  "secE": "🔥",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.e_spanok.o.o1",
    "e": "😌",
    "score": [
     "earth"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.e_spanok.o.o2",
    "e": "🪨",
    "score": [
     "metal"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.e_spanok.o.o3",
    "e": "🌙",
    "score": [
     "water"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.e_spanok.o.o4",
    "e": "👀",
    "score": [
     "wood"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.e_spanok.o.o5",
    "e": "💭",
    "score": [
     "fire"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.e_spanok.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.e_spanok.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "e-dotyk",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.e_dotyk.t",
  "sec": "pack.flow.sec.Element",
  "secE": "🔥",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.e_dotyk.o.o1",
    "e": "🥰",
    "score": [
     "earth"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.e_dotyk.o.o2",
    "e": "😼",
    "score": [
     "metal"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.e_dotyk.o.o3",
    "e": "🏃",
    "score": [
     "water"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.e_dotyk.o.o4",
    "e": "📍",
    "score": [
     "wood"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.e_dotyk.o.o5",
    "e": "🤲",
    "score": [
     "fire"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.e_dotyk.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.e_dotyk.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "e-nalada",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.e_nalada.t",
  "sec": "pack.flow.sec.Element",
  "secE": "🔥",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.e_nalada.o.o1",
    "e": "🌳",
    "score": [
     "earth"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.e_nalada.o.o2",
    "e": "🗿",
    "score": [
     "metal"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.e_nalada.o.o3",
    "e": "😟",
    "score": [
     "water"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.e_nalada.o.o4",
    "e": "😤",
    "score": [
     "wood"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.e_nalada.o.o5",
    "e": "😄",
    "score": [
     "fire"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.e_nalada.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.e_nalada.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "r-zvonec",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.r_zvonec.t",
  "sec": "pack.flow.sec.Uloha",
  "secE": "🛡️",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.r_zvonec.o.o1",
    "e": "🤗",
    "score": [
     "companion"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.r_zvonec.o.o2",
    "e": "📢",
    "score": [
     "herald"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.r_zvonec.o.o3",
    "e": "🔮",
    "score": [
     "diviner"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.r_zvonec.o.o4",
    "e": "🛡️",
    "score": [
     "defender"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.r_zvonec.o.o5",
    "e": "👑",
    "score": [
     "captain"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.r_zvonec.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.r_zvonec.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "r-cudzina",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.r_cudzina.t",
  "sec": "pack.flow.sec.Uloha",
  "secE": "🛡️",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.r_cudzina.o.o1",
    "e": "🤝",
    "score": [
     "companion"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.r_cudzina.o.o2",
    "e": "👀",
    "score": [
     "herald"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.r_cudzina.o.o3",
    "e": "👻",
    "score": [
     "diviner"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.r_cudzina.o.o4",
    "e": "🛡️",
    "score": [
     "defender"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.r_cudzina.o.o5",
    "e": "👑",
    "score": [
     "captain"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.r_cudzina.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.r_cudzina.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "r-prech",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.r_prech.t",
  "sec": "pack.flow.sec.Uloha",
  "secE": "🛡️",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.r_prech.o.o1",
    "e": "👣",
    "score": [
     "companion"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.r_prech.o.o2",
    "e": "📡",
    "score": [
     "herald"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.r_prech.o.o3",
    "e": "🛑",
    "score": [
     "diviner"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.r_prech.o.o4",
    "e": "🧭",
    "score": [
     "defender"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.r_prech.o.o5",
    "e": "👃",
    "score": [
     "captain"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.r_prech.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.r_prech.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "r-hra",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.r_hra.t",
  "sec": "pack.flow.sec.Uloha",
  "secE": "🛡️",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.r_hra.o.o1",
    "e": "🌪️",
    "score": [
     "companion"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.r_hra.o.o2",
    "e": "📢",
    "score": [
     "herald"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.r_hra.o.o3",
    "e": "🔮",
    "score": [
     "diviner"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.r_hra.o.o4",
    "e": "👮",
    "score": [
     "defender"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.r_hra.o.o5",
    "e": "🧭",
    "score": [
     "captain"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.r_hra.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.r_hra.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "r-napatie",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.r_napatie.t",
  "sec": "pack.flow.sec.Uloha",
  "secE": "🛡️",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.r_napatie.o.o1",
    "e": "🫂",
    "score": [
     "companion"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.r_napatie.o.o2",
    "e": "👂",
    "score": [
     "herald"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.r_napatie.o.o3",
    "e": "🌀",
    "score": [
     "diviner"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.r_napatie.o.o4",
    "e": "🚪",
    "score": [
     "defender"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.r_napatie.o.o5",
    "e": "🍽️",
    "score": [
     "captain"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.r_napatie.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.r_napatie.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "r-volanie",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.r_volanie.t",
  "sec": "pack.flow.sec.Uloha",
  "secE": "🛡️",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.r_volanie.o.o1",
    "e": "💨",
    "score": [
     "companion"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.r_volanie.o.o2",
    "e": "📢",
    "score": [
     "herald"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.r_volanie.o.o3",
    "e": "🔮",
    "score": [
     "diviner"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.r_volanie.o.o4",
    "e": "👀",
    "score": [
     "defender"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.r_volanie.o.o5",
    "e": "🐈",
    "score": [
     "captain"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.r_volanie.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.r_volanie.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "r-ludia",
  "flow": "nature",
  "kind": "pick2",
  "t": "pack.flow.r_ludia.t",
  "sec": "pack.flow.sec.Uloha",
  "secE": "🛡️",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "o1",
    "t": "pack.flow.r_ludia.o.o1",
    "e": "🤗",
    "score": [
     "companion"
    ]
   },
   {
    "v": "o2",
    "t": "pack.flow.r_ludia.o.o2",
    "e": "📢",
    "score": [
     "herald"
    ]
   },
   {
    "v": "o3",
    "t": "pack.flow.r_ludia.o.o3",
    "e": "🔮",
    "score": [
     "diviner"
    ]
   },
   {
    "v": "o4",
    "t": "pack.flow.r_ludia.o.o4",
    "e": "🌃",
    "score": [
     "defender"
    ]
   },
   {
    "v": "o5",
    "t": "pack.flow.r_ludia.o.o5",
    "e": "🐈",
    "score": [
     "captain"
    ]
   },
   {
    "v": "other",
    "t": "pack.flow.r_ludia.o.other",
    "e": "✏️",
    "none": true,
    "other": true,
    "reveal": {
     "ph": "pack.flow.r_ludia.o.other.ph"
    }
   }
  ]
 },
 {
  "id": "s-spec",
  "flow": "nature",
  "kind": "matrix",
  "t": "pack.flow.s_spec.t",
  "s": "pack.flow.s_spec.s",
  "sec": "pack.flow.sec.Zvlastnauloha",
  "secE": "⭐",
  "art": "nature-quiz-art",
  "rows": [
   {
    "field": "special.peacemaker",
    "l": "pack.flow.s_spec.r0",
    "vals": [
     {
      "v": "yes",
      "t": "pack.flow.s_spec.r0.v0"
     },
     {
      "v": "sometimes",
      "t": "pack.flow.s_spec.r0.v1"
     },
     {
      "v": "no",
      "t": "pack.flow.s_spec.r0.v2"
     }
    ],
    "e": "🕊️"
   },
   {
    "field": "special.nurturer",
    "l": "pack.flow.s_spec.r1",
    "vals": [
     {
      "v": "yes",
      "t": "pack.flow.s_spec.r1.v0"
     },
     {
      "v": "sometimes",
      "t": "pack.flow.s_spec.r1.v1"
     },
     {
      "v": "no",
      "t": "pack.flow.s_spec.r1.v2"
     }
    ],
    "e": "🍼"
   },
   {
    "field": "special.hunter",
    "l": "pack.flow.s_spec.r2",
    "vals": [
     {
      "v": "yes",
      "t": "pack.flow.s_spec.r2.v0"
     },
     {
      "v": "sometimes",
      "t": "pack.flow.s_spec.r2.v1"
     },
     {
      "v": "no",
      "t": "pack.flow.s_spec.r2.v2"
     }
    ],
    "e": "🎯"
   },
   {
    "field": "special.loner",
    "l": "pack.flow.s_spec.r3",
    "vals": [
     {
      "v": "yes",
      "t": "pack.flow.s_spec.r3.v0"
     },
     {
      "v": "sometimes",
      "t": "pack.flow.s_spec.r3.v1"
     },
     {
      "v": "no",
      "t": "pack.flow.s_spec.r3.v2"
     }
    ],
    "e": "🐺"
   }
  ]
 },
 {
  "id": "n-vysl",
  "flow": "nature",
  "kind": "result",
  "t": "pack.flow.n_vysl.t",
  "s": "pack.flow.n_vysl.s",
  "sec": "pack.flow.sec.Vysledok",
  "art": "nature-quiz-art",
  "cta": "pack.flow.n_vysl.cta",
  "cta2": "pack.flow.n_vysl.cta2"
 },
 {
  "id": "b-vstup",
  "flow": "balance",
  "kind": "single",
  "t": "pack.flow.b_vstup.t",
  "s": "pack.flow.b_vstup.s",
  "sec": "pack.flow.sec.Dobrovolne",
  "art": "nature-quiz-art",
  "field": "nature.balanceEntry",
  "opts": [
   {
    "v": "yes",
    "t": "pack.flow.b_vstup.o.yes",
    "e": "⚖️"
   },
   {
    "v": "no",
    "t": "pack.flow.b_vstup.o.no",
    "e": "⏭️"
   }
  ]
 },
 {
  "id": "b-nalada",
  "flow": "balance",
  "kind": "chips",
  "t": "pack.flow.b_nalada.t",
  "s": "pack.flow.b_nalada.s",
  "sec": "pack.flow.sec.Nalada",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "fire.excess.anxiety",
    "t": "pack.flow.b_nalada.o.fire_excess_anxiety"
   },
   {
    "v": "fire.deficiency.confusion",
    "t": "pack.flow.b_nalada.o.fire_deficiency_confusion"
   },
   {
    "v": "fire.deficiency.panic",
    "t": "pack.flow.b_nalada.o.fire_deficiency_panic"
   },
   {
    "v": "water.deficiency.fear",
    "t": "pack.flow.b_nalada.o.water_deficiency_fear"
   },
   {
    "v": "wood.excess.irritability",
    "t": "pack.flow.b_nalada.o.wood_excess_irritability"
   },
   {
    "v": "wood.excess.hyperactivity",
    "t": "pack.flow.b_nalada.o.wood_excess_hyperactivity"
   },
   {
    "v": "water.excess.lethargy,wood.deficiency.sluggish",
    "t": "pack.flow.b_nalada.o.water_excess_lethargy_wood_deficiency_sluggish"
   },
   {
    "v": "fire.deficiency.tires-easily",
    "t": "pack.flow.b_nalada.o.fire_deficiency_tires_easily"
   },
   {
    "v": "none",
    "t": "pack.flow.b_nalada.o.none",
    "e": "🤷",
    "none": true
   }
  ]
 },
 {
  "id": "b-travenie",
  "flow": "balance",
  "kind": "chips",
  "t": "pack.flow.b_travenie.t",
  "s": "pack.flow.b_travenie.s",
  "sec": "pack.flow.sec.Travenie",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "earth.excess.gut",
    "t": "pack.flow.b_travenie.o.earth_excess_gut"
   },
   {
    "v": "earth.excess.appetite",
    "t": "pack.flow.b_travenie.o.earth_excess_appetite"
   },
   {
    "v": "metal.excess.poor-appetite",
    "t": "pack.flow.b_travenie.o.metal_excess_poor_appetite"
   },
   {
    "v": "metal.excess.constipation",
    "t": "pack.flow.b_travenie.o.metal_excess_constipation"
   },
   {
    "v": "water.excess.loose-stool",
    "t": "pack.flow.b_travenie.o.water_excess_loose_stool"
   },
   {
    "v": "wood.excess.reflux",
    "t": "pack.flow.b_travenie.o.wood_excess_reflux"
   },
   {
    "v": "wood.excess.digestive-upset",
    "t": "pack.flow.b_travenie.o.wood_excess_digestive_upset"
   },
   {
    "v": "metal.excess.colitis",
    "t": "pack.flow.b_travenie.o.metal_excess_colitis"
   },
   {
    "v": "none",
    "t": "pack.flow.b_travenie.o.none",
    "e": "🤷",
    "none": true
   }
  ]
 },
 {
  "id": "b-koza",
  "flow": "balance",
  "kind": "chips",
  "t": "pack.flow.b_koza.t",
  "s": "pack.flow.b_koza.s",
  "sec": "pack.flow.sec.Koza",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "metal.deficiency.itching",
    "t": "pack.flow.b_koza.o.metal_deficiency_itching"
   },
   {
    "v": "metal.deficiency.hair-loss",
    "t": "pack.flow.b_koza.o.metal_deficiency_hair_loss"
   },
   {
    "v": "water.deficiency.grey",
    "t": "pack.flow.b_koza.o.water_deficiency_grey"
   },
   {
    "v": "metal.excess.brittle-nails",
    "t": "pack.flow.b_koza.o.metal_excess_brittle_nails"
   },
   {
    "v": "metal.deficiency.moles-warts",
    "t": "pack.flow.b_koza.o.metal_deficiency_moles_warts"
   },
   {
    "v": "earth.deficiency.bruises",
    "t": "pack.flow.b_koza.o.earth_deficiency_bruises"
   },
   {
    "v": "metal.excess.dermatitis",
    "t": "pack.flow.b_koza.o.metal_excess_dermatitis"
   },
   {
    "v": "none",
    "t": "pack.flow.b_koza.o.none",
    "e": "🤷",
    "none": true
   }
  ]
 },
 {
  "id": "b-klby",
  "flow": "balance",
  "kind": "chips",
  "t": "pack.flow.b_klby.t",
  "s": "pack.flow.b_klby.s",
  "sec": "pack.flow.sec.Pohyb",
  "secE": "🥾",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "earth.excess.weak-back",
    "t": "pack.flow.b_klby.o.earth_excess_weak_back"
   },
   {
    "v": "wood.deficiency.joint-pain",
    "t": "pack.flow.b_klby.o.wood_deficiency_joint_pain"
   },
   {
    "v": "earth.deficiency.muscle-tone",
    "t": "pack.flow.b_klby.o.earth_deficiency_muscle_tone"
   },
   {
    "v": "fire.excess.swollen-feet",
    "t": "pack.flow.b_klby.o.fire_excess_swollen_feet"
   },
   {
    "v": "water.excess.arthritis",
    "t": "pack.flow.b_klby.o.water_excess_arthritis",
    "e": "🦵"
   },
   {
    "v": "water.deficiency.discs",
    "t": "pack.flow.b_klby.o.water_deficiency_discs"
   },
   {
    "v": "water.deficiency.osteoporosis",
    "t": "pack.flow.b_klby.o.water_deficiency_osteoporosis"
   },
   {
    "v": "wood.deficiency.ccl",
    "t": "pack.flow.b_klby.o.wood_deficiency_ccl"
   },
   {
    "v": "none",
    "t": "pack.flow.b_klby.o.none",
    "e": "🤷",
    "none": true
   }
  ]
 },
 {
  "id": "b-dych",
  "flow": "balance",
  "kind": "chips",
  "t": "pack.flow.b_dych.t",
  "s": "pack.flow.b_dych.s",
  "sec": "pack.flow.sec.Dychasrdce",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "fire.excess.dry-cough",
    "t": "pack.flow.b_dych.o.fire_excess_dry_cough"
   },
   {
    "v": "wood.excess.wheezing",
    "t": "pack.flow.b_dych.o.wood_excess_wheezing"
   },
   {
    "v": "wood.deficiency.phlegm",
    "t": "pack.flow.b_dych.o.wood_deficiency_phlegm"
   },
   {
    "v": "metal.excess.asthma",
    "t": "pack.flow.b_dych.o.metal_excess_asthma"
   },
   {
    "v": "metal.deficiency.resp-infections",
    "t": "pack.flow.b_dych.o.metal_deficiency_resp_infections"
   },
   {
    "v": "metal.deficiency.pneumonia",
    "t": "pack.flow.b_dych.o.metal_deficiency_pneumonia"
   },
   {
    "v": "fire.deficiency.heart-disease",
    "t": "pack.flow.b_dych.o.fire_deficiency_heart_disease"
   },
   {
    "v": "fire.excess.high-bp",
    "t": "pack.flow.b_dych.o.fire_excess_high_bp"
   },
   {
    "v": "fire.deficiency.low-bp",
    "t": "pack.flow.b_dych.o.fire_deficiency_low_bp"
   },
   {
    "v": "fire.deficiency.anemia",
    "t": "pack.flow.b_dych.o.fire_deficiency_anemia"
   },
   {
    "v": "wood.deficiency.circulation",
    "t": "pack.flow.b_dych.o.wood_deficiency_circulation"
   },
   {
    "v": "none",
    "t": "pack.flow.b_dych.o.none",
    "e": "🤷",
    "none": true
   }
  ]
 },
 {
  "id": "b-moc",
  "flow": "balance",
  "kind": "chips",
  "t": "pack.flow.b_moc.t",
  "s": "pack.flow.b_moc.s",
  "sec": "pack.flow.sec.Mocenieazmysly",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "water.deficiency.frequent-urination",
    "t": "pack.flow.b_moc.o.water_deficiency_frequent_urination"
   },
   {
    "v": "metal.deficiency.bladder-weak",
    "t": "pack.flow.b_moc.o.metal_deficiency_bladder_weak"
   },
   {
    "v": "fire.excess.cystitis",
    "t": "pack.flow.b_moc.o.fire_excess_cystitis"
   },
   {
    "v": "water.excess.stones",
    "t": "pack.flow.b_moc.o.water_excess_stones"
   },
   {
    "v": "fire.excess.dehydration",
    "t": "pack.flow.b_moc.o.fire_excess_dehydration"
   },
   {
    "v": "wood.deficiency.dry-eyes",
    "t": "pack.flow.b_moc.o.wood_deficiency_dry_eyes"
   },
   {
    "v": "water.deficiency.senses",
    "t": "pack.flow.b_moc.o.water_deficiency_senses"
   },
   {
    "v": "earth.excess.conjunctivitis",
    "t": "pack.flow.b_moc.o.earth_excess_conjunctivitis"
   },
   {
    "v": "earth.deficiency.loose-teeth",
    "t": "pack.flow.b_moc.o.earth_deficiency_loose_teeth"
   },
   {
    "v": "earth.deficiency.bleeding-gums",
    "t": "pack.flow.b_moc.o.earth_deficiency_bleeding_gums"
   },
   {
    "v": "earth.excess.sticky-mucous",
    "t": "pack.flow.b_moc.o.earth_excess_sticky_mucous"
   },
   {
    "v": "none",
    "t": "pack.flow.b_moc.o.none",
    "e": "🤷",
    "none": true
   }
  ]
 },
 {
  "id": "b-ine",
  "flow": "balance",
  "kind": "chips",
  "t": "pack.flow.b_ine.t",
  "s": "pack.flow.b_ine.s",
  "sec": "pack.flow.sec.Ine",
  "art": "nature-quiz-art",
  "opts": [
   {
    "v": "earth.excess.edema",
    "t": "pack.flow.b_ine.o.earth_excess_edema"
   },
   {
    "v": "earth.deficiency.swollen-abdomen",
    "t": "pack.flow.b_ine.o.earth_deficiency_swollen_abdomen"
   },
   {
    "v": "earth.deficiency.lymph-nodes",
    "t": "pack.flow.b_ine.o.earth_deficiency_lymph_nodes"
   },
   {
    "v": "water.excess.headaches",
    "t": "pack.flow.b_ine.o.water_excess_headaches"
   },
   {
    "v": "water.excess.tumors",
    "t": "pack.flow.b_ine.o.water_excess_tumors"
   },
   {
    "v": "wood.excess.seizures",
    "t": "pack.flow.b_ine.o.wood_excess_seizures"
   },
   {
    "v": "none",
    "t": "pack.flow.b_ine.o.none",
    "e": "🤷",
    "none": true
   }
  ]
 },
 {
  "id": "zavet",
  "flow": "will",
  "kind": "will",
  "t": "pack.flow.zavet.t",
  "s": "pack.flow.zavet.s",
  "sec": "pack.flow.sec.Zavet",
  "art": "k4-f4",
  "labels": {
   "heir": "pack.flow.zavet.l_heir",
   "letter": "pack.flow.zavet.l_letter",
   "email": "pack.flow.zavet.l_email",
   "email2": "pack.flow.zavet.l_email2",
   "heirPh": "pack.flow.zavet.l_heirPh",
   "letterPh": "pack.flow.zavet.l_letterPh",
   "save": "pack.flow.zavet.l_save",
   "send": "pack.flow.zavet.l_send"
  },
  "sug": [
   "pack.flow.zavet.sug0",
   "pack.flow.zavet.sug1",
   "pack.flow.zavet.sug2"
  ]
 }
];
