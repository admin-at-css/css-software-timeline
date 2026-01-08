import type { ProjectData } from '../../types/project';
import { calculateCompletionForecast, getForecastDisplay } from '../../utils/forecastUtils';
import { formatDate } from '../../utils/dateUtils';

interface CompletionForecastCardProps {
  project: ProjectData;
}

export function CompletionForecastCard({ project }: CompletionForecastCardProps) {
  const forecast = calculateCompletionForecast(project);
  const display = getForecastDisplay(forecast);
  const deadline = project.project.endDate;

  // Don't render if no forecast available
  if (forecast.confidence === 'unavailable') {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Completion Forecast</h3>
      <div className={`${display.bgColor} rounded-lg p-4`}>
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Projected date and message */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {/* Trend icon */}
              <div className={`flex-shrink-0 ${display.textColor}`}>
                {forecast.daysAheadBehind >= 0 ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
              </div>
              <span className={`font-semibold ${display.textColor}`}>
                {forecast.message}
              </span>
            </div>

            {/* Projected completion date */}
            {forecast.projectedDate && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="text-gray-500">Projected: </span>
                <span className="font-medium">{formatDate(forecast.projectedDate)}</span>
                {deadline && (
                  <>
                    <span className="text-gray-400 mx-2">vs</span>
                    <span className="text-gray-500">Deadline: </span>
                    <span className="font-medium">{formatDate(deadline)}</span>
                  </>
                )}
              </div>
            )}

            {/* Confidence indicator */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Confidence:</span>
              <div className="flex gap-0.5">
                {['high', 'medium', 'low'].map((level, i) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      (forecast.confidence === 'high' && i <= 2) ||
                      (forecast.confidence === 'medium' && i <= 1) ||
                      (forecast.confidence === 'low' && i === 0)
                        ? display.textColor.replace('text-', 'bg-').replace('-700', '-400')
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 capitalize">{forecast.confidence}</span>
            </div>
          </div>

          {/* Right side - Metrics */}
          <div className="flex-shrink-0 text-right space-y-1">
            <div className="text-xs text-gray-500">
              <span>Velocity: </span>
              <span className="font-medium text-gray-700">{forecast.velocityHoursPerDay}h/day</span>
            </div>
            <div className="text-xs text-gray-500">
              <span>Remaining: </span>
              <span className="font-medium text-gray-700">{forecast.remainingHours}h</span>
            </div>
            <div className="text-xs text-gray-500">
              <span>Progress: </span>
              <span className="font-medium text-gray-700">{forecast.completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
