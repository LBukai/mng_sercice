// app/projects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { PageHeader } from '@/components/common/PageHeader';
import { useProjects } from '@/hooks/useProjects';
import { useProjectUsers } from '@/hooks/useProjectUsers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  WorkspaceLimitBadge, 
  UserLimitBadge, 
  CostCenterBadge, 
  ProjectNumberBadge 
} from '@/components/projects/ProjectBadge';
import { Button, LinkButton } from '@/components/common/Button';
import Link from 'next/link';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const { isLoading: projectLoading, error: projectError, getProjectById, deleteProject } = useProjects();
  const { projectUsers, isLoading: usersLoading, error: usersError, fetchProjectUsers } = useProjectUsers(projectId);

  useEffect(() => {
    const fetchData = async () => {
      if (projectId) {
        const projectData = await getProjectById(projectId);
        if (projectData) {
          setProject(projectData);
        }
        
        // Also fetch project users
        await fetchProjectUsers();
      }
    };

    fetchData();
  }, [projectId, getProjectById, fetchProjectUsers]);

  const handleDelete = async () => {
    if (!project?.id) return;
    
    if (window.confirm(`Are you sure you want to delete ${project.name}?`)) {
      const success = await deleteProject(project.id);
      if (success) {
        router.push('/projects');
      }
    }
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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Details and configuration of the project.</p>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/projects/${project.id}/users`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Manage Users
                </Link>
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
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {/* This is a placeholder since the API doesn't provide this data */}
                    {new Date().toLocaleDateString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
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

          {/* Project Users Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Project Users</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Users with access to this project.</p>
              </div>
              <Link
                href={`/projects/${project.id}/users`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All & Manage
              </Link>
            </div>
            <div className="border-t border-gray-200">
              {usersLoading ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner size="md" />
                </div>
              ) : usersError ? (
                <div className="p-4 text-sm text-red-600">
                  Error loading project users.
                </div>
              ) : projectUsers.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {projectUsers.slice(0, 5).map((projectUser) => (
                    <li key={projectUser.user.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xl font-medium text-gray-600">
                              {projectUser.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{projectUser.user.name}</div>
                            <div className="text-sm text-gray-500">{projectUser.user.email}</div>
                          </div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            projectUser.role.role === 'project_lead' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {projectUser.role.role}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No users have been added to this project.
                </div>
              )}
              {projectUsers.length > 5 && (
                <div className="px-4 py-3 border-t border-gray-200 text-right">
                  <Link
                    href={`/projects/${project.id}/users`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All {projectUsers.length} Users →
                  </Link>
                </div>
              )}
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