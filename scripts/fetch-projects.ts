import 'dotenv/config';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { load } from 'js-yaml';
import { REPOS, YAML_FILENAME, type RepoConfig } from './config.js';

interface ProjectData {
  project: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
  tasks: unknown[];
  [key: string]: unknown;
}

async function fetchFromPublicRepo(config: RepoConfig): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${YAML_FILENAME}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[WARN] Could not fetch from ${config.owner}/${config.repo}: ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.warn(`[WARN] Error fetching from ${config.owner}/${config.repo}:`, error);
    return null;
  }
}

async function fetchFromPrivateRepo(config: RepoConfig): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.warn(`[WARN] No GITHUB_TOKEN found for private repo ${config.owner}/${config.repo}`);
    return null;
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${YAML_FILENAME}?ref=${config.branch}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3.raw',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      console.warn(`[WARN] Could not fetch from private ${config.owner}/${config.repo}: ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.warn(`[WARN] Error fetching from private ${config.owner}/${config.repo}:`, error);
    return null;
  }
}

async function fetchProjectData(config: RepoConfig): Promise<ProjectData | null> {
  console.log(`[INFO] Fetching ${config.owner}/${config.repo}...`);

  const yamlContent = config.isPrivate
    ? await fetchFromPrivateRepo(config)
    : await fetchFromPublicRepo(config);

  if (!yamlContent) {
    return null;
  }

  try {
    const data = load(yamlContent) as ProjectData;

    // Validate minimum required fields
    if (!data.project || !data.project.id || !data.project.name) {
      console.warn(`[WARN] Invalid schema in ${config.owner}/${config.repo}: missing required fields`);
      return null;
    }

    // Add repo URL if not present
    if (!data.project.repository) {
      data.project.repository = {
        url: `https://github.com/${config.owner}/${config.repo}`,
        branch: config.branch,
      };
    }

    console.log(`[OK] Successfully parsed ${config.owner}/${config.repo}`);
    return data;
  } catch (error) {
    console.warn(`[WARN] Failed to parse YAML from ${config.owner}/${config.repo}:`, error);
    return null;
  }
}

async function main() {
  console.log('========================================');
  console.log('Fetching project data from repositories');
  console.log('========================================\n');

  const results = await Promise.all(REPOS.map(fetchProjectData));

  const projects = results.filter((p): p is ProjectData => p !== null);

  console.log(`\n========================================`);
  console.log(`Fetched ${projects.length}/${REPOS.length} projects successfully`);
  console.log('========================================\n');

  // Ensure data directory exists
  const dataDir = './src/data';
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  // Write to JSON file
  const outputPath = `${dataDir}/projects.json`;
  writeFileSync(outputPath, JSON.stringify(projects, null, 2));
  console.log(`[OK] Written to ${outputPath}`);

  // If no projects were fetched, create sample data for development
  if (projects.length === 0) {
    console.log('\n[INFO] No projects fetched. Creating sample data for development...');
    const sampleData = createSampleData();
    writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));
    console.log(`[OK] Sample data written to ${outputPath}`);
  }
}

