import { useState } from 'react';
import type { ProjectData } from '../../types/project';
import { SummaryStats } from './SummaryStats';
import { ViewToggle } from './ViewToggle';
import { ProjectCardsGrid } from './ProjectCardsGrid';
import { ProjectSummaryTable } from '../ProjectSummary/ProjectSummaryTable';
import { ImportButton } from '../Import/ImportButton';

interface DashboardViewProps {
  projects: ProjectData[];
  onProjectClick: (projectId: string) => void;
  onImportProject: (project: ProjectData) => void;
  onUpdateProject: (project: ProjectData) => void;
  existingProjectIds: string[];
}

export function DashboardView({
  projects,
  onProjectClick,
  onImportProject,
  onUpdateProject,
  existingProjectIds,
}: DashboardViewProps) {
  const [view, setView] = useState<'cards' | 'table'>('cards');

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Overview of all projects and their progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ImportButton
              onImport={onImportProject}
              onUpdate={onUpdateProject}
              existingProjectIds={existingProjectIds}
            />
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>

        {/* Summary Stats */}
        <SummaryStats projects={projects} />

        {/* Projects Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Projects</h2>

          {view === 'cards' ? (
            <ProjectCardsGrid projects={projects} onProjectClick={onProjectClick} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <ProjectSummaryTable
                projects={projects}
                onProjectClick={onProjectClick}
                alwaysExpanded
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
