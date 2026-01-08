import type { ProjectData, Task } from '../../types/project';

interface ProjectSummaryFooterProps {
  project: ProjectData;
}

// Helper to calculate days until a date
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Helper to get status color for milestone
function getMilestoneStatusColor(task: Task): string {
  if (task.status === 'completed') return 'text-green-600';
  const days = daysUntil(task.endDate);
  if (days < 0) return 'text-red-600'; // overdue
  if (days <= 7) return 'text-amber-600'; // due soon
  return 'text-gray-600';
}

export function ProjectSummaryFooter({ project }: ProjectSummaryFooterProps) {
  const tasks = project.tasks || [];

  // Calculate overall progress
  const totalProgress = tasks.length > 0
    ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length)
    : 0;

  // Calculate hours
  const estimatedHours = project.project.estimatedHours || 0;
  const actualHours = project.project.actualHours || 0;
  const hoursVariance = actualHours - estimatedHours;

  // Days remaining until project end
  const projectEndDate = project.project.endDate;
  const daysRemaining = projectEndDate ? daysUntil(projectEndDate) : null;

  // Get upcoming milestones (not completed, sorted by date)
  const upcomingMilestones = tasks
    .filter(t => t.type === 'milestone' && t.status !== 'completed')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 3);

  // Count blocked tasks
  const blockedCount = tasks.filter(t => t.status === 'blocked').length;

  // Count in-progress tasks
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between gap-6">
        {/* Left side: Quick Stats */}
        <div className="flex items-center gap-6">
          {/* Overall Progress */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${totalProgress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">{totalProgress}%</span>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-gray-300" />

          {/* Hours */}
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600">
              {actualHours}h / {estimatedHours}h
            </span>
            {hoursVariance !== 0 && (
              <span className={`text-xs ${hoursVariance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                ({hoursVariance > 0 ? '+' : ''}{hoursVariance}h)
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-gray-300" />

          {/* Days Remaining */}
          {daysRemaining !== null && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`text-sm ${daysRemaining < 0 ? 'text-red-600 font-medium' : daysRemaining <= 7 ? 'text-amber-600' : 'text-gray-600'}`}>
                {daysRemaining < 0
                  ? `${Math.abs(daysRemaining)}d overdue`
                  : daysRemaining === 0
                  ? 'Due today'
                  : `${daysRemaining}d remaining`
                }
              </span>
            </div>
          )}

          {/* Blocked indicator */}
          {blockedCount > 0 && (
            <>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-red-600 font-medium">
                  {blockedCount} blocked
                </span>
              </div>
            </>
          )}

          {/* In Progress count */}
          {inProgressCount > 0 && blockedCount === 0 && (
            <>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">
                  {inProgressCount} in progress
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right side: Upcoming Milestones */}
        {upcomingMilestones.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Upcoming
            </span>
            <div className="flex items-center gap-3">
              {upcomingMilestones.map((milestone) => {
                const days = daysUntil(milestone.endDate);
                const statusColor = getMilestoneStatusColor(milestone);
                return (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-gray-200"
                  >
                    <span className="text-purple-500 text-xs">◆</span>
                    <span className="text-sm text-gray-700 max-w-32 truncate">
                      {milestone.name}
                    </span>
                    <span className={`text-xs ${statusColor}`}>
                      {days < 0
                        ? `${Math.abs(days)}d ago`
                        : days === 0
                        ? 'today'
                        : `in ${days}d`
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
