import type { ProjectData } from '../../types/project';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { TaskList } from './TaskList';
import { StakeholderList } from './StakeholderList';
import { formatDate, getDaysRemaining, isOverdue } from '../../utils/dateUtils';

interface ProjectSidebarProps {
  project: ProjectData | null;
  onClose: () => void;
}

export function ProjectSidebar({ project, onClose }: ProjectSidebarProps) {
  if (!project) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 p-6">
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Select a project to view details</p>
        </div>
      </div>
    );
  }

  const { project: meta, tasks } = project;
  const progress = meta.actualHours && meta.estimatedHours
    ? Math.round((meta.actualHours / meta.estimatedHours) * 100)
    : 0;

  const daysRemaining = meta.endDate ? getDaysRemaining(meta.endDate) : null;
  const overdue = meta.endDate ? isOverdue(meta.endDate, meta.status) : false;

  return (
    <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {meta.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {meta.description}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status & Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={meta.status} />
          <PriorityBadge priority={meta.priority} />
        </div>

        {/* Priority Reason */}
        {meta.priorityReason && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Priority reason:</span> {meta.priorityReason}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Timeline</h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Start</span>
              <span className="text-gray-900">{formatDate(meta.startDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">End</span>
              <span className={`${overdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                {meta.endDate ? formatDate(meta.endDate) : 'Ongoing'}
              </span>
            </div>
            {daysRemaining !== null && (
              <div className="flex justify-between text-sm pt-1 border-t border-gray-200 mt-2">
                <span className="text-gray-500">Remaining</span>
                <span className={`font-medium ${overdue ? 'text-red-600' : daysRemaining < 7 ? 'text-amber-600' : 'text-green-600'}`}>
                  {overdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hours */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Hours</h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Estimated</span>
              <span className="text-gray-900 font-medium">{meta.estimatedHours}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Actual</span>
              <span className="text-gray-900 font-medium">{meta.actualHours || 0}h</span>
            </div>
            <ProgressBar progress={progress} height="sm" />
          </div>
        </div>

        {/* Repository */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Repository</h3>
          <a
            href={meta.repository.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Stakeholders */}
        {meta.stakeholders && meta.stakeholders.length > 0 && (
          <StakeholderList stakeholders={meta.stakeholders} />
        )}

        {/* Tasks */}
        {tasks && tasks.length > 0 && (
          <TaskList tasks={tasks} />
        )}
      </div>
    </div>
  );
}
