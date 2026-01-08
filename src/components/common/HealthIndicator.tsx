import type { ProjectData } from '../../types/project';
import { calculateProjectHealth, getHealthDisplay } from '../../utils/projectHealth';

interface HealthIndicatorProps {
  project: ProjectData;
  showDetails?: boolean;
}

export function HealthIndicator({ project, showDetails = false }: HealthIndicatorProps) {
  const health = calculateProjectHealth(project);
  const display = getHealthDisplay(health.status);

  return (
    <div className="inline-flex flex-col">
      {/* Main Badge */}
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${display.bgColor}`}
        style={{ color: display.color }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: display.color }}
        />
        {display.label}
      </span>

      {/* Optional Details Tooltip/Expansion */}
      {showDetails && (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <div className="flex justify-between gap-4">
            <span>Schedule:</span>
            <span className={health.scheduleVariance >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {health.scheduleVariance >= 0 ? '+' : ''}{health.scheduleVariance}%
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Budget:</span>
            <span className={health.budgetVariance >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {health.budgetVariance >= 0 ? '+' : ''}{health.budgetVariance}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for inline use
 */
export function HealthBadge({ project }: { project: ProjectData }) {
  const health = calculateProjectHealth(project);
  const display = getHealthDisplay(health.status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border`}
      style={{
        color: display.color,
        backgroundColor: `${display.color}15`,
        borderColor: `${display.color}40`,
      }}
      title={`Schedule: ${health.scheduleVariance >= 0 ? '+' : ''}${health.scheduleVariance}% | Budget: ${health.budgetVariance >= 0 ? '+' : ''}${health.budgetVariance}%`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: display.color }}
      />
      {display.label}
    </span>
  );
}
