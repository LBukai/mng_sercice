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
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users assigned to the project that this workspace belongs to
  useEffect(() => {
    const fetchProjectUsers = async () => {
      
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
      
      if (!projectId) {
        console.error('No project ID found. Workspace:', workspace);
        setError('Cannot determine which project this workspace belongs to. Please navigate to this workspace from its project page.');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/projects/${projectId}/users`);
        if (!response.ok) {
          throw new Error('Failed to fetch project users');
        }
        
        const users = await response.json();
        
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

  // Filter users based on search term
  const filteredUsers = projectUsers.filter(projectUser => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    const user = projectUser.user;
    return (
      (user.name || '').toLowerCase().includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      (user.username || '').toLowerCase().includes(search) ||
      String(user.id || '').toLowerCase().includes(search)
    );
  });

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
    
    const success = await onSubmit(selectedUsers);
    if (success) {
      // Reset form on success
      setSelectedUsers([]);
      setSearchTerm('');
      setError(null);
    }
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
          
          {/* Search Bar */}
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name, email, or username..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <p className="mt-1 text-sm text-gray-600">
                Showing {filteredUsers.length} of {projectUsers.length} available users
              </p>
            )}
          </div>
          
          {isLoading ? (
            <div className="py-4 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-sm">
              {searchTerm 
                ? `No users found matching "${searchTerm}"`
                : workspace.project 
                ? "No available users from this project to add to the workspace."
                : "This workspace is not associated with a project."
              }
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
              {filteredUsers.map(projectUser => (
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
                      {projectUser.user.email && `${projectUser.user.email} • `}
                      {projectUser.user.username}
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
            Add Selected Users ({selectedUsers.length})
          </button>
        </div>
      </form>
    </div>
  );
};