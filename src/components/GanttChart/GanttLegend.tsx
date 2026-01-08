import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/colorUtils';
import type { ProjectStatus, Priority } from '../../types/project';

export function GanttLegend() {
  return (
    <div className="flex flex-wrap gap-6 py-3 px-4 bg-gray-50 rounded-lg">
      {/* Status Legend */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Status:
        </span>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(STATUS_COLORS) as [ProjectStatus, string][]).map(
            ([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600 capitalize">
                  {status.replace('_', ' ')}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Priority Legend */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Priority:
        </span>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(PRIORITY_COLORS) as [Priority, string][]).map(
            ([priority, color]) => (
              <div key={priority} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600 capitalize">
                  {priority}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
