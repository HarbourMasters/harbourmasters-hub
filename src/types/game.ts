import { ThemeId } from './theme';

export type Platform = 'windows' | 'linux' | 'mac' | 'switch';

export interface DownloadAsset {
  platform: Platform;
  name: string;
  url: string;
  size: number;
  downloadCount: number;
}

export interface GameRelease {
  version: string;
  name: string;
  date: string;
  changelog: string;
  assets: DownloadAsset[];
}

export interface Game {
  id: string;
  name: string;
  fullName: string;
  tagline: string;
  description: string;
  themeId: ThemeId;
  gradient?: string;
  icon?: string;
  stars?: string;
  latestVersion?: string;
  repo: {
    owner: string;
    name: string;
  };
  features: string[];
  latestRelease?: GameRelease;
  releases: GameRelease[];
  links: {
    github: string;
    discord?: string;
    wiki?: string;
  };
  gamebanana?: {
    gameId: number;
    url: string;
    slug: string;
  };
  screenshots?: string[];
  version?: string;
}

export type GameId = 'shipofharkinian' | '2ship2harkinian' | 'ghostship' | 'spaghettikart' | 'starship';
