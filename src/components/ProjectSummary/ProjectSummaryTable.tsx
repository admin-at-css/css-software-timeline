import { useState } from 'react';
import type { ProjectData } from '../../types/project';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';

interface ProjectSummaryTableProps {
  projects: ProjectData[];
  onProjectClick: (projectId: string) => void;
  alwaysExpanded?: boolean;
}

type SortField = 'name' | 'status' | 'priority' | 'estimated' | 'actual' | 'progress';
type SortDirection = 'asc' | 'desc';

export function ProjectSummaryTable({
  projects,
  onProjectClick,
  alwaysExpanded = false,
}: ProjectSummaryTableProps) {
  const [isCollapsed, setIsCollapsed] = useState(!alwaysExpanded);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Calculate totals
  const totals = projects.reduce(
    (acc, p) => ({
      estimated: acc.estimated + p.project.estimatedHours,
      actual: acc.actual + (p.project.actualHours || 0),
    }),
    { estimated: 0, actual: 0 }
  );

  const overallProgress = totals.estimated > 0
    ? Math.round((totals.actual / totals.estimated) * 100)
    : 0;

  // Sort projects
  const sortedProjects = [...projects].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.project.name.localeCompare(b.project.name);
        break;
      case 'status':
        comparison = a.project.status.localeCompare(b.project.status);
        break;
      case 'priority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        comparison = priorityOrder[a.project.priority] - priorityOrder[b.project.priority];
        break;
      case 'estimated':
        comparison = a.project.estimatedHours - b.project.estimatedHours;
        break;
      case 'actual':
        comparison = (a.project.actualHours || 0) - (b.project.actualHours || 0);
        break;
      case 'progress':
        const progressA = a.project.estimatedHours > 0
          ? (a.project.actualHours || 0) / a.project.estimatedHours
          : 0;
        const progressB = b.project.estimatedHours > 0
          ? (b.project.actualHours || 0) / b.project.estimatedHours
          : 0;
        comparison = progressA - progressB;
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-500 ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const showTable = alwaysExpanded || !isCollapsed;

  return (
    <div className={alwaysExpanded ? '' : 'bg-white border-t border-gray-200'}>
      {/* Collapsed Header / Toggle - only show if not alwaysExpanded */}
      {!alwaysExpanded && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-400">
              {isCollapsed ? '▶' : '▼'}
            </span>
            <span className="font-medium text-gray-700">Project Summary</span>
            <span className="text-sm text-gray-500">
              ({projects.length} {projects.length === 1 ? 'project' : 'projects'} |
              {' '}{totals.estimated}h est. |
              {' '}{totals.actual}h actual)
            </span>
          </div>
          <span className="text-sm text-gray-400">
            {isCollapsed ? 'Expand' : 'Collapse'}
          </span>
        </button>
      )}

      {/* Expanded Table */}
      {showTable && (
        <div className={alwaysExpanded ? 'p-4' : 'px-4 pb-4'}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th
                    className="pb-2 pr-4 font-medium cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('name')}
                  >
                    Project Name <SortIcon field="name" />
                  </th>
                  <th
                    className="pb-2 pr-4 font-medium cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('status')}
                  >
                    Status <SortIcon field="status" />
                  </th>
                  <th
                    className="pb-2 pr-4 font-medium cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('priority')}
                  >
                    Priority <SortIcon field="priority" />
                  </th>
                  <th
                    className="pb-2 pr-4 font-medium text-right cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('estimated')}
                  >
                    Estimated <SortIcon field="estimated" />
                  </th>
                  <th
                    className="pb-2 pr-4 font-medium text-right cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('actual')}
                  >
                    Actual <SortIcon field="actual" />
                  </th>
                  <th
                    className="pb-2 font-medium text-right cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('progress')}
                  >
                    Progress <SortIcon field="progress" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedProjects.map((p) => {
                  const progress = p.project.estimatedHours > 0
                    ? Math.round(((p.project.actualHours || 0) / p.project.estimatedHours) * 100)
                    : 0;

                  return (
                    <tr
                      key={p.project.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onProjectClick(p.project.id)}
                    >
                      <td className="py-2.5 pr-4">
                        <span className="font-medium text-gray-900 hover:text-blue-600">
                          {p.project.name}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={p.project.status} size="sm" />
                      </td>
                      <td className="py-2.5 pr-4">
                        <PriorityBadge priority={p.project.priority} size="sm" />
                      </td>
                      <td className="py-2.5 pr-4 text-right text-gray-600">
                        {p.project.estimatedHours}h
                      </td>
                      <td className="py-2.5 pr-4 text-right text-gray-600">
                        {p.project.actualHours || 0}h
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`font-medium ${
                          progress > 100 ? 'text-red-600' :
                          progress >= 75 ? 'text-green-600' :
                          progress >= 50 ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {progress}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-medium">
                  <td className="pt-2.5 pr-4 text-gray-900">Total</td>
                  <td className="pt-2.5 pr-4"></td>
                  <td className="pt-2.5 pr-4"></td>
                  <td className="pt-2.5 pr-4 text-right text-gray-900">
                    {totals.estimated}h
                  </td>
                  <td className="pt-2.5 pr-4 text-right text-gray-900">
                    {totals.actual}h
                  </td>
                  <td className="pt-2.5 text-right">
                    <span className={`${
                      overallProgress > 100 ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {overallProgress}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
