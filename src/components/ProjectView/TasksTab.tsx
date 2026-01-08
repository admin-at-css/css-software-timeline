import type { ProjectData } from '../../types/project';
import { TaskList } from '../ProjectDetails/TaskList';

interface TasksTabProps {
  project: ProjectData;
}

export function TasksTab({ project }: TasksTabProps) {
  const { tasks } = project;

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="text-sm mt-1">Tasks will appear here once added</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          Tasks ({tasks.length})
        </h3>
        {/* Future: Add task button */}
      </div>
      <TaskList tasks={tasks} />
    </div>
  );
}
