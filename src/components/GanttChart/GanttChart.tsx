import { useEffect, useRef, useCallback } from 'react';
import Gantt from 'frappe-gantt';
import type { GanttTask, ViewMode } from '../../types/project';
import 'frappe-gantt/dist/frappe-gantt.css';

interface GanttChartProps {
  tasks: GanttTask[];
  viewMode: ViewMode;
  onTaskClick?: (taskId: string) => void;
}

// frappe-gantt's internal task type (simplified)
interface FrappeGanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies: string[];
  custom_class?: string;
}

export function GanttChart({ tasks, viewMode, onTaskClick }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<Gantt | null>(null);

  const handleTaskClick = useCallback(
    (frappeTask: FrappeGanttTask) => {
      if (onTaskClick) {
        // Pass the full task ID (including project prefix)
        // The parent component will handle finding the task
        onTaskClick(frappeTask.id);
      }
    },
    [onTaskClick]
  );

  useEffect(() => {
    if (!containerRef.current || tasks.length === 0) return;

    // Clear previous chart
    containerRef.current.innerHTML = '';

    // Find the earliest task start date to scroll to
    const earliestDate = tasks.reduce((earliest, task) => {
      const taskStart = new Date(task.start);
      return taskStart < earliest ? taskStart : earliest;
    }, new Date(tasks[0].start));

    // Format date for scroll_to option
    const scrollToDate = earliestDate.toISOString().split('T')[0];

    // Create Gantt chart without popup (we use TaskDetailsPanel instead)
    const options = {
      view_mode: viewMode,
      scroll_to: scrollToDate,
      on_click: handleTaskClick,
      // Disable popup - we use the TaskDetailsPanel below the chart
      popup: () => '',
    };

    // Cast tasks to any because frappe-gantt's TS types expect string dependencies, but v1.x uses arrays
    ganttRef.current = new Gantt(containerRef.current, tasks as any, options as any);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tasks, viewMode, handleTaskClick]);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No projects to display</p>
      </div>
    );
  }

  return <div ref={containerRef} />;
}