function createSampleData(): ProjectData[] {
  return [
    {
      project: {
        id: 'project-management-app',
        name: 'Project Management App',
        description: 'Internal project management tool for CSS team',
        status: 'in_progress',
        startDate: '2024-12-01',
        endDate: '2025-03-15',
        estimatedHours: 240,
        actualHours: 85,
        priority: 'high',
        priorityReason: 'Needed for Q1 2025 team expansion',
        stakeholders: [
          { name: 'Kevin Zakaria', role: 'Product Owner' },
          { name: 'CSS Team', role: 'End Users' },
        ],
        repository: {
          url: 'https://github.com/admin-at-css/project-management-app',
          branch: 'main',
        },
        color: '#3498db',
      },
      tasks: [
        {
          id: 'planning',
          name: 'Requirements & Planning',
          startDate: '2024-12-01',
          endDate: '2024-12-15',
          estimatedHours: 20,
          actualHours: 18,
          status: 'completed',
          progress: 100,
          dependencies: [],
        },
        {
          id: 'design',
          name: 'UI/UX Design',
          startDate: '2024-12-10',
          endDate: '2024-12-31',
          estimatedHours: 40,
          actualHours: 35,
          status: 'completed',
          progress: 100,
          dependencies: ['planning'],
        },
        {
          id: 'backend-api',
          name: 'Backend API Development',
          startDate: '2025-01-01',
          endDate: '2025-02-15',
          estimatedHours: 80,
          status: 'in_progress',
          progress: 45,
          dependencies: ['design'],
        },
        {
          id: 'frontend',
          name: 'Frontend Development',
          startDate: '2025-01-15',
          endDate: '2025-03-01',
          estimatedHours: 80,
          status: 'in_progress',
          progress: 20,
          dependencies: ['design', 'backend-api'],
        },
      ],
      monthlyAllocation: {
        '2024-12': 40,
        '2025-01': 60,
        '2025-02': 80,
        '2025-03': 60,
      },
    },
    {
      project: {
        id: 'pakeaja-design-docs',
        name: 'Pakeaja Design Docs',
        description: 'Design documentation for Pakeaja platform',
        status: 'planning',
        startDate: '2025-01-15',
        endDate: '2025-02-28',
        estimatedHours: 80,
        actualHours: 0,
        priority: 'medium',
        priorityReason: 'Foundation for Q2 development',
        stakeholders: [
          { name: 'Kevin Zakaria', role: 'Lead Designer' },
        ],
        repository: {
          url: 'https://github.com/admin-at-css/pakeaja-design-docs',
          branch: 'main',
        },
        color: '#9b59b6',
      },
      tasks: [
        {
          id: 'research',
          name: 'User Research',
          startDate: '2025-01-15',
          endDate: '2025-01-31',
          estimatedHours: 30,
          status: 'pending',
          progress: 0,
          dependencies: [],
        },
        {
          id: 'wireframes',
          name: 'Wireframe Design',
          startDate: '2025-02-01',
          endDate: '2025-02-15',
          estimatedHours: 30,
          status: 'pending',
          progress: 0,
          dependencies: ['research'],
        },
        {
          id: 'documentation',
          name: 'Final Documentation',
          startDate: '2025-02-15',
          endDate: '2025-02-28',
          estimatedHours: 20,
          status: 'pending',
          progress: 0,
          dependencies: ['wireframes'],
        },
      ],
      monthlyAllocation: {
        '2025-01': 30,
        '2025-02': 50,
      },
    },
    {
      project: {
        id: 'css-chrome-extension',
        name: 'CSS Chrome Extension',
        description: 'Browser extension for CSS team productivity',
        status: 'in_progress',
        startDate: '2024-11-15',
        endDate: '2025-01-31',
        estimatedHours: 120,
        actualHours: 70,
        priority: 'high',
        priorityReason: 'Immediate productivity boost needed',
        stakeholders: [
          { name: 'Kevin Zakaria', role: 'Developer' },
          { name: 'Sales Team', role: 'End Users' },
        ],
        repository: {
          url: 'https://github.com/efacsen/css-chrome-extension',
          branch: 'main',
        },
        color: '#e74c3c',
      },
      tasks: [
        {
          id: 'manifest',
          name: 'Extension Setup',
          startDate: '2024-11-15',
          endDate: '2024-11-30',
          estimatedHours: 20,
          actualHours: 18,
          status: 'completed',
          progress: 100,
          dependencies: [],
        },
        {
          id: 'core-features',
          name: 'Core Features',
          startDate: '2024-12-01',
          endDate: '2025-01-15',
          estimatedHours: 60,
          actualHours: 52,
          status: 'in_progress',
          progress: 80,
          dependencies: ['manifest'],
        },
        {
          id: 'polish',
          name: 'Polish & Testing',
          startDate: '2025-01-15',
          endDate: '2025-01-31',
          estimatedHours: 40,
          status: 'pending',
          progress: 0,
          dependencies: ['core-features'],
        },
      ],
      monthlyAllocation: {
        '2024-11': 20,
        '2024-12': 40,
        '2025-01': 60,
      },
    },
  ];
}

main().catch(console.error);
