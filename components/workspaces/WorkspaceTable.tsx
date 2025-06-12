// components/workspaces/WorkspaceTable.tsx
import React, { useState } from 'react';
import { Workspace } from '@/types/workspace';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import Link from 'next/link';

interface WorkspaceTableProps {
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  projectId: string;
  onAddWorkspace: (workspace: Workspace) => Promise<void>;
  onDeleteWorkspace: (workspaceId: number) => Promise<void>;
}

export const WorkspaceTable: React.FC<WorkspaceTableProps> = ({
  workspaces,
  isLoading,
  error,
  projectId,
  onAddWorkspace,
  onDeleteWorkspace,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddWorkspace({ name: workspaceName });
      setWorkspaceName('');
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: number) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      await onDeleteWorkspace(workspaceId);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Project Workspaces</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Workspaces available in this project.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          Add Workspace
        </Button>
      </div>
      <div className="border-t border-gray-200">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">
            Error loading workspaces.
          </div>
        ) : workspaces.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workspaces.map((workspace) => (
                <tr key={workspace.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link 
                      href={`/projects/${projectId}/workspaces/${workspace.id}`}
                      className="text-indigo-600 hover:text-indigo-900 hover:underline"
                    >
                      {workspace.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <Link 
                        href={`/projects/${projectId}/workspaces/${workspace.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Manage Users
                      </Link>
                      <button
                        onClick={() => workspace.id && handleDeleteWorkspace(workspace.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No workspaces have been added to this project.
          </div>
        )}
      </div>

      {/* Add Workspace Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Workspace</h3>
            </div>
            <form onSubmit={handleAddWorkspace}>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      name="workspace-name"
                      id="workspace-name"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Workspace
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceTable;