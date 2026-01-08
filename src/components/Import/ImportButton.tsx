import { useState, useRef, useCallback } from 'react';
import { parseTimelineFile, type ParseResult } from '../../utils/yamlParser';
import type { ProjectData } from '../../types/project';

interface ImportButtonProps {
  onImport: (project: ProjectData) => void;
  onUpdate?: (project: ProjectData) => void;
  existingProjectIds: string[];
}

type ImportState = 'idle' | 'dragging' | 'parsing' | 'success' | 'error' | 'confirm_update';

export function ImportButton({ onImport, onUpdate, existingProjectIds }: ImportButtonProps) {
  const [state, setState] = useState<ImportState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingProject, setPendingProject] = useState<ProjectData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Check file extension
      if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
        setError('Please select a .yaml or .yml file');
        setState('error');
        return;
      }

      setState('parsing');
      setError(null);

      const result: ParseResult = await parseTimelineFile(file);

      if (!result.success || !result.data) {
        setError(result.error || 'Unknown error parsing file');
        setState('error');
        return;
      }

      // Check for duplicate project ID
      if (existingProjectIds.includes(result.data.project.id)) {
        // Ask user if they want to update
        setPendingProject(result.data);
        setState('confirm_update');
        return;
      }

      setState('success');
      onImport(result.data);

      // Reset after brief success message
      setTimeout(() => {
        setShowModal(false);
        setState('idle');
        setError(null);
      }, 1500);
    },
    [onImport, existingProjectIds]
  );

  const handleConfirmUpdate = useCallback(() => {
    if (pendingProject && onUpdate) {
      onUpdate(pendingProject);
      setState('success');
      setPendingProject(null);

      setTimeout(() => {
        setShowModal(false);
        setState('idle');
      }, 1500);
    }
  }, [pendingProject, onUpdate]);

  const handleCancelUpdate = useCallback(() => {
    setPendingProject(null);
    setState('idle');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setState('idle');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState('dragging');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState('idle');
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFile]
  );

  const handleButtonClick = () => {
    setShowModal(true);
    setState('idle');
    setError(null);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleButtonClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        Import YAML
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (state !== 'parsing') {
                setShowModal(false);
                setState('idle');
                setError(null);
              }
            }}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Import Project</h3>
              <button
                onClick={() => {
                  if (state !== 'parsing') {
                    setShowModal(false);
                    setState('idle');
                    setError(null);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  state === 'dragging'
                    ? 'border-blue-500 bg-blue-50'
                    : state === 'success'
                      ? 'border-green-500 bg-green-50'
                      : state === 'error'
                        ? 'border-red-300 bg-red-50'
                        : state === 'confirm_update'
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {state === 'parsing' ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">Parsing YAML file...</p>
                  </div>
                ) : state === 'success' ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-green-700">Project updated successfully!</p>
                  </div>
                ) : state === 'confirm_update' && pendingProject ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Project Already Exists</p>
                    <p className="text-sm text-gray-600 text-center">
                      <strong>{pendingProject.project.name}</strong> is already in your dashboard.
                      <br />Do you want to update it with this file?
                    </p>
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={handleCancelUpdate}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmUpdate}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Update Project
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Drag and drop your <code className="text-blue-600">timeline.yaml</code> file here
                    </p>
                    <p className="text-xs text-gray-400 mb-4">or</p>
                    <button
                      onClick={handleBrowseClick}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex gap-2">
                    <svg
                      className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">Import Failed</p>
                      <p className="text-sm text-red-600 mt-0.5">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Help Text */}
              <p className="mt-4 text-xs text-gray-500 text-center">
                Need the schema?{' '}
                <a
                  href="https://github.com/admin-at-css/css-software-timeline/blob/main/docs/timeline-yaml-schema.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View documentation
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
