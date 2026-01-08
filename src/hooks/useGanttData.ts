import { useMemo } from 'react';
import type { ProjectData, GanttTask, GanttLevel, Task, TaskStatus } from '../types/project';

// Colors for task status (matching TASK_STATUS_COLORS)
const TASK_COLORS: Record<TaskStatus, string> = {
  pending: '#94a3b8',    // gray
  in_progress: '#3b82f6', // blue
  completed: '#22c55e',   // green
  blocked: '#ef4444',     // red
};

// Milestone color
const MILESTONE_COLOR = '#a855f7'; // purple

export function useGanttData(projects: ProjectData[], level: GanttLevel) {
  return useMemo(() => {
    if (level === 'project') {
      return projects.map((p) => transformProjectToGantt(p));
    } else {
      return projects.flatMap((p) => transformTasksToGantt(p));
    }
  }, [projects, level]);
}

function transformProjectToGantt(projectData: ProjectData): GanttTask {
  const { project } = projectData;

  // Calculate overall progress from tasks
  const tasks = projectData.tasks || [];
  let progress = 0;

  if (tasks.length > 0) {
    const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    progress = Math.round(totalProgress / tasks.length);
  }

  const statusClass = `status-${project.status.replace('_', '-')}`;

  return {
    id: project.id,
    name: project.name,
    start: project.startDate,
    end: project.endDate || new Date().toISOString().split('T')[0],
    progress,
    dependencies: [], // Projects don't have dependencies at project level (empty array)
    custom_class: statusClass,
  };
}

function transformTasksToGantt(projectData: ProjectData): GanttTask[] {
  const { project, tasks } = projectData;

  if (!tasks || tasks.length === 0) {
    // If no tasks, create a single task from the project
    return [transformProjectToGantt(projectData)];
  }

  return tasks.map((task: Task) => {
    // Prefix task IDs with project ID to ensure uniqueness
    const taskId = `${project.id}__${task.id}`;

    // Transform dependencies to use prefixed IDs (keep as array per frappe-gantt docs)
    const dependencies = task.dependencies.map((dep) => `${project.id}__${dep}`);

    // Determine color based on type and status
    const isMilestone = task.type === 'milestone';
    const barColor = isMilestone ? MILESTONE_COLOR : TASK_COLORS[task.status] || TASK_COLORS.pending;

    // Custom class for additional styling
    const customClass = isMilestone ? 'milestone' : `task-${task.status.replace('_', '-')}`;

    // For milestones, ensure minimum 1-day duration so frappe-gantt renders a visible bar
    // Extend START date backward so the END date (where arrows connect) stays at the milestone date
    let startDate = task.startDate;
    let endDate = task.endDate;
    if (isMilestone && task.startDate === task.endDate) {
      // Subtract 1 day from start date for visibility, keep end date as milestone date
      const date = new Date(task.startDate);
      date.setDate(date.getDate() - 1);
      startDate = date.toISOString().split('T')[0];
    }

    // Clean solid color approach (Linear/Asana style)
    // - Entire bar is solid status color
    // - Progress details shown in TaskDetailsPanel
    return {
      id: taskId,
      name: task.name,
      start: startDate,
      end: endDate,
      progress: task.progress || 0,
      dependencies,
      color: barColor,
      color_progress: barColor, // Same color = solid bar
      custom_class: customClass,
      // Extended metadata for rich popup
      _meta: {
        assignee: task.assignee,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        status: task.status,
        description: task.description,
        projectName: project.name,
        taskName: task.name,
        type: task.type,
      },
    };
  });
}

// Helper to get color for a status (for external use if needed)
export function getTaskStatusColor(status: TaskStatus): string {
  return TASK_COLORS[status] || TASK_COLORS.pending;
}
