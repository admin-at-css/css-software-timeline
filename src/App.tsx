import { useRef } from 'react';
import { useProjects } from './hooks/useProjects';
import { Header } from './components/Layout/Header';
import { FilterBar } from './components/Layout/FilterBar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ProjectList } from './components/ProjectList/ProjectList';
import { ProjectView } from './components/ProjectView/ProjectView';
import { ExportButton } from './components/Export/ExportButton';

export default function App() {
  const exportRef = useRef<HTMLDivElement>(null);

  const {
    projects,
    filteredProjects,
    filter,
    setStatusFilter,
    setPriorityFilter,
    setSearchFilter,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    addProject,
    updateProject,
    projectIds,
  } = useProjects();

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
  };

  // Determine if we're in Dashboard view or Project view
  const isDashboardView = selectedProjectId === null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header totalProjects={projects.length} />

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <FilterBar
          statusFilter={filter.status}
          priorityFilter={filter.priority}
          searchFilter={filter.search}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onSearchChange={setSearchFilter}
        />
        {!isDashboardView && (
          <ExportButton targetRef={exportRef} filename="css-software-timeline" />
        )}
      </div>

      <main className="flex-1 flex overflow-hidden">
        {isDashboardView ? (
          /* Dashboard View - Full Width */
          <DashboardView
            projects={filteredProjects}
            onProjectClick={handleProjectClick}
            onImportProject={addProject}
            onUpdateProject={updateProject}
            existingProjectIds={projectIds}
          />
        ) : (
          /* Project View - Sidebar + Content */
          <>
            {/* Left Sidebar - Project List */}
            <ProjectList
              projects={filteredProjects}
              selectedProjectId={selectedProjectId}
              onProjectClick={handleProjectClick}
              onBackToDashboard={handleBackToDashboard}
            />

            {/* Center - Project View with Tabs */}
            <div ref={exportRef} className="flex-1 flex flex-col overflow-hidden">
              {selectedProject && (
                <ProjectView
                  project={selectedProject}
                  onBackToDashboard={handleBackToDashboard}
                  onUpdateProject={updateProject}
                  existingProjectIds={projectIds}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
