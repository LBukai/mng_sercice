'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { PageHeader } from '@/components/common/PageHeader';
import { useProjects } from '@/hooks/useProjects';
import { useProjectUsers } from '@/hooks/useProjectUsers';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  WorkspaceLimitBadge, 
  UserLimitBadge, 
  CostCenterBadge, 
  ProjectNumberBadge 
} from '@/components/projects/ProjectBadge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { FileTable } from '@/components/files/FileTable';
import { FileUploadModal } from '@/components/files/FileUploadModal';
import { WorkspaceTable } from '@/components/workspaces/WorkspaceTable';
import { AddProjectUsersForm } from '@/components/projects/AddProjectUsersForm';
import { ProjectUsersTable } from '@/components/projects/ProjectUsersTable';
import { UserAndRole, ProjectRole } from '@/types/projectUser';
import Link from 'next/link';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showAddWorkspaceModal, setShowAddWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  
  // Hooks for different resources
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
    workspaces,
    isLoading: workspacesLoading,
    error: workspacesError,
    addWorkspace,
    removeWorkspace
  } = useWorkspaces(projectId);
  
  const {
    files,
    loading: filesLoading,
    uploadFile,
    deleteFile
  } = useProjectFiles(projectId);

  useEffect(() => {
    const fetchData = async () => {
      if (projectId) {
        const projectData = await getProjectById(projectId);
        if (projectData) {
          setProject(projectData);
        }
        
        // Fetch project users
        await fetchProjectUsers();
      }
    };

    fetchData();
  }, [projectId, getProjectById, fetchProjectUsers]);

  const handleDeleteProject = async () => {
    if (!project?.id) return;
    
    if (window.confirm(`Are you sure you want to delete ${project.name}?`)) {
      const success = await deleteProject(project.id);
      if (success) {
        router.push('/projects');
      }
    }
  };

  const handleAddUsers = async (usersData: UserAndRole[]) => {
    const success = await addUsersToProject(usersData);
    if (success) {
      setShowAddUsersModal(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: ProjectRole) => {
    await updateUserRole(userId, role);
  };

  const handleRemoveUser = async (userId: string) => {
    await removeUserFromProject(userId);
  };

  const handleAddWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    console.log("Adding workspace:", newWorkspaceName);
    await addWorkspace({ name: newWorkspaceName });
    setNewWorkspaceName('');
    setShowAddWorkspaceModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 bg-black bg-opacity-75 text-white p-2 text-xs z-50">
          Add Workspace modal open: {showAddWorkspaceModal ? 'Yes' : 'No'} | 
          File modal open: {showFileUploadModal ? 'Yes' : 'No'} | 
          File count: {files ? files.length : 0} |
          Workspace count: {workspaces ? workspaces.length : 0}
        </div>
      )}
      
      {/* Modals */}
      <Modal
        isOpen={showAddUsersModal}
        onClose={() => setShowAddUsersModal(false)}
        title="Add Users to Project"
        size="lg"
      >
        <AddProjectUsersForm
          projectId={projectId}
          existingUsers={projectUsers.map(pu => pu.user.id as string)}
          onSubmit={handleAddUsers}
          onCancel={() => setShowAddUsersModal(false)}
        />
      </Modal>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showFileUploadModal}
        onClose={() => {
          setShowFileUploadModal(false);
        }}
        onUpload={uploadFile}
      />

      {/* Add Workspace Modal */}
      <Modal
        isOpen={showAddWorkspaceModal}
        onClose={() => setShowAddWorkspaceModal(false)}
        title="Add New Workspace"
      >
        <form onSubmit={handleAddWorkspaceSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              id="workspace-name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowAddWorkspaceModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!newWorkspaceName.trim()}
            >
              Add Workspace
            </Button>
          </div>
        </form>
      </Modal>

      <PageHeader 
        title="Project Details" 
        action={
          <div className="flex space-x-2">
            <Link
              href="/projects"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Back to Projects
            </Link>
            <Link
              href={`/projects/edit/${projectId}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Delete
            </button>
          </div>
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
          {/* Project Information - More Compact */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-3 py-3 border-b border-gray-200">
              <h3 className="text-md font-medium text-gray-900">Project Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 p-3 text-sm">
              <div className="font-medium text-gray-500">Project ID:</div>
              <div className="text-gray-900">{project.id}</div>
              
              <div className="font-medium text-gray-500">Project Name:</div>
              <div className="text-gray-900">{project.name}</div>
              
              <div className="font-medium text-gray-500">Workspace Limit:</div>
              <div><WorkspaceLimitBadge value={project.workspacecountLimit} /></div>
              
              <div className="font-medium text-gray-500">User Limit:</div>
              <div><UserLimitBadge value={project.usercountLimit} /></div>
              
              <div className="font-medium text-gray-500">Cost Center:</div>
              <div><CostCenterBadge value={project.costCenter} /></div>
              
              <div className="font-medium text-gray-500">Project Number:</div>
              <div><ProjectNumberBadge value={project.projectNumber} /></div>
              
              <div className="font-medium text-gray-500">Status:</div>
              <div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Tables Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Project Users Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-3 py-3 flex justify-between items-center border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-900">Project Users</h3>
                <Button size="sm" onClick={() => setShowAddUsersModal(true)}>
                  Add User
                </Button>
              </div>
              <div className="overflow-auto max-h-96">
                {usersLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner size="md" />
                  </div>
                ) : usersError ? (
                  <div className="p-3 text-sm text-red-600">
                    Error loading users.
                  </div>
                ) : projectUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No users assigned.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Role</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projectUsers.map((projectUser) => (
                        <tr key={projectUser.user.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {projectUser.user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-2">
                                <div className="text-xs font-medium text-gray-900">{projectUser.user.name}</div>
                                <div className="text-xs text-gray-500">{projectUser.user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="relative">
                              <select
                                value={projectUser.role}
                                onChange={(e) => {
                                  if (projectUser.user.id) {
                                    handleUpdateRole(projectUser.user.id, e.target.value as ProjectRole);
                                  }
                                }}
                                className={`px-2 py-1 text-xs font-medium rounded appearance-none cursor-pointer pr-8 ${
                                  projectUser.role === 'Project Lead' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}
                              >
                                <option value="Project Lead">Project Lead</option>
                                <option value="User">User</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-xs">
                            <button 
                              onClick={() => projectUser.user.id && handleRemoveUser(projectUser.user.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Project Workspaces Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-3 py-3 flex justify-between items-center border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-900">Workspaces</h3>
                <Button size="sm" onClick={() => setShowAddWorkspaceModal(true)}>
                  Add Workspace
                </Button>
              </div>
              <div className="overflow-auto max-h-96">
                {workspacesLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner size="md" />
                  </div>
                ) : workspacesError ? (
                  <div className="p-3 text-sm text-red-600">
                    Error loading workspaces.
                  </div>
                ) : workspaces.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No workspaces created.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {workspaces.map((workspace) => (
                        <tr key={workspace.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <Link 
                              href={`/projects/${projectId}/workspaces/${workspace.id}`}
                              className="text-xs text-indigo-600 hover:text-indigo-900 hover:underline"
                            >
                              {workspace.name}
                            </Link>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-xs">
                            <button
                              onClick={() => workspace.id && removeWorkspace(workspace.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Project Files Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-3 py-3 flex justify-between items-center border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-900">Project Files</h3>
                <Button 
                  size="sm"
                  onClick={() => setShowFileUploadModal(true)}
                >
                  Upload File
                </Button>
              </div>
              <div className="overflow-auto max-h-96">
                {filesLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner size="md" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No files uploaded.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">File Name</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-900 hover:underline"
                            >
                              {file.name}
                            </a>
                            <p className="text-xs text-gray-500">
                              {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'No date'}
                            </p>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-xs">
                            <button
                              onClick={() => deleteFile(file.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          Project not found
        </div>
      )}
    </div>
  );
}