import { useState, useEffect } from 'react';
import { File } from '@/types/file';
import { Workspace } from '@/types/workspace';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AddWorkspaceFilesFormProps {
  workspace: Workspace;
  existingFiles: string[]; // IDs of files already in the workspace
  onSubmit: (fileIds: string[]) => Promise<boolean>;
  onCancel: () => void;
}

export const AddWorkspaceFilesForm = ({ 
  workspace,
  existingFiles, 
  onSubmit, 
  onCancel 
}: AddWorkspaceFilesFormProps) => {
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Fetch files assigned to the project that this workspace belongs to
  useEffect(() => {
    const fetchProjectFiles = async () => {
      
      // First try to get the project ID from the workspace
      let projectId = workspace.project_id;
      
      // If workspace.project is not available, try to fetch it from the workspace details
      if (!projectId && workspace.id) {
        try {
          const workspaceResponse = await fetch(`/api/workspaces/${workspace.id}`);
          if (workspaceResponse.ok) {
            const workspaceData = await workspaceResponse.json();
            projectId = workspaceData.project || workspaceData.project_id || workspaceData.projectId;
          }
        } catch (err) {
          console.error('Failed to fetch workspace details:', err);
        }
      }
      
      // If still no project ID, we need to find another way
      if (!projectId) {
        // Try to get project ID from the current URL or referrer
        const urlParams = new URLSearchParams(window.location.search);
        const projectFromUrl = urlParams.get('project') || urlParams.get('projectId');
        if (projectFromUrl) {
          projectId = projectFromUrl;
        }
      }
      
      if (!projectId) {
        console.error('No project ID found. Workspace:', workspace);
        setError('Cannot determine which project this workspace belongs to. Please navigate to this workspace from its project page.');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/projects/${projectId}/files`);
        if (!response.ok) {
          throw new Error('Failed to fetch project files');
        }
        
        const files = await response.json();
        
        // Filter out files that are already in the workspace
        const availableFiles = files.filter((file: File) => 
          !existingFiles.includes(file.id as string)
        );
        
        setProjectFiles(availableFiles);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching project files:', err);
        setError(`Failed to fetch project files: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectFiles();
  }, [workspace, existingFiles]); // Include workspace in dependencies

  const handleFileToggle = (fileId: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to add to the workspace');
      return;
    }
    
    await onSubmit(selectedFiles);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Add Files to Workspace</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Files from Project
          </label>
          
          {isLoading ? (
            <div className="py-4 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : projectFiles.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-sm">
              No available files from the associated project to add to the workspace.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TTL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projectFiles.map(file => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          id={`file-${file.id}`}
                          checked={selectedFiles.includes(String(file.id))}
                          onChange={() => handleFileToggle(String(file.id))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <label htmlFor={`file-${file.id}`} className="cursor-pointer">
                          <div className="text-sm font-medium text-gray-900">{file.name}</div>
                          <div className="text-xs text-gray-500">ID: {file.id}</div>
                        </label>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {formatDate(file.created_at)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {file.ttl ? formatDate(file.ttl) : 'No expiry'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={selectedFiles.length === 0 || isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Selected Files
          </button>
        </div>
      </form>
    </div>
  );
};