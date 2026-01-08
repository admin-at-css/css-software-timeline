import type { ProjectData, Task } from '../types/project';

export type ForecastConfidence = 'high' | 'medium' | 'low' | 'unavailable';

export interface CompletionForecast {
  projectedDate: string | null;
  daysAheadBehind: number;       // Positive = ahead, negative = behind
  velocityHoursPerDay: number;
  remainingHours: number;
  completionPercentage: number;
  confidence: ForecastConfidence;
  message: string;
}

/**
 * Calculate weighted completion percentage based on task progress and hours
 */
function calculateCompletionPercentage(tasks: Task[]): number {
  const actualTasks = tasks.filter(t => t.type !== 'milestone');

  if (actualTasks.length === 0) return 0;

  const totalEstimatedHours = actualTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  if (totalEstimatedHours === 0) {
    const totalProgress = actualTasks.reduce((sum, t) => sum + t.progress, 0);
    return Math.round(totalProgress / actualTasks.length);
  }

  const weightedProgress = actualTasks.reduce((sum, t) => {
    return sum + (t.progress * t.estimatedHours);
  }, 0);

  return Math.round(weightedProgress / totalEstimatedHours);
}

/**
 * Calculate elapsed working days since project start
 */
function getElapsedDays(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffMs = now.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Format a date string to ISO date format (YYYY-MM-DD)
 */
function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculate completion forecast for a project
 */
export function calculateCompletionForecast(project: ProjectData): CompletionForecast {
  const { project: meta, tasks } = project;

  // Default unavailable result
  const unavailable: CompletionForecast = {
    projectedDate: null,
    daysAheadBehind: 0,
    velocityHoursPerDay: 0,
    remainingHours: 0,
    completionPercentage: 0,
    confidence: 'unavailable',
    message: 'Forecast unavailable',
  };

  // Can't forecast without an end date
  if (!meta.endDate) {
    return { ...unavailable, message: 'No deadline set' };
  }

  const now = new Date();
  const start = new Date(meta.startDate);
  const end = new Date(meta.endDate);
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Project hasn't started yet
  if (now < start) {
    return { ...unavailable, message: 'Project not started' };
  }

  // Project is completed
  if (meta.status === 'completed') {
    return {
      projectedDate: meta.endDate,
      daysAheadBehind: 0,
      velocityHoursPerDay: 0,
      remainingHours: 0,
      completionPercentage: 100,
      confidence: 'high',
      message: 'Project completed',
    };
  }

  const actualHours = meta.actualHours || 0;
  const estimatedHours = meta.estimatedHours;
  const completionPercentage = calculateCompletionPercentage(tasks);

  // No progress yet - can't calculate velocity
  if (actualHours === 0 || completionPercentage === 0) {
    return {
      ...unavailable,
      completionPercentage,
      remainingHours: estimatedHours,
      message: 'Not enough data to forecast',
    };
  }

  // Calculate velocity and projection
  const elapsedDays = getElapsedDays(meta.startDate);
  const velocityHoursPerDay = actualHours / elapsedDays;
  const remainingHours = Math.max(0, estimatedHours - actualHours);

  // Project days until deadline
  const daysUntilDeadline = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // If velocity is very low, avoid division issues
  if (velocityHoursPerDay < 0.1) {
    return {
      projectedDate: null,
      daysAheadBehind: -999,
      velocityHoursPerDay,
      remainingHours,
      completionPercentage,
      confidence: 'low',
      message: 'Velocity too low to forecast',
    };
  }

  // Calculate projected completion
  const daysToComplete = Math.ceil(remainingHours / velocityHoursPerDay);
  const projectedDate = new Date(now);
  projectedDate.setDate(projectedDate.getDate() + daysToComplete);

  // Days ahead/behind: positive = ahead (finishing before deadline)
  const daysAheadBehind = daysUntilDeadline - daysToComplete;

  // Determine confidence based on data quality
  let confidence: ForecastConfidence;
  if (elapsedDays >= 14 && completionPercentage >= 20) {
    confidence = 'high';
  } else if (elapsedDays >= 7 && completionPercentage >= 10) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Generate message
  let message: string;
  if (daysAheadBehind >= 0) {
    if (daysAheadBehind === 0) {
      message = 'On track to meet deadline';
    } else if (daysAheadBehind === 1) {
      message = '1 day ahead of schedule';
    } else {
      message = `${daysAheadBehind} days ahead of schedule`;
    }
  } else {
    const behind = Math.abs(daysAheadBehind);
    if (behind === 1) {
      message = '1 day behind schedule';
    } else {
      message = `${behind} days behind schedule`;
    }
  }

  return {
    projectedDate: formatISODate(projectedDate),
    daysAheadBehind,
    velocityHoursPerDay: Math.round(velocityHoursPerDay * 10) / 10,
    remainingHours,
    completionPercentage,
    confidence,
    message,
  };
}

/**
 * Get display properties for forecast status
 */
export function getForecastDisplay(forecast: CompletionForecast): {
  color: string;
  bgColor: string;
  textColor: string;
} {
  if (forecast.confidence === 'unavailable') {
    return { color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
  }

  if (forecast.daysAheadBehind >= 3) {
    // Well ahead
    return { color: 'green', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' };
  } else if (forecast.daysAheadBehind >= 0) {
    // On track or slightly ahead
    return { color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700' };
  } else if (forecast.daysAheadBehind >= -7) {
    // Slightly behind
    return { color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-700' };
  } else {
    // Significantly behind
    return { color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700' };
  }
}
