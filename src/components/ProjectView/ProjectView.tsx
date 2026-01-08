import { useState, useRef, useCallback } from 'react';
import type { ProjectData } from '../../types/project';
import { TabNavigation, type ProjectTab } from './TabNavigation';
import { DetailsTab } from './DetailsTab';
import { GanttTab } from './GanttTab';
import { TasksTab } from './TasksTab';
import { ActivityTab } from './ActivityTab';
import { parseTimelineFile } from '../../utils/yamlParser';

interface ProjectViewProps {
  project: ProjectData;
  onBackToDashboard: () => void;
  onUpdateProject?: (project: ProjectData) => void;
  existingProjectIds?: string[];
}

export function ProjectView({ project, onBackToDashboard, onUpdateProject, existingProjectIds = [] }: ProjectViewProps) {
  const [activeTab, setActiveTab] = useState<ProjectTab>('details');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { project: meta, tasks } = project;

  // Handle file selection for update
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateProject) return;

    // Reset input for re-selection
    e.target.value = '';

    // Validate file type
    if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
      setUpdateError('Please select a .yaml or .yml file');
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
      return;
    }

    const result = await parseTimelineFile(file);

    if (!result.success || !result.data) {
      setUpdateError(result.error || 'Failed to parse file');
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
      return;
    }

    // Verify the project ID matches
    if (result.data.project.id !== meta.id) {
      setUpdateError(`Project ID mismatch: expected "${meta.id}", got "${result.data.project.id}"`);
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
      return;
    }

    onUpdateProject(result.data);
    setUpdateStatus('success');
    setUpdateError(null);
    setTimeout(() => setUpdateStatus('idle'), 2000);
  }, [onUpdateProject, meta.id]);

  // Count only actual tasks (exclude milestones) for consistency with QuickStatsCards
  const actualTaskCount = tasks?.filter(t => t.type !== 'milestone').length || 0;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <DetailsTab project={project} />;
      case 'gantt':
        return <GanttTab project={project} />;
      case 'tasks':
        return <TasksTab project={project} />;
      case 'activity':
        return <ActivityTab project={project} />;
      default:
        return <DetailsTab project={project} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Back Button */}
      <div className="px-6 pt-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Dashboard
        </button>
      </div>

      {/* Project Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{meta.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{meta.description}</p>
          </div>

          {/* Update Timeline Button */}
          {onUpdateProject && (
            <div className="flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".yaml,.yml"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  updateStatus === 'success'
                    ? 'bg-emerald-100 text-emerald-700'
                    : updateStatus === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={updateError || 'Update this project from a timeline.yaml file'}
              >
                {updateStatus === 'success' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Updated
                  </>
                ) : updateStatus === 'error' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Error
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update Timeline
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          taskCount={actualTaskCount}
        />
      </div>

      {/* Tab Content - flex-1 and min-h-0 for proper flex child sizing */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
}
