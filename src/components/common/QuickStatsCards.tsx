import type { Task } from '../../types/project';

interface QuickStatsCardsProps {
  tasks: Task[];
}

interface StatCardProps {
  label: string;
  count: number;
  percentage: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

function StatCard({ label, count, percentage, color, bgColor, icon }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-3 flex items-center gap-3`}>
      <div className={`${color} p-2 rounded-lg bg-white/60`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-semibold text-gray-900">{count}</p>
        <p className="text-xs text-gray-600 truncate">{label}</p>
      </div>
      <div className={`text-sm font-medium ${color.replace('text-', 'text-')}`}>
        {percentage}%
      </div>
    </div>
  );
}

export function QuickStatsCards({ tasks }: QuickStatsCardsProps) {
  // Filter out milestones for task counting
  const actualTasks = tasks.filter(t => t.type !== 'milestone');
  const total = actualTasks.length;

  // Calculate stats
  const completed = actualTasks.filter(t => t.status === 'completed').length;
  const inProgress = actualTasks.filter(t => t.status === 'in_progress').length;
  const blocked = actualTasks.filter(t => t.status === 'blocked').length;
  const pending = actualTasks.filter(t => t.status === 'pending').length;

  // Calculate percentages (avoid division by zero)
  const pctCompleted = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pctInProgress = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const pctBlocked = total > 0 ? Math.round((blocked / total) * 100) : 0;
  const pctPending = total > 0 ? Math.round((pending / total) * 100) : 0;

  // Icons as inline SVGs
  const icons = {
    total: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    completed: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    inProgress: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    pending: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Total Tasks"
        count={total}
        percentage={100}
        color="text-slate-600"
        bgColor="bg-slate-100"
        icon={icons.total}
      />
      <StatCard
        label="Completed"
        count={completed}
        percentage={pctCompleted}
        color="text-emerald-600"
        bgColor="bg-emerald-50"
        icon={icons.completed}
      />
      <StatCard
        label="In Progress"
        count={inProgress}
        percentage={pctInProgress}
        color="text-blue-600"
        bgColor="bg-blue-50"
        icon={icons.inProgress}
      />
      {blocked > 0 ? (
        <StatCard
          label="Blocked"
          count={blocked}
          percentage={pctBlocked}
          color="text-red-600"
          bgColor="bg-red-50"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      ) : (
        <StatCard
          label="Pending"
          count={pending}
          percentage={pctPending}
          color="text-amber-600"
          bgColor="bg-amber-50"
          icon={icons.pending}
        />
      )}
    </div>
  );
}
