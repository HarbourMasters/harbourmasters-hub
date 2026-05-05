import { GitHubRelease, GitHubError, GitHubReleaseWithRepo } from '@/types/github';

const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const CACHE_KEY_PREFIX = 'github_cache_';
const CACHE_VERSION = 'v2'; // For cache busting if needed

// Rate limiting: space out requests to avoid hitting GitHub's rate limit
const REQUEST_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;
async function rateLimitFetch(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

interface CacheEntry {
  data: GitHubRelease[];
  timestamp: number;
  version: string;
}

// In-memory cache for faster access
const releaseCache = new Map<string, CacheEntry>();

// Request deduplication: track in-flight requests
const pendingRequests = new Map<string, Promise<GitHubRelease[]>>();

/**
 * Initialize cache from localStorage on module load
 */
function initCacheFromStorage(): void {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '');
          const repoKey = key.replace(CACHE_KEY_PREFIX, '');

          // Check if cache is still valid
          if (Date.now() - entry.timestamp < CACHE_TTL && entry.version === CACHE_VERSION) {
            releaseCache.set(repoKey, entry);
          } else {
            // Remove expired cache
            localStorage.removeItem(key);
          }
        } catch {
          // Invalid JSON, remove the key
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to initialize cache from localStorage:', error);
  }
}

// Initialize cache on load
initCacheFromStorage();

// One-time cleanup of old v1 cache with different key format
try {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key === 'github_stats_cache') {
      localStorage.removeItem(key);
    }
  }
} catch (error) {
  // Ignore cleanup errors
}

/**
 * Save cache entry to localStorage
 */
function saveCacheToStorage(key: string, entry: CacheEntry): void {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
  } catch (error) {
    // Could be quota exceeded or privacy mode
    console.warn('Failed to save cache to localStorage:', error);
  }
}

/**
 * Get cache age description for UI
 */
export function getCacheAge(repoKey: string): string | null {
  const cached = releaseCache.get(repoKey);
  if (!cached) return null;

  const ageMs = Date.now() - cached.timestamp;
  const minutes = Math.floor(ageMs / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Check if cache is stale (older than 90% of TTL)
 */
export function isCacheStale(repoKey: string): boolean {
  const cached = releaseCache.get(repoKey);
  if (!cached) return true;

  const ageMs = Date.now() - cached.timestamp;
  return ageMs > (CACHE_TTL * 0.9);
}

export class GitHubAPIError extends Error implements GitHubError {
  status?: number;
  isRateLimit?: boolean;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GitHubAPIError';
    this.status = status;
    this.isRateLimit = status === 403 || status === 429;
  }
}

/**
 * Parse Link header to get pagination URLs
 * GitHub format: <url>; rel="next", <url>; rel="last", etc.
 */
function parseLinkHeader(linkHeader: string | null): Record<string, string> {
  if (!linkHeader) return {};

  const links: Record<string, string> = {};
  // Split by comma to get each link
  const parts = linkHeader.split(',');

  for (const part of parts) {
    // Split url and rel parts
    const sections = part.split(';');
    if (sections.length < 2) continue;

    // Extract URL from <url>
    const urlMatch = sections[0].match(/<([^>]+)>/);
    if (!urlMatch) continue;

    const url = urlMatch[1];

    // Extract all rel values (can be multiple like rel="next" rel="page")
    for (let i = 1; i < sections.length; i++) {
      const relMatch = sections[i].match(/rel="([^"]+)"/);
      if (relMatch) {
        links[relMatch[1]] = url;
      }
    }
  }

  return links;
}

/**
 * Get ALL releases for a repository (handles pagination)
 */
