import type { ProjectStatus, Priority } from '../../types/project';

interface FilterBarProps {
  statusFilter: ProjectStatus | 'all';
  priorityFilter: Priority | 'all';
  searchFilter: string;
  onStatusChange: (status: ProjectStatus | 'all') => void;
  onPriorityChange: (priority: Priority | 'all') => void;
  onSearchChange: (search: string) => void;
}

const STATUS_OPTIONS: (ProjectStatus | 'all')[] = [
  'all',
  'in_progress',
  'planning',
  'completed',
  'on_hold',
  'draft',
  'cancelled',
];

const PRIORITY_OPTIONS: (Priority | 'all')[] = [
  'all',
  'critical',
  'high',
  'medium',
  'low',
];

export function FilterBar({
  statusFilter,
  priorityFilter,
  searchFilter,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center bg-white rounded-lg border border-gray-200 px-4 py-3">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 font-medium">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as ProjectStatus | 'all')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : formatStatus(status)}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 font-medium">Priority:</label>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as Priority | 'all')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {priority === 'all' ? 'All Priority' : formatPriority(priority)}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {(statusFilter !== 'all' || priorityFilter !== 'all' || searchFilter) && (
        <button
          onClick={() => {
            onStatusChange('all');
            onPriorityChange('all');
            onSearchChange('');
          }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function formatStatus(status: ProjectStatus): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatPriority(priority: Priority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
