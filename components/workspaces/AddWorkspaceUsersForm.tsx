import { useState, useEffect } from 'react';
import { Workspace } from '@/types/workspace';
import { ProjectUser } from '@/types/projectUser';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AddWorkspaceUsersFormProps {
  workspace: Workspace;
  existingUsers: string[]; // IDs of users already in the workspace
  onSubmit: (userIds: string[]) => Promise<boolean>;
  onCancel: () => void;
}

export const AddWorkspaceUsersForm = ({ 
  workspace,
  existingUsers, 
  onSubmit, 
  onCancel 
}: AddWorkspaceUsersFormProps) => {
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch users assigned to the project that this workspace belongs to
  useEffect(() => {
    const fetchProjectUsers = async () => {
      console.log('Workspace object:', workspace); // Debug log
      
      // First try to get the project ID from the workspace
      let projectId = workspace.project;
      
      // If workspace.project is not available, try to fetch it from the workspace details
      if (!projectId && workspace.id) {
        try {
          console.log('Fetching workspace details for ID:', workspace.id);
          const workspaceResponse = await fetch(`/api/workspaces/${workspace.id}`);
          if (workspaceResponse.ok) {
            const workspaceData = await workspaceResponse.json();
            console.log('Fetched workspace data:', workspaceData); // Debug log
            projectId = workspaceData.project || workspaceData.project_id || workspaceData.projectId;
          }
        } catch (err) {
          console.error('Failed to fetch workspace details:', err);
        }
      }
      
      // If still no project ID, we need to find another way
      // Let's check if we came from a project page and can get it from the URL or context
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
        
        console.log('Fetching users for project:', projectId);
        const response = await fetch(`/api/projects/${projectId}/users`);
        if (!response.ok) {
          throw new Error('Failed to fetch project users');
        }
        
        const users = await response.json();
        console.log('Fetched project users:', users);
        
        // Filter out users that are already in the workspace
        const availableUsers = users.filter((projectUser: ProjectUser) => 
          !existingUsers.includes(projectUser.user.id as string)
        );
        
        setProjectUsers(availableUsers);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching project users:', err);
        setError(`Failed to fetch project users: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectUsers();
  }, [workspace, existingUsers]); // Include workspace in dependencies

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to add to the workspace');
      return;
    }
    
    await onSubmit(selectedUsers);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Add Users to Workspace</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Users from Project
          </label>
          
          {isLoading ? (
            <div className="py-4 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : projectUsers.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-sm">
              {workspace.project 
                ? "No available users from this project to add to the workspace."
                : "This workspace is not associated with a project."
              }
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
              {projectUsers.map(projectUser => (
                <div key={projectUser.user.id} className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-md">
                  <input
                    type="checkbox"
                    id={`user-${projectUser.user.id}`}
                    checked={selectedUsers.includes(String(projectUser.user.id))}
                    onChange={() => handleUserToggle(String(projectUser.user.id))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`user-${projectUser.user.id}`} className="ml-3 block text-sm text-gray-700 cursor-pointer">
                    <div className="font-medium">{projectUser.user.name}</div>
                    <div className="text-gray-500 text-xs">
                      {projectUser.user.email} • {projectUser.user.username}
                      <span className="ml-2 text-blue-600">
                        ({typeof projectUser.role === 'string' ? projectUser.role : projectUser.role.role})
                      </span>
                    </div>
                  </label>
                </div>
              ))}
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
            disabled={selectedUsers.length === 0 || isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Selected Users
          </button>
        </div>
      </form>
    </div>
  );
};