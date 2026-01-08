import type { ProjectData } from '../../types/project';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { QuickStatsCards } from '../common/QuickStatsCards';
import { HealthBadge } from '../common/HealthIndicator';
import { MiniTimeline } from '../common/MiniTimeline';
import { UpcomingMilestonesPreview } from '../common/UpcomingMilestonesPreview';
import { CompletionForecastCard } from '../common/CompletionForecastCard';
import { StakeholderList } from '../ProjectDetails/StakeholderList';

interface DetailsTabProps {
  project: ProjectData;
}

export function DetailsTab({ project }: DetailsTabProps) {
  const { project: meta } = project;
  const progress = meta.actualHours && meta.estimatedHours
    ? Math.round((meta.actualHours / meta.estimatedHours) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Status, Priority & Health */}
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={meta.status} />
        <PriorityBadge priority={meta.priority} />
        <HealthBadge project={project} />
      </div>

      {/* Priority Reason */}
      {meta.priorityReason && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Priority reason:</span> {meta.priorityReason}
          </p>
        </div>
      )}

      {/* Quick Stats Cards */}
      <QuickStatsCards tasks={project.tasks} />

      {/* Timeline Visualization */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Timeline</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <MiniTimeline project={project} />
        </div>
      </div>

      {/* Upcoming Milestones Preview */}
      <UpcomingMilestonesPreview tasks={project.tasks} />

      {/* Completion Forecast */}
      <CompletionForecastCard project={project} />

      {/* Hours & Repository Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hours Card */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Hours</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Estimated</span>
              <span className="text-gray-900 font-medium">{meta.estimatedHours}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Actual</span>
              <span className="text-gray-900 font-medium">{meta.actualHours || 0}h</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Budget Used</span>
                <span className={`font-medium ${
                  progress > 100 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {progress}%
                </span>
              </div>
              <ProgressBar progress={progress} height="sm" />
            </div>
          </div>
        </div>

        {/* Repository Card */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Repository</h3>
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <a
              href={meta.repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="font-medium">View on GitHub</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Stakeholders */}
      {meta.stakeholders && meta.stakeholders.length > 0 && (
        <StakeholderList stakeholders={meta.stakeholders} />
      )}
    </div>
  );
}
