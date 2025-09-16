// app/projects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Project } from '@/types/project';
import { Workspace } from '@/types/workspace';
import { ArchGPTWorkspaceRequest } from '@/types/archgpt';
import { PageHeader } from '@/components/common/PageHeader';
import { useProjects } from '@/hooks/useProjects';
import { useProjectUsers } from '@/hooks/useProjectUsers';
import { useProjectWorkspaces } from '@/hooks/useProjectWorkspaces';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { useProjectModels } from '@/hooks/useProjectModels';
import { useArchGPT } from '@/hooks/useArchGPT';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  WorkspaceLimitBadge, 
  UserLimitBadge, 
  CostCenterBadge, 
  ProjectNumberBadge 
} from '@/components/projects/ProjectBadge';
import { ProjectUsersTable } from '@/components/projects/ProjectUsersTable';
import { ProjectWorkspacesTable } from '@/components/projects/ProjectWorkspacesTable';
import { ProjectFilesTable } from '@/components/projects/ProjectFilesTable';
import { ProjectModelsTable } from '@/components/projects/ProjectModelsTable';
import { Modal } from '@/components/common/Modal';
import { AddProjectUsersForm } from '@/components/projects/AddProjectUsersForm';
import Link from 'next/link';

// ArchGPT Badge Component
const ArchGPTBadge = () => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
    ArchGPT
  </span>
);

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  
  const isAdmin = session?.user?.isAdmin || false;
  
  // Hooks for data management
  const { isLoading: projectLoading, error: projectError, getProjectById, deleteProject } = useProjects();
  const { 
    projectUsers, 
    isLoading: usersLoading, 
    error: usersError, 
    fetchProjectUsers,
    addUsersToProject,
    updateUserRole,
    removeUserFromProject
  } = useProjectUsers(projectId);
  
  const {
    projectWorkspaces,
    isLoading: workspacesLoading,
    error: workspacesError,
    fetchProjectWorkspaces,
    addWorkspacesToProject,
    removeWorkspaceFromProject
  } = useProjectWorkspaces(projectId);
  
  const {
    projectFiles,
    isLoading: filesLoading,
    error: filesError,
    fetchProjectFiles,
    uploadFilesToProject,
    updateFileTTL,
    removeFileFromProject
  } = useProjectFiles(projectId);

  const {
    projectModels,
    isLoading: modelsLoading,
    error: modelsError,
    fetchProjectModels,
    updateProjectModels
  } = useProjectModels(projectId);

  const { createArchGPTWorkspace } = useArchGPT();

  useEffect(() => {
    const fetchData = async () => {
      if (projectId) {
        const projectData = await getProjectById(projectId);
        if (projectData) {
          setProject(projectData);
        }
        
        // Fetch all related data
        await Promise.all([
          fetchProjectUsers(),
          fetchProjectWorkspaces(),
          fetchProjectFiles(),
          fetchProjectModels()
        ]);
      }
    };

    fetchData();
  }, [projectId, getProjectById, fetchProjectUsers, fetchProjectWorkspaces, fetchProjectFiles, fetchProjectModels]);

  const handleDelete = async () => {
    if (!project?.id) return;
    
    if (window.confirm(`Are you sure you want to delete ${project.name}?`)) {
      const success = await deleteProject(project.id);
      if (success) {
        router.push('/projects');
      }
    }
  };

  const handleAddWorkspace = async (workspaceData: Omit<Workspace, 'id'>) => {
    return await addWorkspacesToProject([workspaceData]);
  };

  const handleAddArchGPTWorkspace = async (workspaceData: ArchGPTWorkspaceRequest) => {
    const success = await createArchGPTWorkspace(projectId, workspaceData);
    if (success) {
      // Refresh workspaces list
      await fetchProjectWorkspaces();
    }
    return success;
  };

  const handleUpdateProjectModels = async (modelIds: number[]) => {
    return await updateProjectModels(modelIds);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Project Details" 
        action={
          <Link
            href="/my-projects"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Back to Projects
          </Link>
        }
      />
      
      {projectLoading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : projectError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {projectError}
        </div>
      ) : project ? (
        <>
          {/* Project Information Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
                  {project.is_archgpt && <ArchGPTBadge />}
                </div>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Details and configuration of the project.
                  {project.is_archgpt && ' This is an ArchGPT-enabled project with enhanced AI capabilities.'}
                </p>
              </div>
              {isAdmin && (
                <div className="flex space-x-2">
                  <Link
                    href={`/projects/edit/${project.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Project ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{project.id}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Project Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      {project.name}
                      {project.is_archgpt && <ArchGPTBadge />}
                    </div>
                  </dd>
                </div>
                {project.is_archgpt && (
                  <div className="bg-purple-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-purple-700">ArchGPT Status</dt>
                    <dd className="mt-1 text-sm text-purple-900 sm:mt-0 sm:col-span-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Enabled - This project has access to advanced ArchGPT features and specialized AI workflows.
                      </div>
                    </dd>
                  </div>
                )}
                {project.workspacecountLimit && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Workspace Limit</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <WorkspaceLimitBadge value={project.workspacecountLimit} />
                    </dd>
                  </div>
                )}
                {project.usercountLimit && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">User Limit</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <UserLimitBadge value={project.usercountLimit} />
                    </dd>
                  </div>
                )}
                {project.costCenter && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Cost Center</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <CostCenterBadge value={project.costCenter} />
                    </dd>
                  </div>
                )}
                {project.projectNumber && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Project Number</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <ProjectNumberBadge value={project.projectNumber} />
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

          {/* Project Models Table - Only show for admins */}
          {isAdmin && (
            <div className="mb-6">
              <ProjectModelsTable
                projectModels={projectModels}
                isLoading={modelsLoading}
                error={modelsError}
                onUpdateModels={handleUpdateProjectModels}
                isAdmin={isAdmin}
              />
            </div>
          )}

          {/* Project Users Table */}
          <div className="mb-6">
            <ProjectUsersTable
              projectUsers={projectUsers}
              isLoading={usersLoading}
              error={usersError}
              onUserRoleUpdate={updateUserRole}
              onUserRemove={removeUserFromProject}
              onAddUsers={() => setShowAddUsersModal(true)}
            />
          </div>

          {/* Project Workspaces Table */}
          <div className="mb-6">
            <ProjectWorkspacesTable
              projectWorkspaces={projectWorkspaces}
              projectModels={projectModels}
              isLoading={workspacesLoading}
              error={workspacesError}
              onAddWorkspace={handleAddWorkspace}
              onAddArchGPTWorkspace={handleAddArchGPTWorkspace}
              onRemoveWorkspace={removeWorkspaceFromProject}
            />
          </div>

          {/* Project Files Table */}
          <div className="mb-6">
            <ProjectFilesTable
              projectFiles={projectFiles}
              isLoading={filesLoading}
              error={filesError}
              onUploadFiles={uploadFilesToProject}
              onUpdateFileTTL={updateFileTTL}
              onRemoveFile={removeFileFromProject}
            />
          </div>

          {/* Add Users Modal */}
          <Modal 
            isOpen={showAddUsersModal} 
            onClose={() => setShowAddUsersModal(false)}
            title="Add Users to Project"
            size="md"
          >
            <AddProjectUsersForm 
              onSubmit={async (usersData) => {
                const success = await addUsersToProject(usersData);
                if (success) {
                  setShowAddUsersModal(false);
                }
                return success;
              }}
              onCancel={() => setShowAddUsersModal(false)} 
              projectId={projectId} 
              existingUsers={projectUsers.map(pu => pu.user.id as string)}            
            />
          </Modal>
        </>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          Project not found
        </div>
      )}
    </div>
  );
}