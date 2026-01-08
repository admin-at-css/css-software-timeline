import type { GanttTask } from '../../types/project';

interface TaskDetailsPanelProps {
  task: GanttTask | null;
  onClose: () => void;
}

// Helper to format date as readable string
function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return 'Not set';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Helper to calculate days between dates
function daysBetween(start: string | undefined | null, end: string | undefined | null): number | null {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Helper to get status display info
function getStatusInfo(task: GanttTask): { label: string; color: string; bgColor: string } {
  const meta = task._meta;
  if (!meta) return { label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };

  const status = meta.status;
  const progress = task.progress;

  if (progress === 100 || status === 'completed') {
    return { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' };
  }
  if (status === 'blocked') {
    return { label: 'Blocked', color: 'text-red-700', bgColor: 'bg-red-100' };
  }
  if (status === 'in_progress') {
    return { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' };
  }
  return { label: 'Pending', color: 'text-gray-700', bgColor: 'bg-gray-100' };
}

// Helper to get hours info
function getHoursInfo(task: GanttTask): { text: string; detail: string; color: string } | null {
  const meta = task._meta;
  if (!meta || meta.estimatedHours === 0) return null;

  const estimated = meta.estimatedHours;
  const actual = meta.actualHours || 0;

  if (actual === 0) {
    return { text: `${estimated}h`, detail: 'estimated', color: 'text-gray-600' };
  }

  const diff = actual - estimated;
  if (diff > 0) {
    return { text: `${actual}h / ${estimated}h`, detail: `+${diff}h over`, color: 'text-red-600' };
  } else if (diff < 0) {
    return { text: `${actual}h / ${estimated}h`, detail: `${Math.abs(diff)}h under`, color: 'text-green-600' };
  }
  return { text: `${actual}h / ${estimated}h`, detail: 'on budget', color: 'text-blue-600' };
}

// Helper to parse subtasks from description bullet points
interface ParsedDescription {
  summary: string | null;
  subtasks: string[];
}

function parseDescriptionSubtasks(description: string | undefined): ParsedDescription {
  if (!description) return { summary: null, subtasks: [] };

  const lines = description.split('\n').map(line => line.trim()).filter(Boolean);
  const subtasks: string[] = [];
  let summary: string | null = null;

  for (const line of lines) {
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      subtasks.push(bulletMatch[1]);
    } else if (!summary && !line.endsWith(':')) {
      summary = line;
    } else if (line.endsWith(':') && !summary) {
      summary = line.slice(0, -1);
    }
  }

  return { summary, subtasks };
}

export function TaskDetailsPanel({ task, onClose }: TaskDetailsPanelProps) {
  // Empty state - show placeholder
  if (!task) {
    return (
      <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Select a task to view details</p>
          </div>
        </div>
      </div>
    );
  }

  const meta = task._meta;
  const statusInfo = getStatusInfo(task);
  const hoursInfo = getHoursInfo(task);
  const duration = daysBetween(task.start, task.end);
  const isMilestone = meta?.type === 'milestone';
  const { summary, subtasks } = parseDescriptionSubtasks(meta?.description);

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {isMilestone ? 'Milestone' : 'Task Details'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          title="Close panel"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pr-6 space-y-5">
          {/* Task Name & Project */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 leading-snug flex items-start gap-2">
              {isMilestone && <span className="text-purple-600 mt-0.5">◆</span>}
              <span>{meta?.taskName || task.name}</span>
            </h4>
            <p className="text-xs text-gray-500 mt-1">{meta?.projectName || 'Project'}</p>
          </div>

          {/* Quick Stats Row - 70:30 ratio */}
          <div className="grid grid-cols-10 gap-3">
            {/* Status - 70% */}
            <div className="col-span-7">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Status</p>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            {/* Progress - 30% */}
            {!isMilestone && (
              <div className="col-span-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Progress</p>
                <p className="text-sm font-semibold text-gray-900">{task.progress}%</p>
              </div>
            )}
          </div>

          {/* Progress Bar (full width) */}
          {!isMilestone && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  task.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          )}

          {/* Timeline - 70:30 ratio */}
          <div className="grid grid-cols-10 gap-3">
            <div className="col-span-7">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Timeline</p>
              <p className="text-sm text-gray-900">{formatDate(task.start)}</p>
              <p className="text-xs text-gray-500">to {formatDate(task.end)}</p>
            </div>
            <div className="col-span-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Duration</p>
              <p className="text-sm font-medium text-gray-900">
                {duration ? `${duration}d` : '—'}
              </p>
            </div>
          </div>

          {/* Hours - 70:30 ratio */}
          {hoursInfo && (
            <div className="grid grid-cols-10 gap-3">
              <div className="col-span-7">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Hours</p>
                <p className={`text-sm font-medium ${hoursInfo.color}`}>{hoursInfo.text}</p>
              </div>
              <div className="col-span-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">&nbsp;</p>
                <p className={`text-xs ${hoursInfo.color}`}>{hoursInfo.detail}</p>
              </div>
            </div>
          )}

          {/* Assignee */}
          {meta?.assignee && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Assignee</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-medium text-xs">
                    {meta.assignee.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{meta.assignee}</span>
              </div>
            </div>
          )}

          {/* Description / Summary */}
          {summary && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Subtasks / Included Items */}
          {subtasks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Included Items ({subtasks.length})
              </p>
              <ul className="space-y-1.5">
                {subtasks.map((subtask, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    {/* Icon based on task status */}
                    {meta?.status === 'completed' ? (
                      // Checkmark for completed tasks
                      <svg className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : meta?.status === 'in_progress' ? (
                      // Half-filled circle for in-progress
                      <svg className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 2a6 6 0 0 1 0 12V2z" fill="currentColor" />
                      </svg>
                    ) : meta?.status === 'blocked' ? (
                      // X mark for blocked
                      <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      // Empty circle for pending
                      <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                    <span className="leading-snug">{subtask}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Dependencies ({task.dependencies.length})
              </p>
              <div className="space-y-1">
                {task.dependencies.map((dep, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-400">←</span>
                    <span>{dep.split('__').pop()?.replace(/-/g, ' ') || dep}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
