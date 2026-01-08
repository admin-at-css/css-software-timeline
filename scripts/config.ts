export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  isPrivate: boolean;
}

export const REPOS: RepoConfig[] = [
  {
    owner: 'admin-at-css',
    repo: 'project-management-app',
    branch: 'main',
    isPrivate: false,
  },
  {
    owner: 'admin-at-css',
    repo: 'pakeaja-design-docs',
    branch: 'main',
    isPrivate: false,
  },
  {
    owner: 'admin-at-css',
    repo: 'css-sales-report-project-brief',
    branch: 'main',
    isPrivate: false,
  },
  {
    owner: 'efacsen',
    repo: 'css-chrome-extension',
    branch: 'main',
    isPrivate: true,
  },
  {
    owner: 'efacsen',
    repo: 'hitung-cat',
    branch: 'main',
    isPrivate: true,
  },
];

export const YAML_FILENAME = 'project-timeline.yaml';
