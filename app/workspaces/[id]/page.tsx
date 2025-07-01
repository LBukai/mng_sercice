'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Workspace } from '@/types/workspace';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { WorkspaceUsersTable } from '@/components/workspaces/WorkspaceUsersTable';
import { WorkspaceFilesTable } from '@/components/workspaces/WorkspaceFilesTable';
import { useWorkspaceUsers } from '@/hooks/useWorkspaceUsers';
import { useWorkspaceFiles } from '@/hooks/useWorkspaceFiles';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import Link from 'next/link';

export default function WorkspaceDetailsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  
  // Hooks for data management
  const { isLoading: workspaceLoading, error: workspaceError, getWorkspaceById } = useWorkspaces();
  const {
    workspaceUsers,
    isLoading: usersLoading,
    error: usersError,
    fetchWorkspaceUsers,
    addUsersToWorkspace,
    removeUserFromWorkspace
  } = useWorkspaceUsers(workspaceId);
  
  const {
    workspaceFiles,
    isLoading: filesLoading,
    error: filesError,
    fetchWorkspaceFiles,
    addFilesToWorkspace,
    removeFileFromWorkspace
  } = useWorkspaceFiles(workspaceId);

  useEffect(() => {
    const fetchData = async () => {
      if (workspaceId) {
        const workspaceData = await getWorkspaceById(workspaceId);
        if (workspaceData) {
          setWorkspace(workspaceData);
        }
        
        // Fetch all related data
        await Promise.all([
          fetchWorkspaceUsers(),
          fetchWorkspaceFiles()
        ]);
      }
    };

    fetchData();
  }, [workspaceId, getWorkspaceById, fetchWorkspaceUsers, fetchWorkspaceFiles]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Workspace Details" 
        action={
          <Link
            href="/projects"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Back to Projects
          </Link>
        }
      />
      
      {workspaceLoading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : workspaceError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {workspaceError}
        </div>
      ) : workspace ? (
        <>
          {/* Workspace Information Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Workspace Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Details and configuration of the workspace.</p>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Workspace ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{workspace.id}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Workspace Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{workspace.name}</dd>
                </div>
                {workspace.slug && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Workspace Slug</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{workspace.slug}</dd>
                  </div>
                )}
                {workspace.project && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Project</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <Link 
                        href={`/projects/${workspace.project}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {workspace.project}
                      </Link>
                    </dd>
                  </div>
                )}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 sm:mt-0 sm:col-span-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Workspace Users Table */}
          <div className="mb-6">
            <WorkspaceUsersTable
              workspaceUsers={workspaceUsers}
              workspace={workspace}
              isLoading={usersLoading}
              error={usersError}
              onUserRemove={removeUserFromWorkspace}
              onAddUsers={addUsersToWorkspace}
            />
          </div>
          {/* Workspace Files Table */}
          <div className="mb-6">
            <WorkspaceFilesTable
              workspaceFiles={workspaceFiles}
              workspace={workspace}
              isLoading={filesLoading}
              error={filesError}
              onFileRemove={removeFileFromWorkspace}
              onAddFiles={addFilesToWorkspace}
            />
          </div>
        </>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          Workspace not found
        </div>
      )}
    </div>
  );
}