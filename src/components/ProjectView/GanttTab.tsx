import { useState, useCallback } from 'react';
import type { ProjectData, ViewMode, GanttTask } from '../../types/project';
import { useGanttData } from '../../hooks/useGanttData';
import { GanttChart } from '../GanttChart/GanttChart';
import { TaskDetailsPanel } from '../GanttChart/TaskDetailsPanel';
import { ProjectSummaryFooter } from '../GanttChart/ProjectSummaryFooter';

interface GanttTabProps {
  project: ProjectData;
}

// Compact inline legend for the header
function InlineLegend() {
  const items = [
    { label: 'Completed', color: 'bg-green-500' },
    { label: 'In Progress', color: 'bg-blue-500' },
    { label: 'Pending', color: 'bg-gray-400' },
    { label: 'Blocked', color: 'bg-red-500' },
    { label: 'Milestone', color: 'bg-purple-500', shape: 'diamond' },
  ];

  return (
    <div className="flex items-center gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          {item.shape === 'diamond' ? (
            <span className="text-purple-500 text-xs">◆</span>
          ) : (
            <span className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
          )}
          <span className="text-xs text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function GanttTab({ project }: GanttTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('Week');
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);

  // Generate Gantt tasks for this single project at task level
  const ganttTasks = useGanttData([project], 'task');

  const viewModes: ViewMode[] = ['Day', 'Week', 'Month', 'Year'];

  // Handle task click - find the full task data
  const handleTaskClick = useCallback((taskId: string) => {
    const task = ganttTasks.find(t => t.id === taskId);

    if (task) {
      // Toggle selection if clicking the same task
      if (selectedTask?.id === task.id) {
        setSelectedTask(null);
      } else {
        setSelectedTask(task);
      }
    }
  }, [ganttTasks, selectedTask]);

  const handleClosePanel = useCallback(() => {
    setSelectedTask(null);
  }, []);

  const isPanelOpen = selectedTask !== null;

  return (
    <div className="h-full flex flex-col">
      {/* Header with Title, Legend, and View Controls */}
      <div className="flex-shrink-0 border-b border-gray-100">
        {/* Top row: Title and View Controls */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-medium text-gray-700">Project Timeline</h3>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {viewModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Legend row */}
        <div className="px-4 pb-3">
          <InlineLegend />
        </div>
      </div>

      {/* Main Content Area - Horizontal Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side: Gantt Chart + Summary Footer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Gantt Chart Area - scrollable */}
          <div className="flex-1 overflow-auto p-4">
            {ganttTasks.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
                <GanttChart
                  tasks={ganttTasks}
                  viewMode={viewMode}
                  onTaskClick={handleTaskClick}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <p className="text-lg font-medium">No tasks available</p>
                  <p className="text-sm mt-1">Add tasks to see the Gantt chart</p>
                </div>
              </div>
            )}
          </div>

          {/* Project Summary Footer - fixed at bottom */}
          {ganttTasks.length > 0 && (
            <div className="flex-shrink-0">
              <ProjectSummaryFooter project={project} />
            </div>
          )}
        </div>

        {/* Right Side Panel - Task Details */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            isPanelOpen ? 'w-80' : 'w-0'
          }`}
        >
          <div className="w-80 h-full">
            <TaskDetailsPanel task={selectedTask} onClose={handleClosePanel} />
          </div>
        </div>
      </div>
    </div>
  );
}
