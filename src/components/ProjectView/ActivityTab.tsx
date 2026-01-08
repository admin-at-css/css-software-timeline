import type { ProjectData } from '../../types/project';
import { formatDate } from '../../utils/dateUtils';

interface ActivityTabProps {
  project: ProjectData;
}

export function ActivityTab({ project }: ActivityTabProps) {
  const { project: meta, tasks } = project;

  // Generate mock activity based on project/task data
  // In a real app, this would come from an activity log
  const activities = generateActivityLog(meta, tasks || []);

  if (activities.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">No activity yet</p>
          <p className="text-sm mt-1">Activity will be recorded as the project progresses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Recent Activity</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />

        {/* Activity items */}
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="relative flex items-start gap-4 pl-10">
              {/* Dot */}
              <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 bg-white ${
                activity.type === 'completed' ? 'border-green-500' :
                activity.type === 'started' ? 'border-blue-500' :
                activity.type === 'created' ? 'border-purple-500' :
                'border-gray-400'
              }`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activity.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Activity {
  type: 'created' | 'started' | 'completed' | 'updated';
  message: string;
  date: string;
}

function generateActivityLog(
  meta: ProjectData['project'],
  tasks: ProjectData['tasks']
): Activity[] {
  const activities: Activity[] = [];

  // Project created
  activities.push({
    type: 'created',
    message: `Project "${meta.name}" was created`,
    date: formatDate(meta.startDate),
  });

  // Add task activities
  if (tasks && tasks.length > 0) {
    tasks.forEach((task) => {
      if (task.status === 'completed') {
        activities.push({
          type: 'completed',
          message: `Task "${task.name}" was completed`,
          date: task.endDate ? formatDate(task.endDate) : 'Recently',
        });
      } else if (task.status === 'in_progress') {
        activities.push({
          type: 'started',
          message: `Task "${task.name}" is in progress`,
          date: formatDate(task.startDate),
        });
      }
    });
  }

  // Sort by date (most recent first)
  // Note: In a real app, we'd have timestamps for proper sorting
  return activities.reverse();
}
