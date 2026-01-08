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
  // Future repos can be added here as they adopt timeline.yaml
  // {
  //   owner: 'admin-at-css',
  //   repo: 'project-management-app',
  //   branch: 'main',
  //   isPrivate: false,
  // },
];

export const YAML_FILENAME = 'timeline.yaml';
