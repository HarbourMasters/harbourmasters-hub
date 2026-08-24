/**
 * Syncs the Harbour Masters asset documentation Google Sheets into
 * committed JSON files under src/data/docs/.
 *
 * Usage:
 *   npm run sync:docs            # sync all games
 *   node scripts/sync-docs.mjs --game=starship
 *
 * Reads table/spreadsheet config from src/data/docs/docs.config.json,
 * fetches each tab as CSV (public sheets only), parses it, trims junk
 * columns/rows, and writes one JSON per game plus docs-summary.json.
 * The site imports these files; it never talks to Google at runtime.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(ROOT, 'src/data/docs/docs.config.json');
const OUT_DIR = resolve(ROOT, 'src/data/docs');

const gameFilter = (() => {
  const arg = process.argv.find(a => a.startsWith('--game='));
  return arg ? arg.slice('--game='.length) : null;
})();

/** RFC-4180 CSV parser: quoted fields, embedded commas/newlines, "" escapes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  const endField = () => { row.push(field); field = ''; };
  const endRow = () => { endField(); rows.push(row); row = []; };

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ',') { endField(); i++; continue; }
    if (ch === '\r') { i++; continue; } // handles \r\n and stray \r
    if (ch === '\n') { endRow(); i++; continue; }
    field += ch; i++;
  }
  if (field.length > 0 || row.length > 0) endRow();

  return rows;
}

const clean = value => value.replace(/\s+/g, ' ').trim();

/** Drops trailing blank-header columns and fully-empty rows; trims cells. */
function normalize(parsed) {
  if (parsed.length === 0) return { headers: [], rows: [] };

  const headers = parsed[0].map(clean);
  while (headers.length > 0 && headers[headers.length - 1] === '') headers.pop();

  const colCount = headers.length;
  const rows = [];
  for (let r = 1; r < parsed.length; r++) {
    const cells = parsed[r].slice(0, colCount).map(clean);
    while (cells.length < colCount) cells.push('');
    if (cells.every(c => c === '')) continue;
    rows.push(cells);
  }
  return { headers, rows };
}

async function fetchCsv(spreadsheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url, { redirect: 'follow' });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('text/csv')) {
    // Google serves an HTML consent/error page when a sheet is not publicly readable.
    throw new Error(`Expected CSV, got ${res.status} ${contentType || '(no content-type)'} for gid=${gid}`);
  }
  return res.text();
}

async function fetchWithRetry(spreadsheetId, gid) {
  try {
    return await fetchCsv(spreadsheetId, gid);
  } catch (err) {
    console.warn(`  retrying gid=${gid} after: ${err.message}`);
    return fetchCsv(spreadsheetId, gid);
  }
}

const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
const gameIds = Object.keys(config.games).filter(id => !gameFilter || id === gameFilter);

if (gameIds.length === 0) {
  console.error(`No games matched${gameFilter ? ` (--game=${gameFilter})` : ''}. Known: ${Object.keys(config.games).join(', ')}`);
  process.exit(1);
}

const updatedAt = new Date().toISOString();
const summaryGames = {};
let hadError = false;

for (const gameId of gameIds) {
  const gameCfg = config.games[gameId];
  console.log(`\n${gameId} (spreadsheet ${gameCfg.spreadsheetId}):`);
  const tables = [];

  for (const tableCfg of gameCfg.tables) {
    try {
      const csv = await fetchWithRetry(gameCfg.spreadsheetId, tableCfg.gid);
      const { headers, rows } = normalize(parseCsv(csv));
      tables.push({
        id: tableCfg.id,
        gid: tableCfg.gid,
        headers,
        rows,
        rowCount: rows.length,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${gameCfg.spreadsheetId}/edit#gid=${tableCfg.gid}`
      });
      console.log(`  ${tableCfg.id.padEnd(24)} ${String(rows.length).padStart(6)} rows`);
    } catch (err) {
      hadError = true;
      console.error(`  ✗ ${tableCfg.id} (gid=${tableCfg.gid}): ${err.message}`);
    }
  }

  if (tables.length === 0) {
    console.error(`  no tables synced for ${gameId}; leaving existing file untouched`);
    continue;
  }

  const payload = { game: gameId, spreadsheetId: gameCfg.spreadsheetId, updatedAt, tables };
  writeFileSync(resolve(OUT_DIR, `${gameId}.json`), JSON.stringify(payload) + '\n');

  summaryGames[gameId] = {
    tableCount: tables.length,
    totalRows: tables.reduce((sum, t) => sum + t.rowCount, 0),
    updatedAt
  };
}

// Merge into the existing summary so a --game= filtered run doesn't wipe other games.
const summaryPath = resolve(OUT_DIR, 'docs-summary.json');
let summary;
try {
  summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
} catch {
  summary = { generatedAt: updatedAt, games: {} };
}
summary.generatedAt = updatedAt;
summary.games = { ...summary.games, ...summaryGames };
writeFileSync(summaryPath, JSON.stringify(summary) + '\n');

console.log(`\nWrote ${Object.keys(summaryGames).length} game file(s) + docs-summary.json`);
if (hadError) {
  console.error('\nSome tabs failed to sync — site keeps the last committed data, but re-run before committing.');
  process.exitCode = 1;
}
