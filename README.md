# World Cup 2026 Pool

A React + TypeScript + Vite app for managing and predicting 2026 FIFA World Cup matches.

## Features

- Admin panel to create, edit, and delete matches.
- Admin filters for:
  - Country name search
  - Match list window of ±1 day from today
  - Score input and point recalculation for finished matches
- Dashboard and match display use browser-local kickoff times.
- Seed data loading from `src/utils/seedMatches.tsx`.
- Playwright scraper script for extracting FIFA schedule data.

## Local Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Admin Tab

The Admin UI supports:

- Creating or editing matches with home/away teams, flags, stage, and kickoff datetime.
- Searching matches by country name.
- Deleting matches.
- Entering final results and recalculating prediction points.
- Seeding initial World Cup matches from seed data.

### Country Filter

Type any part of a home or away country name in the admin filter box to narrow the editable match list.

### Time Window

The admin match list currently shows matches within ±1 day of the current date.

## Scraper

A Playwright scraper script is included in `scripts/scrapeFifaMatches.js` for extracting official FIFA schedule data.

### Install Playwright

```bash
npm install
npx playwright install
```

Install browser dependencies on Linux if needed:

```bash
npx playwright install-deps
```

### Run the scraper

```bash
node scripts/scrapeFifaMatches.js "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums"
```

The script writes `fifa_matches_raw.json` to the repo root.

## Notes

- The app is configured to use Firebase Firestore.
- `src/components/Admin.tsx` contains admin match editing and filters.
- `src/utils/seedMatches.tsx` contains the initial seed payload.
