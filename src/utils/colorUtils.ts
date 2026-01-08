import type { ProjectStatus, Priority, TaskStatus } from '../types/project';

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: '#94a3b8',
  planning: '#a78bfa',
  in_progress: '#fbbf24',
  on_hold: '#f97316',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending: '#94a3b8',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  blocked: '#ef4444',
};

export function getStatusColor(status: ProjectStatus): string {
  return STATUS_COLORS[status] || '#94a3b8';
}

export function getPriorityColor(priority: Priority): string {
  return PRIORITY_COLORS[priority] || '#94a3b8';
}

export function getTaskStatusColor(status: TaskStatus): string {
  return TASK_STATUS_COLORS[status] || '#94a3b8';
}

export function getStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    draft: 'Draft',
    planning: 'Planning',
    in_progress: 'In Progress',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return labels[priority] || priority;
}
