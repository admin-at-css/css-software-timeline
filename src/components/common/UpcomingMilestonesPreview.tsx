import type { Task } from '../../types/project';
import { formatDate, getDaysRemaining } from '../../utils/dateUtils';

interface UpcomingMilestonesPreviewProps {
  tasks: Task[];
}

interface MilestoneWithMeta {
  milestone: Task;
  daysUntil: number;
  isBlocked: boolean;
  blockedBy: string[];
}

/**
 * Check if a milestone is blocked by incomplete dependencies
 */
function getMilestoneBlockedStatus(milestone: Task, allTasks: Task[]): { isBlocked: boolean; blockedBy: string[] } {
  const blockedBy: string[] = [];

  for (const depId of milestone.dependencies) {
    const depTask = allTasks.find(t => t.id === depId);
    if (depTask && depTask.status !== 'completed') {
      blockedBy.push(depTask.name);
    }
  }

  return { isBlocked: blockedBy.length > 0, blockedBy };
}

/**
 * Get upcoming milestones with calculated metadata
 */
function getUpcomingMilestones(tasks: Task[]): MilestoneWithMeta[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return tasks
    .filter(t => t.type === 'milestone' && t.status !== 'completed')
    .map(milestone => {
      const daysUntil = getDaysRemaining(milestone.endDate);
      const { isBlocked, blockedBy } = getMilestoneBlockedStatus(milestone, tasks);
      return { milestone, daysUntil, isBlocked, blockedBy };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3); // Show up to 3 upcoming milestones
}

/**
 * Format days until as human-readable text
 */
function formatDaysUntil(days: number): string {
  if (days < 0) {
    const overdue = Math.abs(days);
    return overdue === 1 ? '1 day overdue' : `${overdue} days overdue`;
  }
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `${days} days`;
  if (days <= 14) return '~1 week';
  if (days <= 21) return '~2 weeks';
  if (days <= 28) return '~3 weeks';
  if (days <= 45) return '~1 month';
  return `${Math.round(days / 30)} months`;
}

export function UpcomingMilestonesPreview({ tasks }: UpcomingMilestonesPreviewProps) {
  const upcomingMilestones = getUpcomingMilestones(tasks);

  if (upcomingMilestones.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Upcoming Milestones</h3>
      <div className="space-y-2">
        {upcomingMilestones.map(({ milestone, daysUntil, isBlocked, blockedBy }) => (
          <div
            key={milestone.id}
            className="p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              {/* Diamond icon inline with title */}
              <div className={`flex-shrink-0 w-3 h-3 rotate-45 ${
                daysUntil < 0 ? 'bg-red-500' : isBlocked ? 'bg-amber-500' : 'bg-purple-500'
              }`} />
              <span className="font-medium text-gray-900 truncate">
                {milestone.name}
              </span>
              {isBlocked && (
                <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">
                  Blocked
                </span>
              )}
              {daysUntil < 0 && (
                <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                  Overdue
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 ml-5 text-xs text-gray-500">
              <span>{formatDate(milestone.endDate)}</span>
              <span className="text-gray-300">|</span>
              <span className={`font-medium ${
                daysUntil < 0 ? 'text-red-600' : daysUntil <= 7 ? 'text-amber-600' : 'text-gray-600'
              }`}>
                {formatDaysUntil(daysUntil)}
              </span>
            </div>
            {isBlocked && blockedBy.length > 0 && (
              <div className="mt-1 ml-5 text-[11px] text-amber-600">
                Waiting on: {blockedBy.slice(0, 2).join(', ')}{blockedBy.length > 2 ? ` +${blockedBy.length - 2} more` : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
