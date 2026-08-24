import docsConfigJson from './docs.config.json';
import docsSummaryJson from './docs-summary.json';

export interface DocsTable {
  id: string;
  gid: number;
  headers: string[];
  rows: string[][];
  rowCount: number;
  sheetUrl: string;
}

export interface GameDocs {
  game: string;
  spreadsheetId: string;
  updatedAt: string;
  tables: DocsTable[];
}

export interface DocsTableConfig {
  id: string;
  gid: number;
  monoHeaders: string[];
  booleanHeaders: string[];
}

export interface DocsGameConfig {
  spreadsheetId: string;
  tables: DocsTableConfig[];
}

export interface DocsSummaryEntry {
  tableCount: number;
  totalRows: number;
  updatedAt: string;
}

export interface DocsSummary {
  generatedAt: string;
  games: Record<string, DocsSummaryEntry>;
}

export type DocsGameId = 'shipofharkinian' | '2ship2harkinian' | 'starship';

// Static-string dynamic imports so Vite emits one lazy chunk per game —
// the ~1 MB docs payloads never enter the main bundle.
const LOADERS: Record<DocsGameId, () => Promise<{ default: GameDocs }>> = {
  shipofharkinian: () => import('./shipofharkinian.json'),
  '2ship2harkinian': () => import('./2ship2harkinian.json'),
  starship: () => import('./starship.json')
};

export const DOCS_CONFIG = docsConfigJson as { games: Record<DocsGameId, DocsGameConfig> };
export const DOCS_SUMMARY = docsSummaryJson as unknown as DocsSummary;

export const DOCS_GAME_IDS = Object.keys(DOCS_CONFIG.games) as DocsGameId[];

export function isDocsGame(id: string): id is DocsGameId {
  return id in DOCS_CONFIG.games;
}

export function loadGameDocs(id: DocsGameId): Promise<GameDocs> {
  return LOADERS[id]().then(m => m.default);
}

export interface ColumnMeta {
  mono: Set<number>;
  boolean: Set<number>;
}

/** Column display config resolved by header text, so column reordering is harmless. */
export function getColumnMeta(gameId: DocsGameId, table: DocsTable): ColumnMeta {
  const tableCfg = DOCS_CONFIG.games[gameId]?.tables.find(t => t.id === table.id);
  const meta: ColumnMeta = { mono: new Set(), boolean: new Set() };
  if (!tableCfg) return meta;

  table.headers.forEach((header, index) => {
    if (tableCfg.monoHeaders.includes(header)) meta.mono.add(index);
    if (tableCfg.booleanHeaders.includes(header)) meta.boolean.add(index);
  });
  return meta;
}
