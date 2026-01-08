import type { ProjectData, Task } from '../../types/project';
import { formatDate } from '../../utils/dateUtils';

interface MiniTimelineProps {
  project: ProjectData;
}

interface TimelinePosition {
  percentage: number;
  dayNumber: number;
  totalDays: number;
  isBeforeStart: boolean;
  isPastEnd: boolean;
}

/**
 * Calculate the current position in the timeline
 */
function calculateTimelinePosition(startDate: string, endDate: string | null): TimelinePosition {
  if (!endDate) {
    return { percentage: 0, dayNumber: 0, totalDays: 0, isBeforeStart: false, isPastEnd: false };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Set to start of day for accurate day counting
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const totalMs = end.getTime() - start.getTime();
  const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24)) + 1; // +1 to include end date

  const elapsedMs = now.getTime() - start.getTime();
  const dayNumber = Math.ceil(elapsedMs / (1000 * 60 * 60 * 24)) + 1;

  // Before project start
  if (now < start) {
    return { percentage: 0, dayNumber: 0, totalDays, isBeforeStart: true, isPastEnd: false };
  }

  // After project end
  if (now > end) {
    return { percentage: 100, dayNumber: totalDays, totalDays, isBeforeStart: false, isPastEnd: true };
  }

  const percentage = Math.round((elapsedMs / totalMs) * 100);

  return { percentage, dayNumber, totalDays, isBeforeStart: false, isPastEnd: false };
}

/**
 * Calculate milestone positions on the timeline
 */
function getMilestonePositions(tasks: Task[], startDate: string, endDate: string | null): Array<{
  id: string;
  name: string;
  percentage: number;
  date: string;
  isCompleted: boolean;
}> {
  if (!endDate) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalMs = end.getTime() - start.getTime();

  const milestones = tasks.filter(t => t.type === 'milestone');

  return milestones.map(m => {
    const milestoneDate = new Date(m.endDate);
    const elapsedMs = milestoneDate.getTime() - start.getTime();
    const percentage = Math.max(0, Math.min(100, Math.round((elapsedMs / totalMs) * 100)));

    return {
      id: m.id,
      name: m.name,
      percentage,
      date: m.endDate,
      isCompleted: m.status === 'completed',
    };
  });
}

export function MiniTimeline({ project }: MiniTimelineProps) {
  const { project: meta, tasks } = project;

  if (!meta.endDate) {
    return null; // Can't show timeline without end date
  }

  const position = calculateTimelinePosition(meta.startDate, meta.endDate);
  const milestones = getMilestonePositions(tasks, meta.startDate, meta.endDate);

  // Find next upcoming milestone
  const now = new Date();
  const upcomingMilestone = milestones
    .filter(m => !m.isCompleted && new Date(m.date) > now)
    .sort((a, b) => a.percentage - b.percentage)[0];

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(meta.startDate)}</span>
        {/* Current date positioned at marker location */}
        {!position.isBeforeStart && (
          <span
            className={`absolute -translate-x-1/2 font-medium ${
              position.isPastEnd ? 'text-red-600' : 'text-blue-600'
            }`}
            style={{ left: `${position.percentage}%` }}
          >
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        <span>{formatDate(meta.endDate)}</span>
      </div>

      {/* Timeline Bar */}
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${position.percentage}%` }}
          />
        </div>

        {/* Milestone markers - purple diamonds for consistency with Gantt legend */}
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="absolute top-1/2 -translate-y-1/2 group"
            style={{ left: `${milestone.percentage}%` }}
          >
            {/* Diamond shape using rotated square */}
            <div
              className={`w-2.5 h-2.5 border-2 border-white shadow-sm transform -translate-x-1/2 rotate-45 cursor-pointer transition-transform hover:scale-125 ${
                milestone.isCompleted
                  ? 'bg-purple-500'
                  : 'bg-purple-300'
              }`}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {milestone.name}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        ))}

        {/* "You are here" marker */}
        {!position.isBeforeStart && (
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${position.percentage}%` }}
          >
            <div className="relative">
              {/* Marker line - red when overdue */}
              <div className={`absolute top-[-12px] left-1/2 -translate-x-1/2 w-0.5 h-7 ${
                position.isPastEnd ? 'bg-red-600' : 'bg-blue-600'
              }`} />
              {/* Marker dot - red when overdue */}
              <div className={`absolute top-[-14px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-2 ring-white ${
                position.isPastEnd ? 'bg-red-600' : 'bg-blue-600'
              }`} />
            </div>
          </div>
        )}
      </div>

      {/* Day counter and status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-medium">
            {position.isBeforeStart ? (
              'Not started'
            ) : position.isPastEnd ? (
              <span className="text-red-600">Past deadline</span>
            ) : (
              `Day ${position.dayNumber} of ${position.totalDays}`
            )}
          </span>
        </div>

        {upcomingMilestone && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <div className="w-2 h-2 bg-purple-400 rotate-45" />
            <span className="text-xs">
              Next: <span className="font-medium text-purple-700">{upcomingMilestone.name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-purple-500 rotate-45" />
          <span>Completed milestone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-purple-300 rotate-45" />
          <span>Upcoming milestone</span>
        </div>
      </div>
    </div>
  );
}
