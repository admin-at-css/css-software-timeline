import type { ProjectData } from '../../types/project';

interface SummaryStatsProps {
  projects: ProjectData[];
}

export function SummaryStats({ projects }: SummaryStatsProps) {
  // Calculate totals
  const totals = projects.reduce(
    (acc, p) => ({
      estimated: acc.estimated + p.project.estimatedHours,
      actual: acc.actual + (p.project.actualHours || 0),
    }),
    { estimated: 0, actual: 0 }
  );

  const utilization = totals.estimated > 0
    ? Math.round((totals.actual / totals.estimated) * 100)
    : 0;

  // Count by status
  const statusCounts = projects.reduce(
    (acc, p) => {
      acc[p.project.status] = (acc[p.project.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const stats = [
    {
      label: 'Total Estimated',
      value: `${totals.estimated}h`,
      subtext: `${projects.length} projects`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Total Actual',
      value: `${totals.actual}h`,
      subtext: `${totals.estimated - totals.actual}h remaining`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Utilization',
      value: `${utilization}%`,
      subtext: utilization > 100 ? 'Over budget' : 'On track',
      color: utilization > 100 ? 'text-red-600' : 'text-purple-600',
      bgColor: utilization > 100 ? 'bg-red-50' : 'bg-purple-50',
      borderColor: utilization > 100 ? 'border-red-200' : 'border-purple-200',
    },
    {
      label: 'In Progress',
      value: statusCounts['in_progress'] || 0,
      subtext: `${statusCounts['completed'] || 0} completed`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-4 transition-all hover:shadow-md`}
        >
          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
}
