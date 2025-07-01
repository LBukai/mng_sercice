// app/projects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { Workspace } from '@/types/workspace';
import { PageHeader } from '@/components/common/PageHeader';
import { useProjects } from '@/hooks/useProjects';
import { useProjectUsers } from '@/hooks/useProjectUsers';
import { useProjectWorkspaces } from '@/hooks/useProjectWorkspaces';
import { useProjectFiles } from '@/hooks/useProjectFiles';
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
import { Modal } from '@/components/common/Modal';
import { AddProjectUsersForm } from '@/components/projects/AddProjectUsersForm';
import Link from 'next/link';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  
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
    uploadFilesToProject
  } = useProjectFiles(projectId);

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
          fetchProjectFiles()
        ]);
      }
    };

    fetchData();
  }, [projectId, getProjectById, fetchProjectUsers, fetchProjectWorkspaces, fetchProjectFiles]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Project Details" 
        action={
          <Link
            href="/projects"
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
                <h3 className="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Details and configuration of the project.</p>
              </div>
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
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Project ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{project.id}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Project Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{project.name}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Workspace Limit</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <WorkspaceLimitBadge value={project.workspacecountLimit} />
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">User Limit</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <UserLimitBadge value={project.usercountLimit} />
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Cost Center</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <CostCenterBadge value={project.costCenter} />
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Project Number</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <ProjectNumberBadge value={project.projectNumber} />
                  </dd>
                </div>
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
              isLoading={workspacesLoading}
              error={workspacesError}
              onAddWorkspace={handleAddWorkspace}
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
                  } }
                  onCancel={() => setShowAddUsersModal(false)} projectId={''} existingUsers={[]}            />
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