export async function getReleases(
  owner: string,
  repo: string,
  useCache = true
): Promise<GitHubRelease[]> {
  const cacheKey = `${owner}/${repo}`;

  // Check cache first
  if (useCache) {
    const cached = releaseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Using cached data for ${cacheKey}: ${cached.data.length} releases`);
      return cached.data;
    }
  }

  // Check if there's already a pending request for this repo
  const existingRequest = pendingRequests.get(cacheKey);
  if (existingRequest) {
    return existingRequest;
  }

  // Create new request
  const requestPromise = (async () => {
    const allReleases: GitHubRelease[] = [];
    let url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases?per_page=100`;
    let pageCount = 0;

    try {
      // Fetch all pages
      while (url) {
        pageCount++;
        console.log(`Fetching page ${pageCount} for ${cacheKey}...`);

        // Rate limit: wait before making request
        await rateLimitFetch();

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(import.meta.env.VITE_GITHUB_TOKEN && {
              'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
            })
          }
        });

        if (!response.ok) {
          // If rate limited, try to return stale cache or partial results
          if (response.status === 403 || response.status === 429) {
            const cached = releaseCache.get(cacheKey);
            if (cached && cached.data.length > 0) {
              console.warn(`GitHub rate limit hit for ${cacheKey}, using cached data (${cached.data.length} releases)`);
              return cached.data;
            }
            // Return partial results if we have some
            if (allReleases.length > 0) {
              console.warn(`GitHub rate limit hit for ${cacheKey}, returning ${allReleases.length} releases fetched so far`);
              return allReleases;
            }
          }
          throw new GitHubAPIError(
            `GitHub API error: ${response.statusText}`,
            response.status
          );
        }

        const data: GitHubRelease[] = await response.json();
        console.log(`Page ${pageCount}: fetched ${data.length} releases`);
        allReleases.push(...data);

        // Check for next page in Link header
        const linkHeader = response.headers.get('Link');
        const links = parseLinkHeader(linkHeader);

        if (linkHeader) {
          console.log(`Link header: ${linkHeader}`);
        }
        console.log(`Parsed links:`, links);

        url = links.next || '';

        // Small delay between pages to be extra safe with rate limits
        if (url) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`Total releases fetched for ${cacheKey}: ${allReleases.length}`);

      // Cache the result
      const entry: CacheEntry = {
        data: allReleases,
        timestamp: Date.now(),
        version: CACHE_VERSION
      };
      releaseCache.set(cacheKey, entry);
      saveCacheToStorage(cacheKey, entry);

      return allReleases;
    } catch (error) {
      // On any error, try to return cached data as fallback
      const cached = releaseCache.get(cacheKey);
      if (cached && cached.data.length > 0) {
        console.warn(`Error fetching ${cacheKey}, using cached data (${cached.data.length} releases):`, error);
        return cached.data;
      }

      if (error instanceof GitHubAPIError) {
        throw error;
      }
      throw new GitHubAPIError(
        error instanceof Error ? error.message : 'Failed to fetch releases'
      );
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Get the latest release for a repository
 */
export async function getLatestRelease(
  owner: string,
  repo: string,
  useCache = true
): Promise<GitHubRelease | null> {
  const releases = await getReleases(owner, repo, useCache);
  // GitHub returns releases in reverse chronological order
  return releases[0] || null;
}

/**
 * Get releases for multiple repositories (sequentially to avoid rate limiting)
 */
export async function getAllReleases(
  repos: Array<{ owner: string; name: string; id: string }>,
  useCache = true
): Promise<GitHubReleaseWithRepo[]> {
  // Process sequentially to avoid rate limiting
  const results: GitHubReleaseWithRepo[] = [];

  for (const { owner, name, id } of repos) {
    try {
      const releases = await getReleases(owner, name, useCache);
      for (const release of releases) {
        results.push({
          ...release,
          repoName: `${owner}/${name}`,
          repoId: id
        });
      }
    } catch (error) {
      console.error(`Failed to fetch releases for ${owner}/${name}:`, error);
      // Continue with next repo
    }
  }

  return results.sort((a, b) =>
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

/**
 * Clear the release cache (both memory and localStorage)
 */
export function clearReleaseCache(): void {
  releaseCache.clear();
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('Failed to clear cache from localStorage:', error);
  }
}

/**
 * Parse platform from asset name
 */
export function parsePlatform(assetName: string): 'windows' | 'linux' | 'mac' | 'switch' | 'wiiu' | null {
  const lower = assetName.toLowerCase();

  if (lower.includes('win') || lower.includes('windows')) {
    return 'windows';
  }
  if (lower.includes('linux') || lower.includes('ubuntu')) {
    return 'linux';
  }
  if (lower.includes('macos') || lower.includes('osx') || lower.includes('darwin') || lower.endsWith('.dmg') || /(?:^|[-_\s.])mac(?:[-_\s.]|$)/.test(lower)) {
    return 'mac';
  }
  if (lower.includes('switch')) {
    return 'switch';
  }
  if ((lower.includes('wii') && lower.includes('u')) || lower.includes('wiiu')) {
    return 'wiiu';
  }

  return null;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format download count
 */
export function formatDownloadCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
