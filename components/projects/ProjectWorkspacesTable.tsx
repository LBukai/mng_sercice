import { useState } from 'react';
import { Workspace } from '@/types/workspace';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Modal } from '@/components/common/Modal';
import { WorkspaceForm } from './WorkspaceForm';

interface ProjectWorkspacesTableProps {
  projectWorkspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  onAddWorkspace: (workspaceData: Omit<Workspace, 'id'>) => Promise<boolean>;
  onRemoveWorkspace?: (workspaceId: string) => Promise<boolean>; // Make it optional for backward compatibility
}

export const ProjectWorkspacesTable = ({
  projectWorkspaces,
  isLoading,
  error,
  onAddWorkspace,
  onRemoveWorkspace
}: ProjectWorkspacesTableProps) => {
  const [showAddWorkspaceModal, setShowAddWorkspaceModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddWorkspace = () => {
    setShowAddWorkspaceModal(true);
  };

  const handleCreateWorkspace = async (workspaceData: Omit<Workspace, 'id'>) => {
    setIsCreating(true);
    try {
      const success = await onAddWorkspace(workspaceData);
      if (success) {
        setShowAddWorkspaceModal(false);
      }
      return success;
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!onRemoveWorkspace) {
      console.error('onRemoveWorkspace function not provided');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the workspace "${workspaceName}"? This action cannot be undone.`)) {
      await onRemoveWorkspace(workspaceId);
    }
  };

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Workspaces</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Workspaces associated with this project.</p>
          </div>
          <button
            onClick={handleAddWorkspace}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Workspace
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-100 border-l-4 border-red-400 text-red-700">
            {error}
          </div>
        )}

        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <>
                  <SkeletonLoader type="table-row" count={3} />
                </>
              ) : projectWorkspaces.length > 0 ? (
                projectWorkspaces.map((workspace) => (
                  <tr key={workspace.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {workspace.name}
                          </div>
                          {workspace.slug && (
                            <div className="text-sm text-gray-500">
                              Slug: {workspace.slug}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a 
                        href={`/workspaces/${workspace.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </a>
                      {onRemoveWorkspace && (
                        <button 
                          onClick={() => handleRemoveWorkspace(workspace.id!, workspace.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                    No workspaces assigned to this project
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Workspace Modal */}
      <Modal 
        isOpen={showAddWorkspaceModal} 
        onClose={() => setShowAddWorkspaceModal(false)}
        title="Create New Workspace"
        size="md"
      >
        <WorkspaceForm 
          onSubmit={handleCreateWorkspace}
          onCancel={() => setShowAddWorkspaceModal(false)}
          isLoading={isCreating}
        />
      </Modal>
    </>
  );
};