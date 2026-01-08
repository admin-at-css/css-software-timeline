import yaml from 'js-yaml';
import type { ProjectData, ProjectMetadata, Task } from '../types/project';

interface YamlProject {
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string | null;
    estimatedHours: number;
    actualHours?: number;
    priority: string;
    priorityReason?: string;
    stakeholders: { name: string; role: string }[];
    repository: { url: string; branch?: string };
    color?: string;
  };
  tasks: {
    id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    estimatedHours: number;
    actualHours?: number;
    status: string;
    progress: number;
    dependencies: string[];
    assignee?: string;
    type?: string;
  }[];
  monthlyAllocation?: Record<string, number>;
  metadata?: {
    lastUpdated: string;
    schemaVersion: string;
  };
}

export interface ParseResult {
  success: boolean;
  data?: ProjectData;
  error?: string;
}

/**
 * Validates a date string is in YYYY-MM-DD format
 */
function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validates the project status value
 */
function isValidProjectStatus(status: string): boolean {
  return ['draft', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled'].includes(status);
}

/**
 * Validates the task status value
 */
function isValidTaskStatus(status: string): boolean {
  return ['pending', 'in_progress', 'completed', 'blocked'].includes(status);
}

/**
 * Validates the priority value
 */
function isValidPriority(priority: string): boolean {
  return ['critical', 'high', 'medium', 'low'].includes(priority);
}

/**
 * Validates the parsed YAML structure
 */
function validateYamlStructure(data: YamlProject): string | null {
  // Check required project fields
  if (!data.project) {
    return 'Missing required "project" section';
  }

  const { project } = data;

  if (!project.id || typeof project.id !== 'string') {
    return 'Missing or invalid project.id';
  }

  if (!project.name || typeof project.name !== 'string') {
    return 'Missing or invalid project.name';
  }

  if (!project.description || typeof project.description !== 'string') {
    return 'Missing or invalid project.description';
  }

  if (!isValidProjectStatus(project.status)) {
    return `Invalid project.status: "${project.status}". Must be one of: draft, planning, in_progress, on_hold, completed, cancelled`;
  }

  if (!isValidDate(project.startDate)) {
    return `Invalid project.startDate: "${project.startDate}". Must be YYYY-MM-DD format`;
  }

  if (project.endDate && !isValidDate(project.endDate)) {
    return `Invalid project.endDate: "${project.endDate}". Must be YYYY-MM-DD format or null`;
  }

  if (typeof project.estimatedHours !== 'number' || project.estimatedHours < 0) {
    return 'project.estimatedHours must be a non-negative number';
  }

  if (!isValidPriority(project.priority)) {
    return `Invalid project.priority: "${project.priority}". Must be one of: critical, high, medium, low`;
  }

  if (!Array.isArray(project.stakeholders) || project.stakeholders.length === 0) {
    return 'project.stakeholders must be a non-empty array';
  }

  if (!project.repository || !project.repository.url) {
    return 'Missing required project.repository.url';
  }

  // Check tasks
  if (!Array.isArray(data.tasks)) {
    return 'Missing or invalid "tasks" array';
  }

  const taskIds = new Set<string>();

  for (let i = 0; i < data.tasks.length; i++) {
    const task = data.tasks[i];
    const prefix = `tasks[${i}]`;

    if (!task.id || typeof task.id !== 'string') {
      return `${prefix}: Missing or invalid id`;
    }

    if (taskIds.has(task.id)) {
      return `${prefix}: Duplicate task id "${task.id}"`;
    }
    taskIds.add(task.id);

    if (!task.name || typeof task.name !== 'string') {
      return `${prefix}: Missing or invalid name`;
    }

    if (!isValidDate(task.startDate)) {
      return `${prefix}: Invalid startDate "${task.startDate}"`;
    }

    if (!isValidDate(task.endDate)) {
      return `${prefix}: Invalid endDate "${task.endDate}"`;
    }

    if (typeof task.estimatedHours !== 'number' || task.estimatedHours < 0) {
      return `${prefix}: estimatedHours must be a non-negative number`;
    }

    if (!isValidTaskStatus(task.status)) {
      return `${prefix}: Invalid status "${task.status}"`;
    }

    if (typeof task.progress !== 'number' || task.progress < 0 || task.progress > 100) {
      return `${prefix}: progress must be a number between 0 and 100`;
    }

    if (!Array.isArray(task.dependencies)) {
      return `${prefix}: dependencies must be an array`;
    }
  }

  // Validate dependency references
  for (const task of data.tasks) {
    for (const depId of task.dependencies) {
      if (!taskIds.has(depId)) {
        return `Task "${task.id}" has invalid dependency "${depId}" - task not found`;
      }
    }
  }

  return null;
}

/**
 * Converts validated YAML data to ProjectData type
 */
function convertToProjectData(data: YamlProject): ProjectData {
  const project: ProjectMetadata = {
    id: data.project.id,
    name: data.project.name,
    description: data.project.description,
    status: data.project.status as ProjectMetadata['status'],
    startDate: data.project.startDate,
    endDate: data.project.endDate,
    estimatedHours: data.project.estimatedHours,
    actualHours: data.project.actualHours,
    priority: data.project.priority as ProjectMetadata['priority'],
    priorityReason: data.project.priorityReason,
    stakeholders: data.project.stakeholders,
    repository: {
      url: data.project.repository.url,
      branch: data.project.repository.branch,
    },
    color: data.project.color,
  };

  const tasks: Task[] = data.tasks.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    startDate: t.startDate,
    endDate: t.endDate,
    estimatedHours: t.estimatedHours,
    actualHours: t.actualHours,
    status: t.status as Task['status'],
    progress: t.progress,
    dependencies: t.dependencies,
    assignee: t.assignee,
    type: t.type as Task['type'],
  }));

  return {
    project,
    tasks,
    monthlyAllocation: data.monthlyAllocation,
    metadata: data.metadata,
  };
}

/**
 * Parses a YAML string and returns a ProjectData object
 */
export function parseTimelineYaml(yamlContent: string): ParseResult {
  try {
    // Parse YAML
    const parsed = yaml.load(yamlContent) as YamlProject;

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        error: 'Invalid YAML: Could not parse content',
      };
    }

    // Validate structure
    const validationError = validateYamlStructure(parsed);
    if (validationError) {
      return {
        success: false,
        error: `Validation error: ${validationError}`,
      };
    }

    // Convert to ProjectData
    const projectData = convertToProjectData(parsed);

    return {
      success: true,
      data: projectData,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      error: `YAML parse error: ${message}`,
    };
  }
}

/**
 * Reads a file and parses it as timeline YAML
 */
export async function parseTimelineFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        resolve({ success: false, error: 'Could not read file content' });
        return;
      }
      resolve(parseTimelineYaml(content));
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Error reading file' });
    };

    reader.readAsText(file);
  });
}
