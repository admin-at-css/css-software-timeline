import type { ProjectData } from '../../types/project';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { formatDate } from '../../utils/dateUtils';

interface ProjectCardsGridProps {
  projects: ProjectData[];
  onProjectClick: (projectId: string) => void;
}

export function ProjectCardsGrid({ projects, onProjectClick }: ProjectCardsGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-lg font-medium">No projects found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project) => {
        const { project: meta } = project;
        const progress = meta.estimatedHours > 0
          ? Math.round(((meta.actualHours || 0) / meta.estimatedHours) * 100)
          : 0;

        return (
          <div
            key={meta.id}
            onClick={() => onProjectClick(meta.id)}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {meta.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                  {meta.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={meta.status} size="sm" />
                <PriorityBadge priority={meta.priority} size="sm" />
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-500">Progress</span>
                <span className={`font-medium ${
                  progress > 100 ? 'text-red-600' :
                  progress >= 75 ? 'text-green-600' :
                  'text-gray-700'
                }`}>
                  {progress}%
                </span>
              </div>
              <ProgressBar progress={progress} height="sm" />
            </div>

            {/* Hours & Timeline */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">
                  <span className="font-medium">{meta.actualHours || 0}</span>
                  <span className="text-gray-400">/{meta.estimatedHours}h</span>
                </span>
              </div>
              <div className="text-gray-400 text-xs">
                {formatDate(meta.startDate)} → {meta.endDate ? formatDate(meta.endDate) : 'Ongoing'}
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
