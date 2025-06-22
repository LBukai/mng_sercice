'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { ProjectUsersTable } from '@/components/projects/ProjectUsersTable';
import { AddProjectUsersForm } from '@/components/projects/AddProjectUsersForm';
import { useProjectUsers } from '@/hooks/useProjectUsers';
import { useProjects } from '@/hooks/useProjects';
import { Modal } from '@/components/common/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProjectRole, UserAndRole } from '@/types/projectUser';
import Link from 'next/link';

export default function ProjectUsersPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
  
  const { 
    projectUsers, 
    isLoading, 
    error, 
    fetchProjectUsers, 
    addUsersToProject, 
    updateUserRole, 
    removeUserFromProject 
  } = useProjectUsers(projectId);
  
  const { getProjectById } = useProjects();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project users
        await fetchProjectUsers();
        
        // Fetch project details to get the name
        const projectData = await getProjectById(projectId);
        if (projectData) {
          setProjectName(projectData.name);
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, fetchProjectUsers, getProjectById]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title={`Project Users: ${projectName}`} 
        action={
          <div className="space-x-2">
            <Link
              href={`/projects/${projectId}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Back to Project
            </Link>
            <button
              onClick={() => setShowAddUsersModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add Users
            </button>
          </div>
        }
      />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading && projectUsers.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ProjectUsersTable 
            projectUsers={projectUsers} 
            isLoading={isLoading}
            onUpdateRole={handleUpdateRole}
            onRemoveUser={handleRemoveUser}
          />
        )}
      </div>
      
      {/* Add Users Modal */}
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
    </div>
  );
}