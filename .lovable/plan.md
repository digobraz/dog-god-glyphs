

## Revert Story Card Titles to Previous Manifesto Headings

### What changes
Only the `title` field in each of the 9 slides in `src/components/landing/StorySection.tsx`. No other text (tag, body/full) changes.

### File: `src/components/landing/StorySection.tsx`

Replace current titles with the previous ones:

| Card | Current Title | Reverted Title |
|------|--------------|----------------|
| 1 | THE FIRST TOUCH | It all started with a gentle touch... |
| 2 | THE TWENTY-YEAR WAIT | That forged a mythical loyalty |
| 3 | THE WRONG SWORD | Endured the gravest injustice |
| 4 | THE SMALLEST SPY | Brought hope into the darkness |
| 5 | FORTY LIVES | Melted the ice through selfless sacrifice |
| 6 | THE GIFT OF FREEDOM | Became our very senses |
| 7 | THE REAL HERO | Pushed beyond physical limits |
| 8 | ONE-WAY TICKET | And propelled humanity to the stars |
| 9 | IT'S TIME | ...so we could build a world where dog is god. |

All `tag`, `full`, `video`, and position properties remain untouched.

