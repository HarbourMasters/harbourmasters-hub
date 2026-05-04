import { useState, useEffect, useCallback } from 'react';
import { GitHubRelease, GitHubReleaseWithRepo, GitHubError } from '@/types/github';
import {
  getReleases,
  getLatestRelease,
  getAllReleases,
  clearReleaseCache
} from '@/utils/github-api';
import { GAMES } from '@/data/games';
import type { GameId } from '@/types/game';

interface UseReleasesResult {
  releases: GitHubRelease[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseLatestReleaseResult {
  release: GitHubRelease | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseAllReleasesResult {
  releases: GitHubReleaseWithRepo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all releases for a game
 */
export function useReleases(gameId: GameId, useCache = true): UseReleasesResult {
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = useCallback(async () => {
    const game = GAMES[gameId];
    if (!game) {
      setError('Game not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getReleases(game.repo.owner, game.repo.name, useCache);
      setReleases(data);
    } catch (err) {
      setError(
        err instanceof Error && 'message' in err
          ? (err as GitHubError).message || 'Failed to fetch releases'
          : 'Failed to fetch releases'
      );
    } finally {
      setLoading(false);
    }
  }, [gameId, useCache]);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  return { releases, loading, error, refetch: fetchReleases };
}

/**
 * Hook to fetch the latest release for a game
 */
export function useLatestRelease(gameId: GameId, useCache = true): UseLatestReleaseResult {
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelease = useCallback(async () => {
    const game = GAMES[gameId];
    if (!game) {
      setError('Game not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getLatestRelease(game.repo.owner, game.repo.name, useCache);
      setRelease(data);
    } catch (err) {
      setError(
        err instanceof Error && 'message' in err
          ? (err as GitHubError).message || 'Failed to fetch release'
          : 'Failed to fetch release'
      );
    } finally {
      setLoading(false);
    }
  }, [gameId, useCache]);

  useEffect(() => {
    fetchRelease();
  }, [fetchRelease]);

  return { release, loading, error, refetch: fetchRelease };
}

/**
 * Hook to fetch releases for all games
 */
export function useAllReleases(useCache = true): UseAllReleasesResult {
  const [releases, setReleases] = useState<GitHubReleaseWithRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const repos = Object.values(GAMES).map(game => ({
        owner: game.repo.owner,
        name: game.repo.name,
        id: game.id
      }));

      const data = await getAllReleases(repos, useCache);

      // Get only the latest release from each repo
      const latestByRepo = new Map<string, GitHubReleaseWithRepo>();
      for (const release of data) {
        if (!latestByRepo.has(release.repoId)) {
          latestByRepo.set(release.repoId, release);
        }
      }

      setReleases(Array.from(latestByRepo.values())
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      );
    } catch (err) {
      setError(
        err instanceof Error && 'message' in err
          ? (err as GitHubError).message || 'Failed to fetch releases'
          : 'Failed to fetch releases'
      );
    } finally {
      setLoading(false);
    }
  }, [useCache]);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  return { releases, loading, error, refetch: fetchReleases };
}

/**
 * Hook to clear the release cache
 */
export function useClearCache() {
  return useCallback(() => {
    clearReleaseCache();
  }, []);
}
