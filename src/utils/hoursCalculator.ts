import type { ProjectData, MonthlyHoursSummary } from '../types/project';
import { getMonthsBetween } from './dateUtils';

export function calculateMonthlyHours(projects: ProjectData[]): MonthlyHoursSummary[] {
  const monthlyMap = new Map<string, MonthlyHoursSummary>();

  projects.forEach((projectData) => {
    const { project, monthlyAllocation, tasks } = projectData;

    // If monthlyAllocation is defined, use it directly
    if (monthlyAllocation) {
      Object.entries(monthlyAllocation).forEach(([month, hours]) => {
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, {
            month,
            estimated: 0,
            actual: 0,
            projects: [],
          });
        }

        const summary = monthlyMap.get(month)!;
        summary.estimated += hours;
        summary.projects.push({
          projectId: project.id,
          projectName: project.name,
          hours,
        });
      });
    } else {
      // Distribute hours evenly across project duration
      const startDate = project.startDate;
      const endDate = project.endDate || new Date().toISOString().split('T')[0];
      const months = getMonthsBetween(startDate, endDate);

      if (months.length > 0) {
        const hoursPerMonth = Math.ceil(project.estimatedHours / months.length);

        months.forEach((month) => {
          if (!monthlyMap.has(month)) {
            monthlyMap.set(month, {
              month,
              estimated: 0,
              actual: 0,
              projects: [],
            });
          }

          const summary = monthlyMap.get(month)!;
          summary.estimated += hoursPerMonth;
          summary.projects.push({
            projectId: project.id,
            projectName: project.name,
            hours: hoursPerMonth,
          });
        });
      }
    }

    // Calculate actual hours from completed tasks
    if (tasks) {
      tasks.forEach((task) => {
        if (task.actualHours && task.status === 'completed') {
          const taskMonth = task.endDate.substring(0, 7); // YYYY-MM

          if (!monthlyMap.has(taskMonth)) {
            monthlyMap.set(taskMonth, {
              month: taskMonth,
              estimated: 0,
              actual: 0,
              projects: [],
            });
          }

          const summary = monthlyMap.get(taskMonth)!;
          summary.actual += task.actualHours;
        }
      });
    }
  });

  // Sort by month
  return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function getTotalEstimatedHours(projects: ProjectData[]): number {
  return projects.reduce((sum, p) => sum + (p.project.estimatedHours || 0), 0);
}

export function getTotalActualHours(projects: ProjectData[]): number {
  return projects.reduce((sum, p) => sum + (p.project.actualHours || 0), 0);
}
