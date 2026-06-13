FIFA Schedule Scraper

This script uses Playwright to fetch FIFA schedule pages and extract match information.

Setup

Install dependencies (Node.js >=16):

```bash
npm install -D playwright
```

(Optionally install only the Chromium browser for Playwright to save space):

```bash
npx playwright install chromium
```

Run

```bash
node scripts/scrapeFifaMatches.js "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums"
```

Output

- Produces `fifa_matches_raw.json` in the repository root containing scraped entries with these fields:
  - `url`, `title`, `h1`, `metaDesc`, `timeIso`, `timeText`, `teams`, `snippet`

Notes

- The FIFA site uses dynamic rendering; the scraper uses Playwright (headless Chromium) to execute JS and capture content.
- The script uses heuristic extraction and provides raw snippets to help later mapping into `src/utils/seedMatches.tsx`.
- If you want, I can extend the script to directly map values into the seed file format and optionally write an updated `seedMatches.tsx` automatically.
