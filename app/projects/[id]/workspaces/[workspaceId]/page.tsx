// app/projects/[id]/workspaces/[workspaceId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useWorkspaceUsers } from '@/hooks/useWorkspaceUsers';
import { useWorkspaceFiles } from '@/hooks/useWorkspaceFiles';
import { useUsers } from '@/hooks/useUsers';
import { Workspace } from '@/types/workspace';
import { getWorkspace, updateWorkspace } from '@/services/workspaceApi';
import { useAlert } from '@/contexts/AlertContext';
import WorkspaceUsersTable from '@/components/workspaces/WorkspaceUsersTable';
import WorkspaceFilesTable from '@/components/workspaces/WorkspaceFilesTable';
import AddFilesToWorkspaceModal from '@/components/workspaces/AddFilesToWorkspaceModal';
import Link from 'next/link';

export default function WorkspaceDetailsPage() {
  // Use React.use() for params in the future
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const workspaceId = parseInt(params.workspaceId as string, 10);
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showAddFilesModal, setShowAddFilesModal] = useState(false);
  const { showAlert } = useAlert();

  // Get workspace users and all users
  const { 
    workspaceUsers, 
    isLoading: usersLoading, 
    error: usersError, 
    addUsers, 
    removeUser, 
    updateUserRole 
  } = useWorkspaceUsers(workspaceId);
  
  // Get workspace files
  const {
    files: workspaceFiles,
    loading: filesLoading,
    error: filesError,
    addFiles,
    removeFile
  } = useWorkspaceFiles(workspaceId);
  
  const {
    users: allUsers,
    isLoading: allUsersLoading,
    fetchUsers,
  } = useUsers();

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchWorkspace = async () => {
      setIsLoading(true);
      try {
        const data = await getWorkspace(workspaceId);
        setWorkspace(data);
        setEditedName(data.name);
      } catch (error) {
        console.error('Error fetching workspace:', error);
        showAlert('error', 'Failed to fetch workspace details');
      } finally {
        setIsLoading(false);
      }
    };

    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId, showAlert]);

  const handleUpdateWorkspace = async () => {
    if (!workspace) return;
    
    try {
      await updateWorkspace(workspaceId, { name: editedName });
      setWorkspace({ ...workspace, name: editedName });
      setIsEditing(false);
      showAlert('success', 'Workspace updated successfully');
    } catch (error) {
      console.error('Error updating workspace:', error);
      showAlert('error', 'Failed to update workspace');
    }
  };

  const handleAddFiles = async (fileIds: string[]): Promise<boolean> => {
    console.log("Adding files:", fileIds);
    const result = await addFiles(fileIds);
    return result;
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        Workspace not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Workspace Details" 
        action={
          <Link
            href={`/projects/${projectId}`}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Back to Project
          </Link>
        }
      />
      
      {/* Workspace Info Card */}
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Workspace Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details and configuration of the workspace.</p>
          </div>
          {isEditing ? (
            <div className="flex space-x-2">
              <Button
                onClick={handleUpdateWorkspace}
                className="bg-green-600 hover:bg-green-700"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(workspace.name);
                }}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit
            </Button>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Workspace ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{workspace.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Workspace Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  workspace.name
                )}
              </dd>
            </div>
            {workspace.slug && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900">{workspace.slug}</dd>
              </div>
            )}
            {workspace.project && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Project</dt>
                <dd className="mt-1 text-sm text-gray-900">{workspace.project}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Workspace Files Table */}
      <WorkspaceFilesTable
        files={workspaceFiles || []}
        isLoading={filesLoading}
        error={filesError}
        onRemoveFile={removeFile}
        onAddFiles={() => {
          console.log("Add Files button clicked");
          setShowAddFilesModal(true);
        }}
      />

      {/* Workspace Users Table */}
      <WorkspaceUsersTable
        workspaceUsers={workspaceUsers}
        projectUsers={allUsers}
        isLoading={usersLoading || allUsersLoading}
        error={usersError}
        onAddUsers={addUsers}
        onRemoveUser={removeUser}
        onUpdateRole={updateUserRole}
      />

      {/* Add Files Modal */}
      <AddFilesToWorkspaceModal
        isOpen={showAddFilesModal}
        onClose={() => setShowAddFilesModal(false)}
        onSubmit={handleAddFiles}
        projectId={projectId}
        existingFileIds={(workspaceFiles || []).map(file => file.id)}
      />
      
      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 bg-black bg-opacity-75 text-white p-2 text-xs z-50">
          Modal open: {showAddFilesModal ? 'Yes' : 'No'} | 
          Files count: {workspaceFiles ? workspaceFiles.length : 0}
        </div>
      )}
    </div>
  );
}