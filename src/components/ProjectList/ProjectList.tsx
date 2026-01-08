import type { ProjectData } from '../../types/project';
import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  projects: ProjectData[];
  selectedProjectId: string | null;
  onProjectClick: (projectId: string) => void;
  onBackToDashboard?: () => void;
}

export function ProjectList({
  projects,
  selectedProjectId,
  onProjectClick,
  onBackToDashboard,
}: ProjectListProps) {
  return (
    <div className="w-[280px] flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Dashboard Button */}
      {onBackToDashboard && (
        <button
          onClick={onBackToDashboard}
          className="mx-3 mt-3 flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </button>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white mt-2">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Projects
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {projects.length} {projects.length === 1 ? 'project' : 'projects'}
        </p>
      </div>

      {/* Project Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No projects match your filters
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.project.id}
              project={project}
              isSelected={selectedProjectId === project.project.id}
              onClick={() => onProjectClick(project.project.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
