export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  isPrivate: boolean;
}

export const REPOS: RepoConfig[] = [
  // This repo (dogfooding - tracking itself)
  {
    owner: 'admin-at-css',
    repo: 'css-software-timeline',
    branch: 'main',
    isPrivate: false,
  },
  // CSS Chrome Extension - browser extension for CSS team productivity
  // Note: Needs timeline.yaml to be added to this repo
  {
    owner: 'efacsen',
    repo: 'css-chrome-extension',
    branch: 'main',
    isPrivate: true,
  },
  // Add more repos here as they adopt timeline.yaml
];

export const YAML_FILENAME = 'timeline.yaml';
