import type { Task } from '../../types/project';
import { ProgressBar } from '../common/ProgressBar';
import { getTaskStatusColor } from '../../utils/colorUtils';
import { formatDate } from '../../utils/dateUtils';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  const statusColor = getTaskStatusColor(task.status);

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-sm font-medium text-gray-900 truncate">
            {task.name}
          </span>
        </div>
        {task.type === 'milestone' && (
          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded flex-shrink-0">
            Milestone
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {formatDate(task.startDate)} - {formatDate(task.endDate)}
        </span>
        <span className="font-medium">
          {task.actualHours || 0}/{task.estimatedHours}h
        </span>
      </div>

      <ProgressBar
        progress={task.progress}
        height="sm"
        color={statusColor}
        showLabel={false}
      />

      {task.dependencies && task.dependencies.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Depends on: {task.dependencies.join(', ')}</span>
        </div>
      )}
    </div>
  );
}
