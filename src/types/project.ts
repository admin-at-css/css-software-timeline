export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface Stakeholder {
  name: string;
  role: string;
}

export interface Repository {
  url: string;
  branch?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours?: number;
  status: TaskStatus;
  progress: number; // 0-100
  dependencies: string[]; // task IDs
  assignee?: string;
  type?: 'task' | 'milestone';
}

export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
  estimatedHours: number;
  actualHours?: number;
  priority: Priority;
  priorityReason?: string;
  stakeholders: Stakeholder[];
  repository: Repository;
  color?: string;
}

export interface MonthlyAllocation {
  [month: string]: number; // e.g., "2024-12": 40
}

export interface ProjectData {
  project: ProjectMetadata;
  tasks: Task[];
  monthlyAllocation?: MonthlyAllocation;
  metadata?: {
    lastUpdated: string;
    schemaVersion: string;
  };
}

// For Gantt chart display
export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string[]; // Array of task IDs per frappe-gantt docs
  color?: string; // Bar color (frappe-gantt)
  color_progress?: string; // Progress bar color (frappe-gantt)
  custom_class?: string;
  // Extended metadata for rich popup display
  _meta?: {
    assignee?: string;
    estimatedHours: number;
    actualHours?: number;
    status: TaskStatus;
    description?: string;
    projectName: string;
    taskName: string;
    type?: 'task' | 'milestone';
  };
}

// View modes for the Gantt chart
export type ViewMode = 'Day' | 'Week' | 'Month' | 'Year';
export type GanttLevel = 'project' | 'task';

// Filter state
export interface FilterState {
  status: ProjectStatus | 'all';
  priority: Priority | 'all';
  search: string;
}

// Monthly hours summary
export interface MonthlyHoursSummary {
  month: string;
  estimated: number;
  actual: number;
  projects: {
    projectId: string;
    projectName: string;
    hours: number;
  }[];
}
