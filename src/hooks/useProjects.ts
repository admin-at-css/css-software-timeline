import { useState, useMemo, useCallback, useEffect } from 'react';
import type { ProjectData, FilterState, ProjectStatus, Priority } from '../types/project';
import projectsData from '../data/projects.json';

// LocalStorage key for persisted projects
const STORAGE_KEY = 'css-timeline-imported-projects';

// Initial projects from JSON file
const initialProjects = projectsData as unknown as ProjectData[];
const initialProjectIds = new Set(initialProjects.map((p) => p.project.id));

// Load imported projects from localStorage
function loadImportedProjects(): ProjectData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load imported projects from localStorage:', err);
  }
  return [];
}

// Save imported projects to localStorage
function saveImportedProjects(projects: ProjectData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save imported projects to localStorage:', err);
  }
}

export function useProjects() {
  const [filter, setFilter] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    search: '',
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Track imported projects separately (for persistence)
  const [importedProjects, setImportedProjects] = useState<ProjectData[]>(() =>
    loadImportedProjects()
  );

  // Combined projects: initial JSON + imported
  const projects = useMemo(() => {
    // Filter out any imported projects that might conflict with initial ones
    const uniqueImported = importedProjects.filter(
      (p) => !initialProjectIds.has(p.project.id)
    );
    return [...initialProjects, ...uniqueImported];
  }, [importedProjects]);

  // Persist imported projects whenever they change
  useEffect(() => {
    saveImportedProjects(importedProjects);
  }, [importedProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const project = p.project;

      // Status filter
      if (filter.status !== 'all' && project.status !== filter.status) {
        return false;
      }

      // Priority filter
      if (filter.priority !== 'all' && project.priority !== filter.priority) {
        return false;
      }

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const nameMatch = project.name.toLowerCase().includes(searchLower);
        const descMatch = project.description?.toLowerCase().includes(searchLower);
        if (!nameMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [projects, filter]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.project.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const setStatusFilter = (status: ProjectStatus | 'all') => {
    setFilter((prev) => ({ ...prev, status }));
  };

  const setPriorityFilter = (priority: Priority | 'all') => {
    setFilter((prev) => ({ ...prev, priority }));
  };

  const setSearchFilter = (search: string) => {
    setFilter((prev) => ({ ...prev, search }));
  };

  // Add a new project (from YAML import)
  const addProject = useCallback((newProject: ProjectData) => {
    setImportedProjects((prev) => [...prev, newProject]);
  }, []);

  // Remove a project by ID (only works for imported projects)
  const removeProject = useCallback((projectId: string) => {
    // Can only remove imported projects, not initial ones
    if (initialProjectIds.has(projectId)) {
      console.warn('Cannot remove initial project:', projectId);
      return;
    }
    setImportedProjects((prev) => prev.filter((p) => p.project.id !== projectId));
    // Clear selection if removed project was selected
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  }, [selectedProjectId]);

  // Update an existing project (for imported projects)
  const updateProject = useCallback((updatedProject: ProjectData) => {
    const projectId = updatedProject.project.id;
    // Check if it's an imported project
    setImportedProjects((prev) => {
      const exists = prev.some((p) => p.project.id === projectId);
      if (exists) {
        // Update existing imported project
        return prev.map((p) =>
          p.project.id === projectId ? updatedProject : p
        );
      } else {
        // If updating an initial project, add it to imported (override)
        return [...prev, updatedProject];
      }
    });
  }, []);

  // Get list of project IDs (for duplicate checking)
  const projectIds = useMemo(() => {
    return projects.map((p) => p.project.id);
  }, [projects]);

  return {
    projects,
    filteredProjects,
    filter,
    setStatusFilter,
    setPriorityFilter,
    setSearchFilter,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    // New project management functions
    addProject,
    removeProject,
    updateProject,
    projectIds,
  };
}
