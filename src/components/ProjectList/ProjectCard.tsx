import type { ProjectData } from '../../types/project';
import { getStatusColor, getPriorityColor, getPriorityLabel } from '../../utils/colorUtils';

interface ProjectCardProps {
  project: ProjectData;
  isSelected: boolean;
  onClick: () => void;
}

export function ProjectCard({ project, isSelected, onClick }: ProjectCardProps) {
  const { project: meta } = project;
  const statusColor = getStatusColor(meta.status);
  const priorityColor = getPriorityColor(meta.priority);
  const priorityLabel = getPriorityLabel(meta.priority);

  const actualHours = meta.actualHours || 0;
  const progress = meta.estimatedHours > 0
    ? Math.round((actualHours / meta.estimatedHours) * 100)
    : 0;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg border transition-all duration-150
        hover:border-gray-300 hover:shadow-sm
        ${isSelected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white'
        }
      `}
    >
      {/* Project Name with Status Dot */}
      <div className="flex items-start gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
          style={{ backgroundColor: statusColor }}
          title={meta.status.replace('_', ' ')}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate text-sm">
            {meta.name}
          </h4>
        </div>
      </div>

      {/* Hours and Priority */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          {actualHours}/{meta.estimatedHours}h
        </span>
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: `${priorityColor}15`,
            color: priorityColor,
          }}
        >
          {priorityLabel}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: progress > 100 ? '#ef4444' : '#3b82f6',
            }}
          />
        </div>
      </div>
    </button>
  );
}
