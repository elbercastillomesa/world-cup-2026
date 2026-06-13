#!/usr/bin/env node
// Scrape FIFA match schedule pages and extract basic match info.
// Usage: node scrapeFifaMatches.js [URL]

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const startUrl = process.argv[2] || 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(12000000);
  console.log('Loading', startUrl);
  await page.goto(startUrl, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(3000);

  const startUrlObj = new URL(startUrl);

  // Collect candidate links from the page (filter heuristics)
  const anchors = await page.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll('a[href]'), el => el.href))));
  const filteredAnchors = anchors.filter(h => {
    if (!h || h.startsWith('#')) return false;
    try {
      const url = new URL(h, startUrl);
      if (url.origin === startUrlObj.origin && url.pathname === startUrlObj.pathname && url.hash) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });

  const matchPatterns = [/match/i, /fixture/i, /fixtures/i, /matches/i];
  const matchLinks = filteredAnchors.filter(h => matchPatterns.some(p => p.test(h)));

  // If none matched heuristics, fallback to any fifa.com links
  const fallbackLinks = matchLinks.length ? matchLinks : filteredAnchors.filter(h => /fifa\.com/i.test(h));
  const uniqueLinks = Array.from(new Set(fallbackLinks)).slice(0, 3000);

  console.log(`Found ${uniqueLinks.length} candidate links; scraping up to ${uniqueLinks.length}.`);

  const results = [];

  for (const link of uniqueLinks) {
    try {
      await page.goto(link, { waitUntil: 'networkidle' });
      // Try to extract structured fields with multiple fallbacks
      const title = await page.title().catch(() => null);
      const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
      const metaDesc = await page.$eval('meta[property="og:description"]', el => el.getAttribute('content')).catch(() => null);
      const timeIso = await page.$eval('time[datetime]', el => el.getAttribute('datetime')).catch(() => null);
      const timeText = await page.$eval('time', el => el.textContent.trim()).catch(() => null);

      // Try to find team names via common attributes or by regex in page text
      const teams = await page.evaluate(() => {
        const text = document.body.innerText || '';
        // Common pattern: "Team A vs Team B"
        const vsMatch = text.match(/([A-Za-zÀ-ÖØ-öø-ÿ\s]{3,})\s+vs\.?\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]{3,})/i);
        if (vsMatch) return [vsMatch[1].trim(), vsMatch[2].trim()];

        // Look for elements with 'team' in class or data attributes
        const teamEls = Array.from(document.querySelectorAll('[class*=team], [data-test*=team], [data-testid*=team]')).slice(0, 2).map(e => e.textContent.trim()).filter(Boolean);
        if (teamEls.length) return teamEls;

        return [];
      }).catch(() => []);

      // Attempt to capture a short HTML snippet of the main article or body
      const snippet = await page.$eval('main', el => el.innerHTML.slice(0, 50000)).catch(async () => {
        const body = await page.$eval('body', el => el.innerHTML.slice(0, 50000)).catch(() => null);
        return body;
      });

      results.push({ url: link, title, h1, metaDesc, timeIso, timeText, teams, snippet });
      console.log('Scraped', link, 'teams=', teams && teams.join(' vs '));
    } catch (err) {
      console.error('Error scraping', link, err.message);
    }
  }

  await browser.close();

  const outPath = path.resolve(process.cwd(), 'fifa_matches_raw.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log('Saved', results.length, 'records to', outPath);
})();
