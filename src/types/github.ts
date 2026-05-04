export interface GitHubAsset {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: string | null;
  content_type: string;
  state: string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string;
}

export interface GitHubAuthor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface GitHubRelease {
  url: string;
  id: number;
  html_url: string;
  tag_name: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  author: GitHubAuthor;
  body: string;
  assets: GitHubAsset[];
}

export interface GitHubReleaseWithRepo extends GitHubRelease {
  repoName: string;
  repoId: string;
}

export interface GitHubError {
  message: string;
  status?: number;
}

export type GitHubReleasesMap = Record<string, GitHubRelease[]>;
