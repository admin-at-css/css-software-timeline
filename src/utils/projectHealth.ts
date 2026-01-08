import type { ProjectData, Task } from '../types/project';

export type HealthStatus = 'on_track' | 'at_risk' | 'off_track';

export interface HealthResult {
  status: HealthStatus;
  scheduleVariance: number; // percentage (-100 to +100, negative = behind)
  budgetVariance: number;   // percentage (-100 to +100, negative = over budget)
  details: {
    expectedProgress: number;
    actualProgress: number;
    expectedHours: number;
    actualHours: number;
  };
}

/**
 * Calculate expected progress based on timeline position
 * Returns percentage (0-100) of how far through the project we should be
 */
function calculateExpectedProgress(startDate: string, endDate: string | null): number {
  if (!endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // If project hasn't started yet
  if (now < start) return 0;

  // If project is past end date
  if (now > end) return 100;

  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();

  return Math.round((elapsed / totalDuration) * 100);
}

/**
 * Calculate actual progress based on completed tasks
 * Uses task progress weighted by estimated hours
 */
function calculateActualProgress(tasks: Task[]): number {
  // Filter out milestones
  const actualTasks = tasks.filter(t => t.type !== 'milestone');

  if (actualTasks.length === 0) return 0;

  const totalEstimatedHours = actualTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  if (totalEstimatedHours === 0) {
    // Fallback: simple average of progress if no hours estimated
    const totalProgress = actualTasks.reduce((sum, t) => sum + t.progress, 0);
    return Math.round(totalProgress / actualTasks.length);
  }

  // Weighted progress by estimated hours
  const weightedProgress = actualTasks.reduce((sum, t) => {
    return sum + (t.progress * t.estimatedHours);
  }, 0);

  return Math.round(weightedProgress / totalEstimatedHours);
}

/**
 * Calculate project health based on schedule and budget variance
 */
export function calculateProjectHealth(project: ProjectData): HealthResult {
  const { project: meta, tasks } = project;

  // Calculate progress metrics
  const expectedProgress = calculateExpectedProgress(meta.startDate, meta.endDate);
  const actualProgress = calculateActualProgress(tasks);

  // Schedule variance: positive = ahead, negative = behind
  // e.g., expected 50%, actual 60% = +10% (ahead)
  const scheduleVariance = actualProgress - expectedProgress;

  // Budget variance: compare actual hours to what we should have spent
  // Expected hours = (actual progress / 100) * estimated hours
  const expectedHoursForProgress = (actualProgress / 100) * meta.estimatedHours;
  const actualHours = meta.actualHours || 0;

  // Budget variance: positive = under budget, negative = over budget
  // e.g., expected 50h for this progress, spent 40h = +20% under budget
  let budgetVariance = 0;
  if (expectedHoursForProgress > 0) {
    budgetVariance = Math.round(((expectedHoursForProgress - actualHours) / expectedHoursForProgress) * 100);
  }

  // Determine health status based on variances
  // Use the worse of the two variances (most negative)
  const worstVariance = Math.min(scheduleVariance, budgetVariance);

  let status: HealthStatus;
  if (worstVariance >= -10) {
    status = 'on_track';
  } else if (worstVariance >= -25) {
    status = 'at_risk';
  } else {
    status = 'off_track';
  }

  // Special case: completed projects are always on track
  if (meta.status === 'completed') {
    status = 'on_track';
  }

  return {
    status,
    scheduleVariance,
    budgetVariance,
    details: {
      expectedProgress,
      actualProgress,
      expectedHours: Math.round(expectedHoursForProgress),
      actualHours,
    },
  };
}

/**
 * Get display properties for health status
 */
export function getHealthDisplay(status: HealthStatus): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  switch (status) {
    case 'on_track':
      return {
        label: 'On Track',
        color: '#22c55e',
        bgColor: 'bg-emerald-50',
        icon: '●',
      };
    case 'at_risk':
      return {
        label: 'At Risk',
        color: '#f59e0b',
        bgColor: 'bg-amber-50',
        icon: '●',
      };
    case 'off_track':
      return {
        label: 'Off Track',
        color: '#ef4444',
        bgColor: 'bg-red-50',
        icon: '●',
      };
  }
}
